// ==UserScript==
// @name         타입캐스트 통합 도우미
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  타입캐스트에서 캐릭터 검색/추가 및 대본 자동화 기능을 통합
// @author       Your Name
// @match        https://app.typecast.ai/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    /***********************************************
     * 공통 변수 및 유틸리티 함수
     ***********************************************/
    // 전역 상태 변수
    let isCharacterUIVisible = true;
    let isScriptMinimized = false;
    let searchingCharacter = false;
    let retryCount = 0;
    const MAX_RETRIES = 5;

    // 검색 대기열 관련 변수
    let searchQueue = [];
    let isProcessingQueue = false;
    let currentQueueIndex = 0;

    // 대본 처리 관련 변수
    let isScriptRunning = false;
    let scriptProcessTimeout = null;
    let currentLineIndex = 0;
    let parsedLines = [];

    // 이미 처리된 캐릭터를 저장하는 객체
    let processedCharacters = {};

    // 현재 선택된 입력 방법과 엔터 방법
    let currentInputMethod = 1;
    let currentEnterMethod = 1;
    let methodRetried = false;

    // DOM 요소가 로드될 때까지 기다리는 함수
    function waitForElement(selector, maxWaitTime = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            // 이미 존재하는 경우 바로 반환
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            // DOM 변화 감지하여 요소 찾기
            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                } else if (Date.now() - startTime > maxWaitTime) {
                    observer.disconnect();
                    reject(`요소를 찾지 못했습니다: ${selector} (${maxWaitTime}ms 초과)`);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true
            });

            // 타임아웃 설정
            setTimeout(() => {
                if (!document.querySelector(selector)) {
                    observer.disconnect();
                    reject(`요소를 찾지 못했습니다: ${selector} (${maxWaitTime}ms 초과)`);
                }
            }, maxWaitTime);
        });
    }

    // 지연 함수
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 상태 메시지 업데이트 (통합)
    function updateStatus(message, isError = false) {
        const statusDiv = document.getElementById('tc-status-message');
        if (!statusDiv) return;

        const timestamp = new Date().toLocaleTimeString();
        statusDiv.innerHTML = `<div style="color: ${isError ? '#f44336' : '#666'}">[${timestamp}] ${message}</div>` + statusDiv.innerHTML;
        if (statusDiv.childNodes.length > 15) {
            statusDiv.removeChild(statusDiv.lastChild);
        }
        console.log(`[타입캐스트 도우미] ${message}`);
    }

    /***********************************************
     * 통합 UI 생성
     ***********************************************/

    function createIntegratedUI() {
        const container = document.createElement('div');
        container.id = 'tc-integrated-ui';
        const elementsToHide = [
            'tc-find-btn',
            'tc-retry-btn',
            'tc-character-input',
            'tc-select-first-name',
            'tc-wait-time'
            // 숨기고 싶은 다른 요소들 추가
        ];

        container.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 340px;
        background-color: #f8f9fa;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 12px;
        z-index: 9999;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        font-family: 'Noto Sans KR', sans-serif;
        transition: all 0.3s ease;
    `;

        container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0; font-size: 16px; color: #333;">타입캐스트 통합 도우미</h3>
            <div>
                <button id="tc-minimize-btn" style="background: none; border: none; cursor: pointer; margin-right: 5px;">
                    <span style="font-size: 16px;">_</span>
                </button>
                <button id="tc-close-btn" style="background: none; border: none; cursor: pointer;">
                    <span style="font-size: 16px;">×</span>
                </button>
            </div>
        </div>

        <div id="tc-content" style="transition: all 0.3s ease;">
            <div style="display: flex; gap: 5px; margin-bottom: 10px;">
                <button id="tc-tab-finder" style="flex: 1; padding: 8px 12px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    캐릭터 배정
                </button>
                <button id="tc-tab-script" style="flex: 1; padding: 8px 12px; background-color: #f0f0f0; color: #333; border: none; border-radius: 4px; cursor: pointer;">
                    대본 분류
                </button>
            </div>

            <!-- 캐릭터 찾기 섹션 -->
            <div id="tc-finder-section">
                <div style="margin-bottom: 10px;">
                    <input type="text" id="tc-character-input" placeholder="찾을 캐릭터 이름 입력" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
                </div>

                <div style="display: flex; gap: 5px; margin-bottom: 10px;">
                    <button id="tc-find-btn" style="flex: 1; padding: 8px 12px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        캐릭터 찾기
                    </button>
                    <button id="tc-retry-btn" style="flex: 1; padding: 8px 12px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        다시 시도
                    </button>
                </div>

                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <label style="margin-right: 10px; flex: 1;"></label>
                    <input type="number" id="tc-wait-time" value="2000" min="500" step="500" style="width: 70px; padding: 4px;">
                </div>

                <div id="tc-extra-buttons" style="display: flex; gap: 5px; margin-bottom: 10px;">
                    <button id="tc-select-first-name" style="flex: 1; padding: 6px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        이름결과 첫카드
                    </button>
                </div>

                <div style="margin-bottom: 10px;">
                    <div style="font-weight: bold; margin-bottom: 5px;">대본 일괄 처리</div>
                    <textarea id="tc-script-input" placeholder="대본을 여기에 붙여넣으세요. 예시:&#10;해설 : 가게 문을 열고&#10;남자 : 오늘은 장사안네요.&#10;대길 : 오늘 이 집 탕수육이..." style="width: 100%; height: 100px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; resize: vertical;"></textarea>
                    <div style="display: flex; gap: 5px; margin-top: 5px;">
                        <button id="tc-load-script" style="flex: 1; padding: 6px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                            대본 로드
                        </button>
                        <button id="tc-process-queue" style="flex: 1; padding: 6px; background-color: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                            처리 시작
                        </button>
                        <button id="tc-stop-queue" style="flex: 1; padding: 6px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                            처리 중지
                        </button>
                    </div>
                    <div style="margin-top: 5px; padding: 5px; background-color: #e3f2fd; border-radius: 4px; font-size: 12px;">
                        <p style="margin: 0 0 5px 0;">✓ 동일 캐릭터는 한 번만 처리됩니다.</p>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                        <span id="tc-queue-status" style="font-size: 12px; color: #666;">대기열: 0 / 0</span>
                        <button id="tc-next-item" style="padding: 4px 8px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                            다음 항목
                        </button>
                    </div>
                </div>
            </div>

            <!-- 대본 분류 섹션 -->
            <div id="tc-script-section" style="display: none;">
                <div style="margin-bottom: 10px;">
                    <div style="font-weight: bold; margin-bottom: 5px;">대본 입력</div>
                    <textarea id="script-parser-input" placeholder="여기에 대본을 붙여넣으세요. 예시:&#10;해설 : 가게 문을 열고&#10;남자 : 오늘은 장사안네요.&#10;대길 : 오늘 이 집 탕수육이..." style="width: 100%; height: 150px; margin-bottom: 10px; padding: 8px; font-size: 14px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; resize: vertical;"></textarea>
                </div>

                <div style="margin-bottom: 10px;">
                    <p style="margin: 5px 0; font-weight: bold;">캐릭터 설정</p>
                    <div id="character-mappings">
                        <!-- 캐릭터 매핑이 여기에 동적으로 추가됨 -->
                    </div>
                    <button id="add-mapping-btn" style="padding: 4px 8px; background: #4CAF50; color: white; border: none; border-radius: 3px; margin-top: 5px;">+ 캐릭터 추가</button>
                </div>

                <div style="display: flex; gap: 5px; margin-top: 10px; margin-bottom: 10px;">
                    <button id="sync-characters-btn" style="flex: 1; padding: 6px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        캐릭터 동기화
                    </button>
                    <button id="parse-script-btn" style="flex: 1; padding: 6px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        대본 분류하기
                    </button>
                </div>
            </div>

            <!-- 공통 상태 메시지 영역 -->
            <div id="tc-status-message" style="margin-top: 10px; font-size: 13px; color: #666; height: 80px; max-height: 80px; overflow-y: auto; border: 1px solid #eee; padding: 5px; border-radius: 4px;">
                버튼을 눌러 기능을 사용해보세요.
            </div>

            <!-- 설정 패널 (숨겨짐) -->
            <div id="tc-settings" style="margin-top: 10px; border: 1px solid #ddd; border-radius: 4px; padding: 8px; display: none;">
                <div style="font-weight: bold; margin-bottom: 5px;">입력 방법</div>
                <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                    <button id="tc-input-method1" style="flex: 1; padding: 4px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">방법1</button>
                    <button id="tc-input-method2" style="flex: 1; padding: 4px; background-color: #f0f0f0; color: #333; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">방법2</button>
                </div>

                <div style="font-weight: bold; margin-bottom: 5px; margin-top: 8px;">엔터 방법</div>
                <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                    <button id="tc-enter-method1" style="flex: 1; padding: 4px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">이벤트</button>
                </div>
                <button id="tc-debug-btn" style="width: 100%; padding: 4px; background-color: #f0f0f0; color: #333; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-top: 5px;">디버그 정보</button>
            </div>
        </div>
    `;

        document.body.appendChild(container);

        // UI 생성이 완료된 후 요소들 숨기기
        setTimeout(() => {
            elementsToHide.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.style.display = 'none'; // 요소 숨기기
                    // 또는 element.classList.add('hidden');
                }
            });

            // 특정 섹션 전체를 숨기고 싶다면
            const finderInputSection = document.querySelector('#tc-finder-section .some-specific-section');
            if (finderInputSection) {
                finderInputSection.style.display = 'none';
            }
        }, 100); // UI 생성 후 약간의 지연을 두고 실행

        // 진행 상황 표시기 추가
        const progressContainer = document.createElement('div');
        progressContainer.id = 'progress-indicator';
        progressContainer.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 370px;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 10px;
        border-radius: 5px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    `;

        progressContainer.innerHTML = `
        <div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
                <span id="current-progress">0</span>
                <span>/</span>
                <span id="total-lines">0</span>
                <input type="number" id="current-index-input" min="0" step="1" style="width: 50px; margin-left: 10px; padding: 2px 5px; border-radius: 3px; border: 1px solid #ccc;">
                <button id="set-index-btn" style="margin-left: 5px; padding: 2px 5px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">설정</button>
            </div>
            <div style="display: flex; gap: 5px;">
                <button id="pause-resume-btn" style="background-color: #f44336; color: white; padding: 4px 8px; border: none; border-radius: 3px; cursor: pointer; flex: 1;">정지</button>
                <button id="settings-btn" style="background-color: #2196F3; color: white; padding: 4px 8px; border: none; border-radius: 3px; cursor: pointer; flex: 1;">설정</button>
            </div>
        </div>
    `;

        document.body.appendChild(progressContainer);
        progressContainer.style.display = 'none'; // 초기에는 숨김

        setupIntegratedEventListeners();
    }


    // 통합 이벤트 리스너 설정
    function setupIntegratedEventListeners() {
        // 공통 UI 컨트롤
        document.getElementById('tc-minimize-btn').addEventListener('click', toggleMinimize);
        document.getElementById('tc-close-btn').addEventListener('click', function() {
            document.getElementById('tc-integrated-ui').style.display = 'none';
        });
        document.getElementById('tc-tab-finder').addEventListener('click', () => switchTab('finder'));
        document.getElementById('tc-tab-script').addEventListener('click', () => switchTab('script'));
        document.getElementById('settings-btn').addEventListener('click', toggleSettings);

        // 캐릭터 찾기 관련
        document.getElementById('tc-find-btn').addEventListener('click', findCharacter);
        document.getElementById('tc-retry-btn').addEventListener('click', retryLastSearch);
        document.getElementById('tc-character-input').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') findCharacter();
        });
        document.getElementById('tc-select-first-name').addEventListener('click', selectFirstNameSearchResult);
        document.getElementById('tc-load-script').addEventListener('click', loadScriptToQueue);
        document.getElementById('tc-process-queue').addEventListener('click', function() {
            if (!isProcessingQueue) {
                startProcessingQueue();
            } else {
                updateStatus('이미 처리 중입니다.', true);
            }
        });
        document.getElementById('tc-stop-queue').addEventListener('click', stopProcessingQueue);
        document.getElementById('tc-next-item').addEventListener('click', function() {
            if (isProcessingQueue) {
                processNextQueueItem();
            } else {
                updateStatus('처리가 시작되지 않았습니다. "처리 시작" 버튼을 눌러주세요.', true);
            }
        });

        // 대본 분류 관련
        document.getElementById('parse-script-btn').addEventListener('click', startScriptProcess);
        document.getElementById('add-mapping-btn').addEventListener('click', function() {
            const selects = document.querySelectorAll('#character-mappings .char-number');
            let nextNumber = 1;

            if (selects.length > 0) {
                const selectedValues = Array.from(selects).map(select => parseInt(select.value));
                nextNumber = Math.max(...selectedValues) + 1;
            }

            addCharacterMapping('', nextNumber);
        });
        document.getElementById('sync-characters-btn').addEventListener('click', syncCharactersFromFinder);

        // 진행 관련
        document.getElementById('pause-resume-btn').addEventListener('click', togglePauseResume);
        document.getElementById('set-index-btn').addEventListener('click', setCurrentIndex);

        // 설정 관련
        document.getElementById('tc-input-method1').addEventListener('click', () => setInputMethod(1));
        document.getElementById('tc-input-method2').addEventListener('click', () => setInputMethod(2));
        document.getElementById('tc-enter-method1').addEventListener('click', () => setEnterMethod(1));
        document.getElementById('tc-debug-btn').addEventListener('click', debugScriptInfo);
    }

    // 탭 전환 함수
    function switchTab(tabName) {
        const finderTab = document.getElementById('tc-tab-finder');
        const scriptTab = document.getElementById('tc-tab-script');
        const finderSection = document.getElementById('tc-finder-section');
        const scriptSection = document.getElementById('tc-script-section');

        if (tabName === 'finder') {
            finderTab.style.backgroundColor = '#4CAF50';
            finderTab.style.color = 'white';
            scriptTab.style.backgroundColor = '#f0f0f0';
            scriptTab.style.color = '#333';

            finderSection.style.display = 'block';
            scriptSection.style.display = 'none';
        } else {
            scriptTab.style.backgroundColor = '#4CAF50';
            scriptTab.style.color = 'white';
            finderTab.style.backgroundColor = '#f0f0f0';
            finderTab.style.color = '#333';

            finderSection.style.display = 'none';
            scriptSection.style.display = 'block';
        }
    }

    // UI 최소화/최대화 토글
    function toggleMinimize() {
        const content = document.getElementById('tc-content');
        const container = document.getElementById('tc-integrated-ui');
        const minBtn = document.getElementById('tc-minimize-btn');

        if (isCharacterUIVisible) {
            // 최소화
            content.style.display = 'none';
            container.style.height = 'auto';
            minBtn.innerHTML = '<span style="font-size: 16px;">□</span>';
            isCharacterUIVisible = false;
        } else {
            // 최대화
            content.style.display = 'block';
            container.style.height = 'auto';
            minBtn.innerHTML = '<span style="font-size: 16px;">_</span>';
            isCharacterUIVisible = true;
        }
    }

    // 설정 패널 토글
    function toggleSettings() {
        const settingsPanel = document.getElementById('tc-settings');
        if (settingsPanel.style.display === 'none') {
            settingsPanel.style.display = 'block';
        } else {
            settingsPanel.style.display = 'none';
        }
    }

    // 정지/재개 토글
    function togglePauseResume() {
        const btn = document.getElementById('pause-resume-btn');
        if (!btn) return;

        if (isScriptRunning) {
            // 정지
            isScriptRunning = false;
            if (scriptProcessTimeout) {
                clearTimeout(scriptProcessTimeout);
                scriptProcessTimeout = null;
            }
            btn.textContent = '재개';
            btn.style.backgroundColor = '#4CAF50'; // 녹색
            updateStatus('처리가 일시 중지되었습니다.');
        } else {
            // 재개
            isScriptRunning = true;
            btn.textContent = '정지';
            btn.style.backgroundColor = '#f44336'; // 빨강
            updateStatus('처리를 재개합니다...');
            processNextLine();
        }
    }

    // 현재 인덱스 설정
    function setCurrentIndex() {
        const input = document.getElementById('current-index-input');
        if (!input) return;

        const newIndex = parseInt(input.value);

        if (isNaN(newIndex) || newIndex < 0 || newIndex >= parsedLines.length) {
            updateStatus(`유효하지 않은 인덱스입니다. 0-${parsedLines.length - 1} 사이의 값을 입력하세요.`, true);
            return;
        }

        currentLineIndex = newIndex;
        updateProgressDisplay();
        updateStatus(`현재 인덱스가 ${newIndex}로 설정되었습니다.`);
    }

    // 진행 상황 표시 업데이트
    function updateProgressDisplay() {
        const currentProgress = document.getElementById('current-progress');
        const totalLines = document.getElementById('total-lines');
        const currentIndexInput = document.getElementById('current-index-input');

        if (currentProgress && totalLines && currentIndexInput) {
            currentProgress.textContent = currentLineIndex;
            totalLines.textContent = parsedLines.length;
            currentIndexInput.value = currentLineIndex;

            // 진행 상황 표시기 표시
            const progressIndicator = document.getElementById('progress-indicator');
            if (progressIndicator) {
                progressIndicator.style.display = 'flex';
            }
        }
    }
    /***********************************************
     * 캐릭터 검색 및 추가 기능
     ***********************************************/

    // 입력 방법 설정
    function setInputMethod(method) {
        currentInputMethod = method;

        // 모든 버튼 비활성화
        for (let i = 1; i <= 2; i++) {
            const btn = document.getElementById(`tc-input-method${i}`);
            if (btn) {
                btn.style.backgroundColor = i === method ? '#4CAF50' : '#f0f0f0';
                btn.style.color = i === method ? 'white' : '#333';
            }
        }

        updateStatus(`입력 방법 ${method}번으로 변경되었습니다.`);
    }

    // 엔터 방법 설정
    function setEnterMethod(method) {
        currentEnterMethod = method;

        // 모든 버튼 비활성화
        for (let i = 1; i <= 1; i++) {
            const btn = document.getElementById(`tc-enter-method${i}`);
            if (btn) {
                btn.style.backgroundColor = i === method ? '#4CAF50' : '#f0f0f0';
                btn.style.color = i === method ? 'white' : '#333';
            }
        }

        updateStatus(`엔터 방법 ${method}번으로 변경되었습니다.`);
    }

    // 대본 로드 및 대기열 설정
    function loadScriptToQueue() {
        const scriptText = document.getElementById('tc-script-input').value.trim();

        if (!scriptText) {
            updateStatus('대본 내용을 입력해주세요.', true);
            return;
        }

        // 줄 단위로 분리
        const lines = scriptText.split('\n');

        // 대기열 초기화
        searchQueue = [];
        currentQueueIndex = 0;
        // 처리된 캐릭터 초기화
        processedCharacters = {};

        // 대사 분석 및 대기열 추가
        for (const line of lines) {
            const trimmedLine = line.trim();

            // 형식: "캐릭터 : 대사" 패턴 검색
            const match = trimmedLine.match(/^(.+?)\s*:\s*(.+)$/);

            if (match) {
                const character = match[1].trim();
                const dialogue = match[2].trim();

                // 대기열에 추가
                searchQueue.push({
                    character: character,
                    dialogue: dialogue,
                    processed: false
                });
            }
        }

        // 결과 업데이트
        updateStatus(`대본 로드 완료: ${searchQueue.length}개 항목이 대기열에 추가되었습니다.`);
        updateQueueStatus();

        // 대본 분류 탭의 텍스트 영역에도 동일한 대본 복사
        document.getElementById('script-parser-input').value = scriptText;

        // 처리된 캐릭터를 대본 분류 탭의 매핑에 자동 추가
        // (처리는 아직 안되었지만, 대본에서 추출한 모든 캐릭터를 미리 추가)
        const characters = new Set(searchQueue.map(item => item.character));
        syncCharactersFromQueue(characters);
    }


    // 캐릭터 찾기에서 대본 분류로 캐릭터 동기화
    function syncCharactersFromQueue(characters) {
        // 기존 캐릭터 매핑 초기화
        const mappingsContainer = document.getElementById('character-mappings');
        if (!mappingsContainer) {
            updateStatus('캐릭터 매핑 컨테이너를 찾을 수 없습니다.', true);
            return;
        }

        mappingsContainer.innerHTML = '';

        // 드롭다운 메뉴의 캐릭터들을 순서대로 가져옴
        const actorElements = document.querySelectorAll('.actors .tw-flex.tw-items-center.tw-h-12');

        // 캐릭터 목록이 비어있는 경우 처리
        if (actorElements.length === 0) {
            updateStatus('타입캐스트 캐릭터 목록을 찾을 수 없습니다. 먼저 캐릭터 드롭다운을 한 번 열어주세요.', true);

            // 캐릭터 목록이 없어도 기본 번호로 매핑
            let index = 1;
            for (const character of characters) {
                addCharacterMapping(character, index);
                index = (index % 5) + 1; // 1부터 5까지 순환
            }

            return;
        }

        // 나머지 코드는 동일...
        const actorNames = [];
        const actorIndices = {};

        // 드롭다운에서 캐릭터 이름과 인덱스 추출
        for (let i = 0; i < actorElements.length; i++) {
            const nameElement = actorElements[i].querySelector('.t-body2.tw-text-left');
            if (nameElement && !nameElement.textContent.includes('캐릭터 추가하기')) {
                const name = nameElement.textContent.trim();
                actorNames.push(name);
                actorIndices[name] = i + 1; // 인덱스는 1부터 시작
            }
        }

        // 대본에서 나온 캐릭터들에 대해 매핑 처리
        for (const character of characters) {
            // 대본의 캐릭터와 타입캐스트 캐릭터 이름 유사도 비교
            let bestMatch = null;
            let bestMatchIndex = 0;
            let bestMatchScore = 0;

            // 가장 유사한 타입캐스트 캐릭터 찾기
            for (let i = 0; i < actorNames.length; i++) {
                const actorName = actorNames[i];
                // 두 이름 간의 유사도 계산 (여기서는 단순 포함 관계 확인)
                let score = 0;

                // 완전 일치하면 높은 점수
                if (actorName === character) {
                    score = 100;
                }
                // 부분 일치하면 중간 점수
                else if (actorName.includes(character) || character.includes(actorName)) {
                    score = 50;
                }

                // 현재까지 가장 높은 유사도면 기록
                if (score > bestMatchScore) {
                    bestMatchScore = score;
                    bestMatch = actorName;
                    bestMatchIndex = i + 1; // 인덱스는 1부터 시작
                }
            }

            // 매칭된 캐릭터가 있으면 해당 인덱스 사용, 없으면 새 번호 할당
            if (bestMatch && bestMatchScore > 0) {
                addCharacterMapping(character, bestMatchIndex);
                updateStatus(`캐릭터 '${character}'를 '${bestMatch}'(${bestMatchIndex}번)과 매핑했습니다.`);
            } else {
                // 매칭되는 캐릭터가 없으면 새 번호 할당
                addCharacterMapping(character, actorNames.length + 1);
                updateStatus(`캐릭터 '${character}'에 새 번호를 할당했습니다: ${actorNames.length + 1}번`);
            }
        }

        updateStatus(`캐릭터 매핑이 업데이트되었습니다: ${characters.size}개의 캐릭터`);
    }



//     // 캐릭터 찾기에서 대본 분류로 캐릭터 동기화
//     function syncCharactersFromQueue(characters) {
//         // 기존 캐릭터 매핑 초기화
//         const mappingsContainer = document.getElementById('character-mappings');
//         mappingsContainer.innerHTML = '';

//         // 드롭다운 메뉴의 캐릭터들을 순서대로 가져옴
//         const actorElements = document.querySelectorAll('.actors .tw-flex.tw-items-center.tw-h-12');
//         const actorNames = [];
//         const actorIndices = {};

//         // 드롭다운에서 캐릭터 이름과 인덱스 추출
//         for (let i = 0; i < actorElements.length; i++) {
//             const nameElement = actorElements[i].querySelector('.t-body2.tw-text-left');
//             if (nameElement && !nameElement.textContent.includes('캐릭터 추가하기')) {
//                 const name = nameElement.textContent.trim();
//                 actorNames.push(name);
//                 actorIndices[name] = i + 1; // 인덱스는 1부터 시작
//             }
//         }

//         // 대본에서 나온 캐릭터들에 대해
//         for (const character of characters) {
//             // 대본의 캐릭터와 타입캐스트 캐릭터 이름 유사도 비교
//             let bestMatch = null;
//             let bestMatchIndex = 0;
//             let bestMatchScore = 0;

//             // 가장 유사한 타입캐스트 캐릭터 찾기
//             for (let i = 0; i < actorNames.length; i++) {
//                 const actorName = actorNames[i];
//                 // 두 이름 간의 유사도 계산 (여기서는 단순 포함 관계 확인)
//                 let score = 0;

//                 // 완전 일치하면 높은 점수
//                 if (actorName === character) {
//                     score = 100;
//                 }
//                 // 부분 일치하면 중간 점수
//                 else if (actorName.includes(character) || character.includes(actorName)) {
//                     score = 50;
//                 }

//                 // 현재까지 가장 높은 유사도면 기록
//                 if (score > bestMatchScore) {
//                     bestMatchScore = score;
//                     bestMatch = actorName;
//                     bestMatchIndex = i + 1; // 인덱스는 1부터 시작
//                 }
//             }

//             // 매칭된 캐릭터가 있으면 해당 인덱스 사용, 없으면 새 번호 할당
//             if (bestMatch && bestMatchScore > 0) {
//                 addCharacterMapping(character, bestMatchIndex);
//                 updateStatus(`캐릭터 '${character}'를 '${bestMatch}'(${bestMatchIndex}번)과 매핑했습니다.`);
//             } else {
//                 // 매칭되는 캐릭터가 없으면 새 번호 할당
//                 addCharacterMapping(character, actorNames.length + 1);
//                 updateStatus(`캐릭터 '${character}'에 새 번호를 할당했습니다: ${actorNames.length + 1}번`);
//             }
//         }

//         updateStatus(`캐릭터 매핑이 업데이트되었습니다: ${characters.size}개의 캐릭터`);
//     }



    // 캐릭터 찾기에서 대본 분류로 캐릭터 동기화 (버튼용)
    function syncCharactersFromFinder() {
        if (searchQueue.length === 0) {
            updateStatus('동기화할 캐릭터가 없습니다. 먼저 캐릭터 찾기 탭에서 대본을 로드해주세요.', true);
            return;
        }

        // 캐릭터 목록이 로드될 시간을 주기 위해 먼저 드롭다운 열기 시도
        openActorDropdown()
            .then(() => {
            // 드롭다운이 열린 후 잠시 대기
            setTimeout(() => {
                // 드롭다운 닫기
                document.body.click();

                // 캐릭터 목록이 로드된 후 동기화 실행
                setTimeout(() => {
                    const characters = new Set(searchQueue.map(item => item.character));
                    syncCharactersFromQueue(characters);
                }, 500);
            }, 1000);
        })
            .catch(error => {
            updateStatus(`드롭다운을 열지 못했습니다: ${error}. 기본 값으로 매핑합니다.`, true);
            const characters = new Set(searchQueue.map(item => item.character));
            syncCharactersFromQueue(characters);
        });
    }


    // 대기열 상태 업데이트
    function updateQueueStatus() {
        const statusElement = document.getElementById('tc-queue-status');
        if (!statusElement) return;

        const processedCount = searchQueue.filter(item => item.processed).length;
        const uniqueCharactersCount = new Set(searchQueue.map(item => item.character)).size;

        statusElement.textContent = `대기열: ${processedCount} / ${searchQueue.length} (캐릭터 ${Object.keys(processedCharacters).length} / ${uniqueCharactersCount})`;
    }

    // 대기열 처리 시작
    function startProcessingQueue() {
        if (searchQueue.length === 0) {
            updateStatus('처리할 대기열이 비어있습니다. 먼저 대본을 로드해주세요.', true);
            return;
        }

        if (isProcessingQueue) {
            updateStatus('이미 처리 중입니다.', true);
            return;
        }

        isProcessingQueue = true;
        // 처리 시작 시 캐릭터 처리 기록 초기화
        processedCharacters = {};
        updateStatus('대기열 처리를 시작합니다...');

        // 처리되지 않은 첫 번째 항목부터 시작
        for (let i = 0; i < searchQueue.length; i++) {
            if (!searchQueue[i].processed) {
                currentQueueIndex = i;
                break;
            }
        }

        processQueueItem(currentQueueIndex);
    }

    // 대기열 처리 중지
    function stopProcessingQueue() {
        if (!isProcessingQueue) {
            updateStatus('처리 중인 작업이 없습니다.', true);
            return;
        }

        isProcessingQueue = false;
        updateStatus('대기열 처리를 중지했습니다.');
    }

    // 다음 대기열 항목 처리
    function processNextQueueItem() {
        if (!isProcessingQueue) {
            updateStatus('처리가 시작되지 않았습니다. "처리 시작" 버튼을 눌러주세요.', true);
            return;
        }

        // 다음 처리되지 않은 항목 찾기
        let nextIndex = -1;
        for (let i = currentQueueIndex + 1; i < searchQueue.length; i++) {
            if (!searchQueue[i].processed) {
                nextIndex = i;
                break;
            }
        }

        if (nextIndex === -1) {
            updateStatus('모든 항목이 처리되었습니다.');
            isProcessingQueue = false;

            // 모든 항목 처리가 완료되면 2초 후 프로젝트에 추가 버튼 클릭
            setTimeout(() => {
                clickAddToProjectButton()
                    .then(() => {
                    updateStatus('캐릭터들이 프로젝트에 추가되었습니다!');

                    // 대본 분류 탭으로 자동 전환
                    setTimeout(() => {
                        switchTab('script');
                        updateStatus('대본 분류 탭으로 자동 전환되었습니다.');

                        // 대본 분류 탭으로 전환 후 드롭다운 점검 및 캐릭터 매칭
                        setTimeout(() => {
                            updateStatus('캐릭터 드롭다운 점검 및 동기화를 시작합니다...');

                            // 드롭다운 확인 및 매칭 시도
                            checkAndSyncCharacters()
                                .then(() => {
                                // 동기화 성공 시 추가 작업 (선택적)
                                // 예: 자동으로 대본 분류 시작
                                startScriptProcess();
                            })
                                .catch(error => {
                                updateStatus(`캐릭터 동기화 중 오류: ${error}`, true);
                            });
                        }, 1000);
                    }, 1000);
                })
                    .catch(error => {
                    updateStatus(`프로젝트 추가 중 오류: ${error}`, true);
                });
            }, 2000);

            return;
        }

        currentQueueIndex = nextIndex;
        processQueueItem(currentQueueIndex);
    }

    // 드롭다운 점검 및 캐릭터 동기화 함수
    function checkAndSyncCharacters() {
        return new Promise((resolve, reject) => {
            try {
                // 드롭다운이 이미 열려 있는지 확인
                const openDropdown = document.querySelector('.actors');

                if (openDropdown) {
                    // 이미 열려 있으면 바로 동기화
                    updateStatus('열려있는 캐릭터 드롭다운을 발견했습니다. 동기화를 시도합니다...');
                    if (searchQueue.length > 0) {
                        const characters = new Set(searchQueue.map(item => item.character));
                        syncCharactersFromQueue(characters);
                        resolve(true);
                    } else {
                        updateStatus('동기화할 캐릭터가 없습니다.', true);
                        reject('동기화할 캐릭터가 없습니다.');
                    }
                } else {
                    // 닫혀 있으면 열고 동기화 후 닫기
                    updateStatus('캐릭터 드롭다운을 열고 동기화를 시도합니다...');

                    // 빠른 타입캐스트 캐릭터 접근 (첫번째 캐릭터 클릭)
                    const firstCharacter = document.querySelector('.selected.actor-color-name');
                    if (firstCharacter) {
                        // 캐릭터를 클릭하여 드롭다운 열기
                        firstCharacter.click();

                        // 드롭다운이 열릴 때까지 기다림
                        setTimeout(() => {
                            // 열렸는지 다시 확인
                            const actorsElement = document.querySelector('.actors');
                            if (actorsElement) {
                                // 캐릭터 동기화
                                if (searchQueue.length > 0) {
                                    const characters = new Set(searchQueue.map(item => item.character));
                                    syncCharactersFromQueue(characters);

                                    // 동기화 후 잠시 대기했다가 드롭다운 닫기
                                    setTimeout(() => {
                                        document.body.click(); // 아무 곳이나 클릭하여 드롭다운 닫기
                                        resolve(true);
                                    }, 1000);
                                } else {
                                    document.body.click(); // 닫기
                                    updateStatus('동기화할 캐릭터가 없습니다.', true);
                                    reject('동기화할 캐릭터가 없습니다.');
                                }
                            } else {
                                updateStatus('드롭다운이 열리지 않았습니다.', true);
                                reject('드롭다운이 열리지 않았습니다.');
                            }
                        }, 1000);
                    } else {
                        updateStatus('캐릭터 선택 요소를 찾을 수 없습니다.', true);
                        reject('캐릭터 선택 요소를 찾을 수 없습니다.');
                    }
                }
            } catch (error) {
                updateStatus(`캐릭터 동기화 오류: ${error}`, true);
                reject(error);
            }
        });
    }

    // 특정 대기열 항목 처리
    function processQueueItem(index) {
        if (index >= searchQueue.length) {
            updateStatus('처리할 항목이 없습니다.');
            isProcessingQueue = false;
            return;
        }

        const item = searchQueue[index];
        if (item.processed) {
            updateStatus(`${index + 1}번 항목(${item.character})은 이미 처리되었습니다.`);
            processNextQueueItem();
            return;
        }

        const characterName = item.character;

        // 이미 처리된 캐릭터인지 확인
        if (processedCharacters[characterName]) {
            updateStatus(`'${characterName}' 캐릭터는 이미 처리되었습니다. 자동으로 완료 처리합니다.`);
            item.processed = true;
            updateQueueStatus();

            // 바로 다음 항목으로 진행
            if (isProcessingQueue) {
                setTimeout(() => {
                    processNextQueueItem();
                }, 500);
            }
            return;
        }

        // 각 항목 처리 시 방법 1부터 시도하도록 초기화
        methodRetried = false;
        currentInputMethod = 1;

        updateStatus(`${index + 1}번 항목 처리 중: "${characterName}" 검색...`);

        // 캐릭터 이름을 입력창에 설정
        const inputElement = document.getElementById('tc-character-input');
        if (inputElement) {
            inputElement.value = characterName;
        }

        // 캐릭터 찾기 시작
        searchingCharacter = true;

        // 캐릭터 패널에서 찾기
        findCharacterInPanel(characterName)
            .then(found => {
                if (found) {
                    updateStatus(`'${characterName}' 캐릭터를 찾았습니다.`);
                    item.processed = true;
                    // 처리된 캐릭터 목록에 추가
                    processedCharacters[characterName] = true;
                    updateQueueStatus();

                    // 자동으로 다음 항목 처리 (1초 후)
                    if (isProcessingQueue) {
                        setTimeout(() => {
                            processNextQueueItem();
                        }, 1000);
                    }
                } else {
                    updateStatus(`'${characterName}' 캐릭터를 찾을 수 없습니다. 캐릭터 추가를 시도합니다...`);
                    // 캐릭터 이름 클릭하여 드롭다운 열기
                    return openActorDropdown()
                        .then(() => {
                            // 드롭다운이 열린 후 캐릭터 추가 버튼 클릭
                            return clickAddCharacterButton();
                        })
                        .then(() => {
                            // 검색창 입력 및 검색 시도
                            return handleSearch(characterName);
                        })
                        .then(() => {
                            // 검색 완료 후 이름으로 검색한 결과의 첫 번째 카드 선택
                            return selectFirstNameSearchResult();
                        })
                        .then(() => {
                            item.processed = true;
                            // 처리된 캐릭터 목록에 추가
                            processedCharacters[characterName] = true;
                            updateQueueStatus();

                            // 자동으로 다음 항목 처리 (2초 후)
                            if (isProcessingQueue) {
                                setTimeout(() => {
                                    processNextQueueItem();
                                }, 2000);
                            }
                        });
                }
            })
            .catch(error => {
                updateStatus(`오류 발생: ${error}`, true);

                // 오류 발생 시에도 다음 항목으로 진행할지 묻기
                if (confirm(`'${characterName}' 처리 중 오류가 발생했습니다. 다음 항목으로 진행하시겠습니까?`)) {
                    item.processed = true; // 오류가 발생해도 처리된 것으로 표시
                    updateQueueStatus();

                    if (isProcessingQueue) {
                        setTimeout(() => {
                            processNextQueueItem();
                        }, 1000);
                    }
                } else {
                    isProcessingQueue = false;
                    updateStatus('대기열 처리가 중지되었습니다.');
                }
            })
            .finally(() => {
                searchingCharacter = false;
            });
    }

    // 다시 시도 함수
    function retryLastSearch() {
        const input = document.getElementById('tc-character-input');
        if (input && input.value.trim()) {
            retryCount = 0;
            // 다시 시도할 때 방법 1부터 시작
            methodRetried = false;
            currentInputMethod = 1;
            findCharacter();
        } else {
            updateStatus('다시 시도할 검색어가 없습니다.', true);
        }
    }

    // 캐릭터 찾기 메인 함수
    function findCharacter() {
        if (searchingCharacter) {
            updateStatus('이미 검색 중입니다. 잠시만 기다려주세요.', true);
            return;
        }

        const inputElement = document.getElementById('tc-character-input');
        if (!inputElement) return;

        const characterName = inputElement.value.trim();

        if (!characterName) {
            updateStatus('캐릭터 이름을 입력해주세요.', true);
            return;
        }

        searchingCharacter = true;
        updateStatus(`'${characterName}' 캐릭터를 찾는 중...`);

        // 먼저 캐릭터 패널에서 찾기
        findCharacterInPanel(characterName)
            .then(found => {
                if (found) {
                    updateStatus(`'${characterName}' 캐릭터를 찾았습니다.`);
                } else {
                    updateStatus(`'${characterName}' 캐릭터를 찾을 수 없습니다. 캐릭터 추가를 시도합니다...`);
                    // 캐릭터 이름 클릭하여 드롭다운 열기
                    return openActorDropdown()
                        .then(() => {
                            // 드롭다운이 열린 후 캐릭터 추가 버튼 클릭
                            return clickAddCharacterButton();
                        })
                        .then(() => {
                            // 검색창 입력 및 검색 시도
                            return handleSearch(characterName);
                        })
                        .then(() => {
                            // 검색 완료 후 이름으로 검색한 결과의 첫 번째 카드 선택
                            return selectFirstNameSearchResult();
                        });
                }
            })
            .catch(error => {
                updateStatus(`오류 발생: ${error}`, true);

                // 방법 1이 실패하고 아직 방법 2로 시도하지 않았다면 자동으로 방법 2로 전환
                if (currentInputMethod === 1 && !methodRetried) {
                    methodRetried = true;
                    currentInputMethod = 2;
                    updateStatus('방법 1이 실패하여 자동으로 방법 2로 전환합니다.');
                    setTimeout(findCharacter, 1000);
                } else if (retryCount < MAX_RETRIES) {
                    // 이미 방법 2로 시도했거나 다른 오류인 경우 재시도 로직
                    retryCount++;
                    updateStatus(`자동 재시도 중... (${retryCount}/${MAX_RETRIES})`, true);
                    setTimeout(findCharacter, 2000);
                } else {
                    retryCount = 0;
                    methodRetried = false;
                    updateStatus(`최대 재시도 횟수(${MAX_RETRIES})를 초과했습니다. '다시 시도' 버튼을 눌러주세요.`, true);
                }
            })
            .finally(() => {
                if (retryCount === 0 && !methodRetried) {
                    searchingCharacter = false;
                }
            });
    }

    // 캐릭터 패널에서 캐릭터 찾기
    function findCharacterInPanel(characterName) {
        return new Promise((resolve, reject) => {
            try {
                // 캐릭터 이름 요소들 찾기
                const characterElements = document.querySelectorAll('.t-body1.actor-name, .t-body2.tw-text-left, .t-head8.t-grey-900.bold.card-name');

                // 이름 비교를 위한 정규화 함수
                const normalize = name => name.trim().toLowerCase();
                const searchName = normalize(characterName);

                let found = false;

                // 모든 캐릭터 이름 확인
                for (const element of characterElements) {
                    const name = normalize(element.textContent);

                    if (name === searchName || name.includes(searchName)) {
                        // 상위 요소로 이동하여 클릭
                        if (element.closest('.tw-flex.tw-items-center.tw-h-12')) {
                            element.closest('.tw-flex.tw-items-center.tw-h-12').click();
                            found = true;
                            updateStatus(`'${element.textContent.trim()}' 캐릭터를 선택했습니다.`);
                            break;
                        } else if (element.closest('.selected.actor-color-name')) {
                            element.closest('.selected.actor-color-name').click();
                            found = true;
                            updateStatus(`'${element.textContent.trim()}' 캐릭터를 선택했습니다.`);
                            break;
                        } else if (element.closest('.actor-card-wrapper')) {
                            element.closest('.actor-card-wrapper').click();
                            found = true;
                            updateStatus(`'${element.textContent.trim()}' 캐릭터를 선택했습니다.`);
                            break;
                        }
                    }
                }

                setTimeout(() => resolve(found), 500);
            } catch (error) {
                reject(`캐릭터 검색 오류: ${error.message}`);
            }
        });
    }

    // 드롭다운 열기
    function openActorDropdown() {
        return new Promise((resolve, reject) => {
            try {
                // 드롭다운 열기 (이미 열려있는지 확인)
                const openDropdown = document.querySelector('.selected.actor-color-name.open');

                if (openDropdown) {
                    // 이미 열려있으면 바로 진행
                    updateStatus('드롭다운이 이미 열려있습니다.');
                    resolve();
                    return;
                }

                // 열려있지 않으면 첫 번째 캐릭터 이름 클릭
                const nameElements = document.querySelectorAll('.selected.actor-color-name');

                if (nameElements.length > 0) {
                    nameElements[0].click();
                    updateStatus('캐릭터 드롭다운 메뉴를 열었습니다.');

                    // 드롭다운이 열릴 때까지 대기
                    waitForElement('.actors', 5000)
                        .then(() => {
                            resolve();
                        })
                        .catch(error => {
                            reject(`드롭다운 메뉴를 열지 못했습니다: ${error}`);
                        });
                } else {
                    reject('캐릭터 선택 요소를 찾을 수 없습니다.');
                }
            } catch (error) {
                reject(`드롭다운 열기 오류: ${error.message}`);
            }
        });
    }

    // 캐릭터 추가 버튼 클릭
    function clickAddCharacterButton() {
        return new Promise((resolve, reject) => {
            try {
                // 먼저 드롭다운 메뉴가 열려있는지 확인
                waitForElement('.actors', 5000)
                    .then(actorsContainer => {
                        // 추가 버튼 찾기
                        const addButtons = actorsContainer.querySelectorAll('.tw-flex.tw-items-center.tw-gap-2');
                        let addButton = null;

                        for (const button of addButtons) {
                            const text = button.textContent.trim();
                            if (text === '캐릭터 추가하기') {
                                addButton = button;
                                break;
                            }
                        }

                        if (!addButton) {
                            throw new Error('캐릭터 추가 버튼을 찾을 수 없습니다.');
                        }

                        // 버튼 클릭
                        addButton.click();
                        updateStatus('캐릭터 추가 버튼을 클릭했습니다.');

                        // 검색 창이 열릴 때까지 대기
                        return waitForElement('input[type="text"][name="search"][id="search"]', 5000);
                    })
                    .then(() => {
                        resolve();
                    })
                    .catch(error => {
                        reject(`캐릭터 추가 버튼 클릭 오류: ${error}`);
                    });
            } catch (error) {
                reject(`캐릭터 추가 버튼 클릭 오류: ${error.message}`);
            }
        });
    }

    // 이름으로 검색한 결과의 첫 번째 카드 선택 함수
    function selectFirstNameSearchResult() {
        return new Promise(async (resolve, reject) => {
            try {
                updateStatus('이름으로 검색한 결과의 첫 번째 카드를 찾는 중...');

                // "이름으로 검색한 결과" 섹션 찾기
                let nameSearchSection = null;

                // 방법 1: 텍스트 내용으로 찾기
                const allSections = Array.from(document.querySelectorAll('.actor-list-partial em.t-body1.medium, .actor-list-partial em'));
                for (const section of allSections) {
                    if (section.textContent.trim().includes('이름으로 검색한 결과')) {
                        nameSearchSection = section.closest('.actor-list-partial');
                        updateStatus('텍스트 내용으로 이름 검색 섹션을 찾았습니다.');
                        break;
                    }
                }

                // 방법 2: 두 번째 섹션 찾기 (첫 번째는 스타일 검색 결과일 것)
                if (!nameSearchSection) {
                    const sections = document.querySelectorAll('.actor-list-partial');
                    if (sections.length > 1) {
                        nameSearchSection = sections[1]; // 두 번째 섹션
                        updateStatus('두 번째 섹션을 이름 검색 섹션으로 선택했습니다.');
                    }
                }

                if (!nameSearchSection) {
                    throw new Error('이름 검색 결과 섹션을 찾을 수 없습니다.');
                }

                // 첫 번째 카드 찾기
                let firstCard = null;

                // 방법 1: actor-card-wrapper 찾기
                firstCard = nameSearchSection.querySelector('.actor-card-wrapper');

                // 방법 2: 다른 선택자 시도
                if (!firstCard) {
                    firstCard = nameSearchSection.querySelector('.actor-cards > div:first-child');
                }

                // 방법 3: 더 일반적인 선택자
                if (!firstCard) {
                    const cards = nameSearchSection.querySelectorAll('.actor-cards > *');
                    if (cards.length > 0) {
                        firstCard = cards[0];
                    }
                }

                if (!firstCard) {
                    throw new Error('첫 번째 카드를 찾을 수 없습니다.');
                }

                // 카드 내의 이름 요소 찾기 (로깅 목적)
                let cardName = "알 수 없음";
                const nameElement = firstCard.querySelector('.t-head8.t-grey-900.bold.card-name, .card-name, strong');
                if (nameElement) {
                    cardName = nameElement.textContent.trim();
                }

                // 카드 클릭
                firstCard.click();
                updateStatus(`이름으로 검색한 결과의 첫 번째 카드(${cardName})를 선택했습니다.`);

                // 이미지나 다른 클릭 가능한 요소 클릭 시도
                await sleep(500);
                const clickableElement = firstCard.querySelector('.actor-pic, img, .actor-card-content');
                if (clickableElement) {
                    clickableElement.click();
                    updateStatus(`카드 내 이미지/요소를 추가로 클릭했습니다.`);
                }

                resolve(true);
            } catch (error) {
                updateStatus(`카드 선택 오류: ${error.message}`, true);
                reject(error);
            }
        });
    }

    // 검색 입력 방법 1: 직접 값 설정 후 input 이벤트 발생
    async function inputMethod1(searchInput, characterName) {
        updateStatus('입력 방법 1: 직접 값 설정 후 이벤트 발생');

        searchInput.focus();
        searchInput.value = '';
        await sleep(100);

        searchInput.value = characterName;

        // input 이벤트 발생
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        searchInput.dispatchEvent(inputEvent);

        // change 이벤트 발생
        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
        searchInput.dispatchEvent(changeEvent);

        updateStatus('입력 방법 1 완료');
    }

    // 검색 입력 방법 2: 한 글자씩 천천히 입력
    async function inputMethod2(searchInput, characterName) {
        updateStatus('입력 방법 2: 한 글자씩 천천히 입력');

        searchInput.focus();
        searchInput.value = '';
        await sleep(200);

        // 각 글자마다 keydown, keypress, keyup 이벤트 발생
        for (let i = 0; i < characterName.length; i++) {
            const char = characterName[i];

            // keydown
            const keydownEvent = new KeyboardEvent('keydown', {
                key: char,
                code: `Key${char.toUpperCase()}`,
                bubbles: true,
                cancelable: true
            });
            searchInput.dispatchEvent(keydownEvent);

            // 값 업데이트
            searchInput.value += char;

            // input 이벤트
            const inputEvent = new Event('input', { bubbles: true });
            searchInput.dispatchEvent(inputEvent);

            // keyup
            const keyupEvent = new KeyboardEvent('keyup', {
                key: char,
                code: `Key${char.toUpperCase()}`,
                bubbles: true,
                cancelable: true
            });
            searchInput.dispatchEvent(keyupEvent);

            await sleep(100);
        }

        updateStatus('입력 방법 2 완료');
    }

    // 엔터 방법: 키보드 이벤트 (강제 이벤트 사용)
    async function triggerEnterEvent(searchInput) {
        updateStatus('엔터 이벤트 발생시키는 중...');

        // keydown
        const keydownEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
        });
        searchInput.dispatchEvent(keydownEvent);

        await sleep(100);

        // keypress
        const keypressEvent = new KeyboardEvent('keypress', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
        });
        searchInput.dispatchEvent(keypressEvent);

        await sleep(100);

        // keyup
        const keyupEvent = new KeyboardEvent('keyup', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
        });
        searchInput.dispatchEvent(keyupEvent);

        updateStatus('엔터 이벤트 발생 완료');
    }

    // 대기열 처리 후 프로젝트에 추가 버튼 클릭 함수
    function clickAddToProjectButton() {
        return new Promise((resolve, reject) => {
            try {
                // 모든 primary 버튼 찾기
                const buttons = document.querySelectorAll('.t-button.t-button.medium.primary');

                // "프로젝트에 추가" 텍스트가 있는 버튼 찾기
                let addToProjectButton = null;
                for (const button of buttons) {
                    if (button.textContent.trim().includes('프로젝트에 추가')) {
                        addToProjectButton = button;
                        break;
                    }
                }

                if (!addToProjectButton) {
                    throw new Error('프로젝트에 추가 버튼을 찾을 수 없습니다.');
                }

                // 버튼 클릭
                addToProjectButton.click();
                updateStatus('프로젝트에 추가 버튼을 클릭했습니다.');
                resolve(true);
            } catch (error) {
                updateStatus(`프로젝트에 추가 버튼 클릭 오류: ${error.message}`, true);
                reject(error);
            }
        });
    }

    // 검색 입력 및 실행
    function handleSearch(characterName) {
        return new Promise(async (resolve, reject) => {
            try {
                // 대기 시간 설정 가져오기
                const waitTimeElement = document.getElementById('tc-wait-time');
                const waitTime = waitTimeElement ? (parseInt(waitTimeElement.value) || 2000) : 2000;

                // 검색창 찾기
                const searchInput = await waitForElement('input[type="text"][name="search"][id="search"]', 5000);
                updateStatus('검색창에 포커스를 설정했습니다.');

                // 입력 방법에 따라 처리
                if (currentInputMethod === 1) {
                    try {
                        await inputMethod1(searchInput, characterName);
                    } catch (error) {
                        // 방법 1 실패 시 방법 2로 자동 전환
                        updateStatus('방법 1 실패. 방법 2로 전환합니다...', true);
                        currentInputMethod = 2;
                        await inputMethod2(searchInput, characterName);
                    }
                } else {
                    await inputMethod2(searchInput, characterName);
                }

                // 입력 완료 후 지연
                await sleep(waitTime / 2);

                // 항상 이벤트를 통한 엔터 방식 사용 (강제 이벤트)
                await triggerEnterEvent(searchInput);

                // 충분한 시간 대기 후 완료
                await sleep(waitTime / 2);
                updateStatus('검색 작업이 완료되었습니다.');
                resolve();
            } catch (error) {
                reject(`검색 처리 오류: ${error}`);
            }
        });
    }

    // 캐릭터 매핑 추가 함수 - 수정 버전
    function addCharacterMapping(name = '', number = 1) {
        const mappingsContainer = document.getElementById('character-mappings');
        if (!mappingsContainer) return;

        // 타입캐스트의 캐릭터 목록 가져오기
        const actorElements = document.querySelectorAll('.actors .tw-flex.tw-items-center.tw-h-12');

        // 캐릭터 목록이 비어있는 경우 기본값 처리
        const maxNumber = actorElements.length > 0 ? actorElements.length : 5;

        // number가 범위를, 벗어나지 않도록 보정
        if (number <= 0) number = 1;
        if (number > maxNumber) number = maxNumber;

        const mappingDiv = document.createElement('div');
        mappingDiv.style.cssText = 'display: flex; margin-bottom: 5px; align-items: center;';

        // 기본 선택 옵션 생성 - 캐릭터 목록이 없어도 최소한 1-5 표시
        let selectOptions = '';
        for (let i = 1; i <= Math.max(5, maxNumber); i++) {
            // 각 옵션에 타입캐스트 캐릭터 이름 추가 (가능한 경우)
            let optionLabel = i.toString();
            if (i-1 < actorElements.length) {
                const nameElement = actorElements[i-1].querySelector('.t-body2.tw-text-left');
                if (nameElement) {
                    const actorName = nameElement.textContent.trim();
                    optionLabel = `${i} (${actorName})`;
                }
            }

            selectOptions += `<option value="${i}" ${number === i ? 'selected' : ''}>${optionLabel}</option>`;
        }

        mappingDiv.innerHTML = `
        <input type="text" placeholder="캐릭터명" class="char-name" value="${name}" style="flex: 1; padding: 4px; margin-right: 5px;">
        <select class="char-number" style="width: 120px; padding: 4px;">
            ${selectOptions}
        </select>
        <button class="remove-mapping" style="margin-left: 5px; padding: 4px; background: #f44; color: white; border: none; border-radius: 3px;">X</button>
    `;

        mappingsContainer.appendChild(mappingDiv);

        // 삭제 버튼 이벤트 리스너
        mappingDiv.querySelector('.remove-mapping').addEventListener('click', function() {
            mappingsContainer.removeChild(mappingDiv);
        });

        // select 요소 이벤트 리스너 - 변경 시 시각적 피드백
        const selectElement = mappingDiv.querySelector('.char-number');
        if (selectElement) {
            selectElement.addEventListener('change', function() {
                updateStatus(`캐릭터 '${name}'의 번호가 ${this.value}번으로 변경되었습니다.`);
            });
        }
    }


//     // 캐릭터 매핑 추가 함수
//     function addCharacterMapping(name = '', number = 1) {
//         const mappingsContainer = document.getElementById('character-mappings');
//         if (!mappingsContainer) return;

//         // 타입캐스트의 캐릭터 목록 가져오기
//         const actorElements = document.querySelectorAll('.actors .tw-flex.tw-items-center.tw-h-12');
//         const maxNumber = actorElements.length;

//         // number가 범위를 벗어나지 않도록 보정
//         if (number <= 0) number = 1;
//         if (number > maxNumber) number = maxNumber;

//         const mappingDiv = document.createElement('div');
//         mappingDiv.style.cssText = 'display: flex; margin-bottom: 5px; align-items: center;';

//         // select 요소 동적 생성 (옵션은 실제 타입캐스트 캐릭터 수에 맞춤)
//         let selectOptions = '';
//         for (let i = 1; i <= maxNumber; i++) {
//             // 각 옵션에 타입캐스트 캐릭터 이름 추가 (가능한 경우)
//             let optionLabel = i.toString();
//             if (i-1 < actorElements.length) {
//                 const nameElement = actorElements[i-1].querySelector('.t-body2.tw-text-left');
//                 if (nameElement) {
//                     const actorName = nameElement.textContent.trim();
//                     optionLabel = `${i} (${actorName})`;
//                 }
//             }

//             selectOptions += `<option value="${i}" ${number === i ? 'selected' : ''}>${optionLabel}</option>`;
//         }

//         mappingDiv.innerHTML = `
//         <input type="text" placeholder="캐릭터명" class="char-name" value="${name}" style="flex: 1; padding: 4px; margin-right: 5px;">
//         <select class="char-number" style="width: 120px; padding: 4px;">
//             ${selectOptions}
//         </select>
//         <button class="remove-mapping" style="margin-left: 5px; padding: 4px; background: #f44; color: white; border: none; border-radius: 3px;">X</button>
//     `;

//         mappingsContainer.appendChild(mappingDiv);

//         // 삭제 버튼 이벤트 리스너
//         mappingDiv.querySelector('.remove-mapping').addEventListener('click', function() {
//             mappingsContainer.removeChild(mappingDiv);
//         });

//         // select 요소 이벤트 리스너 - 변경 시 시각적 피드백
//         const selectElement = mappingDiv.querySelector('.char-number');
//         selectElement.addEventListener('change', function() {
//             updateStatus(`캐릭터 '${name}'의 번호가 ${this.value}번으로 변경되었습니다.`);
//         });
//     }



    // 모든 select 요소의 옵션 업데이트
    function updateAllSelects(maxNumber) {
        const selects = document.querySelectorAll('#character-mappings .char-number');

        selects.forEach(select => {
            // 현재 선택된 값 저장
            const currentValue = select.value;

            // 기존 옵션보다 많은 경우에만 새 옵션 추가
            let needUpdate = false;
            if (select.options.length < maxNumber) {
                needUpdate = true;
            }

            if (needUpdate) {
                // 현재 선택 값 유지하면서 옵션 업데이트
                for (let i = select.options.length + 1; i <= maxNumber; i++) {
                    const option = document.createElement('option');
                    option.value = i.toString();
                    option.textContent = i.toString();
                    select.appendChild(option);
                }

                // data-max-index 업데이트
                select.dataset.maxIndex = maxNumber.toString();
            }

            // 원래 선택된 값으로 복원
            select.value = currentValue;
        });
    }

    // 사용자 정의 캐릭터 매핑 가져오기
    function getCharacterMapping() {
        const mapping = {};
        const mappingElements = document.querySelectorAll('#character-mappings > div');

        mappingElements.forEach(el => {
            const nameInput = el.querySelector('.char-name');
            const numberSelect = el.querySelector('.char-number');

            if (nameInput && numberSelect) {
                const name = nameInput.value.trim();
                const number = parseInt(numberSelect.value) - 1; // 인덱스는 0부터 시작

                if (name) {
                    mapping[name] = number;
                }
            }
        });

        return mapping;
    }

    // 디버그 정보 표시
    function debugScriptInfo() {
        const statusDiv = document.getElementById('tc-status-message');
        if (!statusDiv) return;

        const actors = document.querySelectorAll('.candidate-select .actors > div');
        let actorsInfo = 'Available actors:\n';

        actors.forEach((actor, idx) => {
            const actorName = actor.querySelector('.t-body2')?.textContent.trim();
            actorsInfo += `${idx}: ${actorName}\n`;
        });

        statusDiv.textContent = actorsInfo;
    }

    /***********************************************
     * 대본 분류 기능
     ***********************************************/

    // 대본 파싱 함수
    function parseScript(text) {
        const lines = text.trim().split('\n');
        const result = [];

        // 사용자 정의 캐릭터 매핑 가져오기
        const characterMapping = getCharacterMapping();
        const characterPatterns = Object.keys(characterMapping).map(char => char.trim());

        // 정규식 패턴 생성 - 모든 캐릭터 이름을 포함하도록
        const patternStr = `^(${characterPatterns.join('|')})\\s*:`;
        const characterRegex = new RegExp(patternStr, 'i');

        let lastCharacter = '해설'; // 기본값

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            // 캐릭터 패턴 매칭
            const characterMatch = line.match(characterRegex);

            if (characterMatch) {
                const character = characterMatch[1].trim(); // 띄어쓰기 제거
                const dialogue = line.substring(characterMatch[0].length).trim();

                if (dialogue) {
                    result.push({
                        character: character,
                        dialogue: dialogue
                    });
                    lastCharacter = character;
                }
            } else {
                // 캐릭터 표시가 없는 경우 이전 캐릭터의 대사로 간주
                if (result.length > 0) {
                    result.push({
                        character: lastCharacter,
                        dialogue: line
                    });
                }
            }
        }

        return result;
    }

    // 프로세스 시작 - 대본 자동화
    function startScriptProcess() {
        const scriptInput = document.getElementById('script-parser-input');
        if (!scriptInput) return;

        const scriptText = scriptInput.value;
        if (!scriptText.trim()) {
            updateStatus('대본을 입력해주세요.');
            return;
        }

        // 사용자 정의 캐릭터 매핑 가져오기
        const characterMapping = getCharacterMapping();

        if (Object.keys(characterMapping).length === 0) {
            updateStatus('캐릭터 매핑을 하나 이상 추가해주세요.');
            return;
        }

        parsedLines = parseScript(scriptText);

        if (parsedLines.length === 0) {
            updateStatus('파싱할 대본이 없습니다.');
            return;
        }

        currentLineIndex = 0;
        isScriptRunning = true;
        updateStatus(`대본 파싱 완료. ${parsedLines.length}개의 문단을 처리합니다.`);

        // 진행 상황 표시기 업데이트
        updateProgressDisplay();

        // 정지/재개 버튼 초기화
        const pauseResumeBtn = document.getElementById('pause-resume-btn');
        if (pauseResumeBtn) {
            pauseResumeBtn.textContent = '정지';
            pauseResumeBtn.style.backgroundColor = '#f44336'; // 빨강
        }

        // 진행 상황 표시기 표시
        const progressIndicator = document.getElementById('progress-indicator');
        if (progressIndicator) {
            progressIndicator.style.display = 'flex';
        }

        // 첫 번째 문단 처리 시작
        processNextLine();
    }

    // 다음 라인 처리 - 대본 자동화
    function processNextLine() {
        if (!isScriptRunning || currentLineIndex >= parsedLines.length) {
            if (currentLineIndex >= parsedLines.length) {
                updateStatus('모든 문단 처리 완료!');

                // 완료 시 정지/재개 버튼 업데이트
                const pauseResumeBtn = document.getElementById('pause-resume-btn');
                if (pauseResumeBtn) {
                    pauseResumeBtn.textContent = '완료';
                    pauseResumeBtn.style.backgroundColor = '#2196F3'; // 파랑
                }
            }

            isScriptRunning = false;
            return;
        }

        const line = parsedLines[currentLineIndex];
        updateStatus(`(${currentLineIndex + 1}/${parsedLines.length}) 처리 중: "${line.character}: ${line.dialogue.substring(0, 20)}..."`);

        // 진행 상황 표시기 업데이트
        updateProgressDisplay();

        // 다음 문단으로 이동하여 처리
        setTimeout(() => {
            focusCurrentParagraph()
                .then(() => selectCharacter(line.character))
                .then(() => inputDialogue(line.dialogue))
                .then(() => {
                    currentLineIndex++;

                    // 진행 상황 표시기 업데이트
                    updateProgressDisplay();

                    // 마지막 라인이 아니면 새 문단 추가
                    if (currentLineIndex < parsedLines.length) {
                        return addNewParagraph().then(() => {
                            // 문단 추가 후 다음 처리를 위한 시간 지연
                            if (isScriptRunning) {
                                scriptProcessTimeout = setTimeout(processNextLine, 1500);
                            }
                        });
                    } else {
                        updateStatus('모든 문단 처리 완료!');

                        // 완료 시 정지/재개 버튼 업데이트
                        const pauseResumeBtn = document.getElementById('pause-resume-btn');
                        if (pauseResumeBtn) {
                            pauseResumeBtn.textContent = '완료';
                            pauseResumeBtn.style.backgroundColor = '#2196F3'; // 파랑
                        }

                        isScriptRunning = false;
                    }
                })
                .catch(error => {
                    updateStatus(`오류 발생: ${error}`);
                    isScriptRunning = false;

                    // 오류 시 정지/재개 버튼 업데이트
                    const pauseResumeBtn = document.getElementById('pause-resume-btn');
                    if (pauseResumeBtn) {
                        pauseResumeBtn.textContent = '재개';
                        pauseResumeBtn.style.backgroundColor = '#4CAF50'; // 녹색
                    }
                });
        }, 200);
    }

    // 현재 문단 포커스 - 대본 자동화
    function focusCurrentParagraph() {
        return new Promise((resolve, reject) => {
            try {
                // 현재 에디터의 문단 요소 찾기
                const paragraphs = document.querySelectorAll('.ProseMirror p');

                if (paragraphs.length === 0) {
                    reject('문단 요소를 찾을 수 없습니다.');
                    return;
                }

                // 현재 인덱스에 맞는 문단 선택
                // 새 문단이 추가될 때마다 페이지를 새로 확인
                let paragraphIndex = Math.min(currentLineIndex, paragraphs.length - 1);
                let paragraph = paragraphs[paragraphIndex];

                // 문단에 focusing 클래스 추가
                paragraph.classList.add('has-focus');

                // 문단 클릭하여 포커스 주기
                paragraph.click();
                updateStatus(`${paragraphIndex + 1}번째 문단에 포커스 설정`);

                // ProseMirror 전체에 포커스
                const proseMirror = document.querySelector('.ProseMirror');
                if (proseMirror) {
                    proseMirror.focus();
                }

                // 강제로 문단을 활성화하기 위한 추가 작업
                setTimeout(() => {
                    // 문단 다시 클릭
                    paragraph.click();

                    // 캐릭터 메뉴 확인
                    const floatingMenu = document.querySelector(`.editor__floating-menu[style*="top: ${paragraph.offsetTop}px"]`);
                    if (floatingMenu) {
                        updateStatus(`문단 포커스 확인됨 - 메뉴 표시됨`);
                    } else {
                        updateStatus(`문단 포커스 시도 중...`);
                        // 한 번 더 시도
                        paragraph.click();
                    }

                    resolve();
                }, 100);
            } catch (error) {
                reject(`문단 포커스 오류: ${error}`);
            }
        });
    }

    // 새 문단 추가 함수 - 대본 자동화
    function addNewParagraph() {
        return new Promise((resolve, reject) => {
            try {
                // 현재 문단 수 기록
                const initialParagraphCount = document.querySelectorAll('.ProseMirror p').length;
                updateStatus(`현재 문단 수: ${initialParagraphCount}`);

                // 문단 추가 버튼 찾기
                const addButton = document.querySelector('.add-button-container');

                if (!addButton) {
                    reject('문단 추가 버튼을 찾을 수 없습니다.');
                    return;
                }

                // 스크롤이 필요한 경우 버튼을 화면으로 스크롤
                addButton.scrollIntoView({ behavior: 'smooth', block: 'center' });

                setTimeout(() => {
                    // 버튼 클릭
                    addButton.click();
                    updateStatus('새 문단 추가 중...');

                    // 문단이 추가될 때까지 기다림
                    setTimeout(() => {
                        // 문단 추가 후 확인
                        const currentParagraphCount = document.querySelectorAll('.ProseMirror p').length;
                        updateStatus(`문단 추가됨 - 총 ${currentParagraphCount}개 문단`);
                        resolve();
                    }, 200);
                }, 100);
            } catch (error) {
                reject(`문단 추가 오류: ${error}`);
            }
        });
    }

    // 캐릭터 선택 함수 - 대본 자동화
    function selectCharacter(characterType) {
        return new Promise((resolve, reject) => {
            try {
                // 사용자 정의 캐릭터 매핑 가져오기
                const characterMapping = getCharacterMapping();

                // 캐릭터 타입 정규화 (띄어쓰기 제거)
                const normalizedCharType = characterType.trim();

                // 매핑되지 않은 캐릭터 처리
                if (!(normalizedCharType in characterMapping)) {
                    updateStatus(`경고: "${normalizedCharType}" 캐릭터는 매핑되지 않았습니다. 기본값 사용.`);
                    // 기본값으로 첫 번째 캐릭터 사용
                    const defaultCharIndex = 0;
                    selectActorByIndex(defaultCharIndex, resolve, reject);
                    return;
                }

                // 매핑된 캐릭터 인덱스 가져오기
                const charIndex = characterMapping[normalizedCharType];
                selectActorByIndex(charIndex, resolve, reject);
            } catch (error) {
                reject(`캐릭터 선택 오류: ${error}`);
            }
        });
    }

    // 캐릭터 인덱스로 선택하는 함수 - 대본 자동화
    function selectActorByIndex(index, resolve, reject) {
        setTimeout(() => {
            // 현재 열린 캐릭터 선택 메뉴 찾기
            const characterMenu = document.querySelector('.candidate-select');
            if (!characterMenu) {
                reject('캐릭터 선택 메뉴를 찾을 수 없습니다.');
                return;
            }

            // 이미 열려있는 캐릭터 목록 확인
            let actorsContainer = characterMenu.querySelector('.actors');

            // 캐릭터 목록이 닫혀있으면 열기
            if (!actorsContainer) {
                const nameElement = characterMenu.querySelector('.selected.actor-color-name');
                if (nameElement) {
                    nameElement.click();

                    // 메뉴가 열릴 때까지 대기
                    setTimeout(() => {
                        actorsContainer = characterMenu.querySelector('.actors');
                        if (!actorsContainer) {
                            reject('캐릭터 목록을 열지 못했습니다.');
                            return;
                        }

                        selectActorFromContainer(actorsContainer, index, resolve, reject);
                    }, 500);
                    return;
                } else {
                    reject('캐릭터 선택 영역을 찾을 수 없습니다.');
                    return;
                }
            }

            // 이미 메뉴가 열려있으면 바로 선택
            selectActorFromContainer(actorsContainer, index, resolve, reject);
        }, 500);
    }

    // actorsContainer에서 인덱스로 캐릭터 선택 - 대본 자동화
    function selectActorFromContainer(actorsContainer, charIndex, resolve, reject) {
        try {
            // 캐릭터 목록 가져오기
            const actorElements = actorsContainer.querySelectorAll('div.tw-flex.tw-items-center.tw-h-12');

            if (actorElements.length === 0) {
                reject('캐릭터 목록이 비어있습니다.');
                return;
            }

            // 인덱스 확인
            if (charIndex < 0 || charIndex >= actorElements.length) {
                updateStatus(`경고: 캐릭터 인덱스(${charIndex})가 범위를 벗어났습니다. 첫 번째 캐릭터를 사용합니다.`);
                charIndex = 0;
            }

            // 해당 인덱스의 캐릭터 클릭
            actorElements[charIndex].click();

            // 캐릭터 이름 로깅 (디버깅용)
            const actorName = actorElements[charIndex].querySelector('.t-body2')?.textContent.trim();
            updateStatus(`캐릭터 선택: ${actorName || '(이름 없음)'} (인덱스 ${charIndex})`);

            setTimeout(resolve, 100);
        } catch (error) {
            reject(`액터 선택 오류: ${error}`);
        }
    }

    // 대사 입력 함수 - 대본 자동화
    function inputDialogue(text) {
        return new Promise((resolve, reject) => {
            try {
                setTimeout(() => {
                    // 현재 활성화된 문단 찾기
                    const paragraphs = document.querySelectorAll('.ProseMirror p');
                    const paragraphIndex = Math.min(currentLineIndex, paragraphs.length - 1);
                    const activeParagraph = paragraphs[paragraphIndex];

                    if (!activeParagraph) {
                        reject('활성화된 문단을 찾을 수 없습니다.');
                        return;
                    }

                    // 문단 클릭하여 포커스 설정
                    activeParagraph.click();

                    setTimeout(() => {
                        // span.query 요소 생성
                        const querySpan = document.createElement('span');
                        querySpan.className = 'query';
                        querySpan.setAttribute('data-query-id', `query_${Date.now()}`);
                        querySpan.setAttribute('data-query-style', 'normal-1');
                        querySpan.setAttribute('data-query-speed', '1');
                        querySpan.setAttribute('data-query-silence', '300');
                        querySpan.setAttribute('data-query-pitch', '0');
                        querySpan.setAttribute('data-query-tempo', '1');
                        querySpan.setAttribute('data-query-take', '0');

                        // 텍스트 내용 설정
                        querySpan.textContent = text;

                        // 문단 내용 대체
                        activeParagraph.innerHTML = '';
                        activeParagraph.appendChild(querySpan);

                        // 빈 상태 클래스 제거
                        activeParagraph.classList.remove('is-empty');
                        activeParagraph.classList.remove('is-editor-empty');

                        // input 이벤트 발생시켜 React에 변경 알리기
                        const event = new Event('input', { bubbles: true });
                        activeParagraph.dispatchEvent(event);

                        updateStatus(`텍스트 입력 완료: "${text.substring(0, 20)}..."`);

                        // 입력 완료 후 해결
                        setTimeout(resolve, 100);
                    }, 100);
                }, 200);
            } catch (error) {
                reject(`대사 입력 오류: ${error}`);
            }
        });
    }

    /***********************************************
     * 자동 드롭다운 선택 기능
     ***********************************************/

    // 자동으로 드롭다운 처리 함수 - 1, 2, 3 버튼을 프로그램이 자동으로 선택
    function autoSelectDropdown() {
        // 모든 캐릭터 드롭다운 찾기
        const dropdowns = document.querySelectorAll('.selected.actor-color-name');
        if (dropdowns.length === 0) {
            updateStatus('자동 드롭다운 처리: 캐릭터 드롭다운을 찾을 수 없습니다.', true);
            return Promise.resolve(false);
        }

        return new Promise(async (resolve, reject) => {
            try {
                updateStatus('자동 드롭다운 처리 시작...');

                // 캐릭터 매핑 정보 가져오기
                const characterMapping = getCharacterMapping();

                // 이미 처리된 캐릭터 수 확인
                const processedCount = Object.keys(processedCharacters).length;

                // 드롭다운 처리
                for (let i = 0; i < dropdowns.length; i++) {
                    const dropdown = dropdowns[i];
                    const dropdownText = dropdown.textContent.trim();

                    // 이미 처리된 캐릭터인지 확인
                    if (processedCharacters[dropdownText]) {
                        updateStatus(`'${dropdownText}' 캐릭터는 이미 처리되었습니다. 건너뜁니다.`);
                        continue;
                    }

                    // 캐릭터 매핑에 있는지 확인
                    const characterIndex = characterMapping[dropdownText];
                    if (characterIndex === undefined) {
                        updateStatus(`'${dropdownText}' 캐릭터는 매핑되지 않았습니다. 다음으로 넘어갑니다.`, true);
                        continue;
                    }

                    updateStatus(`'${dropdownText}' 캐릭터 드롭다운 처리 중... (인덱스: ${characterIndex})`);

                    // 드롭다운 클릭하여 열기
                    dropdown.click();
                    await sleep(500);

                    // 열린 드롭다운에서 캐릭터 목록 찾기
                    const actorsContainer = document.querySelector('.actors');
                    if (!actorsContainer) {
                        updateStatus('캐릭터 목록을 찾을 수 없습니다.', true);
                        continue;
                    }

                    // 인덱스로 캐릭터 선택
                    try {
                        await new Promise((resolveSelect, rejectSelect) => {
                            selectActorFromContainer(actorsContainer, characterIndex, resolveSelect, rejectSelect);
                        });

                        // 처리 완료 표시
                        processedCharacters[dropdownText] = true;
                        updateStatus(`'${dropdownText}' 캐릭터 드롭다운 처리 완료`);

                        // 다음 드롭다운 처리 전 잠시 대기
                        await sleep(800);
                    } catch (error) {
                        updateStatus(`'${dropdownText}' 캐릭터 선택 오류: ${error}`, true);
                    }
                }

                updateStatus(`자동 드롭다운 처리 완료. 처리된 캐릭터: ${Object.keys(processedCharacters).length - processedCount}개`);
                resolve(true);
            } catch (error) {
                updateStatus(`자동 드롭다운 처리 오류: ${error}`, true);
                reject(error);
            }
        });
    }

    // syncCharactersFromFinder 함수 또는 다른 적절한 함수 끝부분에 다음 코드를 추가
    function autoStartScriptProcess() {
        // 캐릭터 동기화 후 약간의 지연 시간을 두고 대본 분류하기 버튼 클릭
        setTimeout(() => {
            const parseScriptBtn = document.getElementById('parse-script-btn');
            if (parseScriptBtn) {
                updateStatus('대본 분류하기 버튼을 자동으로 클릭합니다...');
                parseScriptBtn.click();
            } else {
                updateStatus('대본 분류하기 버튼을 찾을 수 없습니다.', true);
            }
        }, 1000); // 1초 지연 (필요에 따라 조정)
    }

    /***********************************************
     * 초기화 및 실행
     ***********************************************/
    // 통합 초기화 함수
    function initializeScript() {
        // 페이지가 완전히 로드된 후 실행
        setTimeout(() => {
            createIntegratedUI();   // 통합 UI 생성

            // 자동 드롭다운 선택 기능 추가 (5초 후 실행)
            setTimeout(() => {
                autoSelectDropdown()
                    .then(result => {
                        if (result) {
                            updateStatus('자동 드롭다운 선택이 성공적으로 완료되었습니다.');
                        }
                    })
                    .catch(error => {
                        updateStatus(`자동 드롭다운 선택 중 오류 발생: ${error}`, true);
                    });
            }, 5000);
        }, 2000);
    }



    // 초기화
    window.addEventListener('load', initializeScript);
})();
