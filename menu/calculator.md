<div class="flex flex-col md:flex-row gap-8 font-sans">
    <!-- Sidebar will be loaded here -->
    <div id="sidebar-container" class="w-full md:w-1/4"></div>

    <!-- Content Area -->
    <main id="calc-content" class="w-full md:w-3/4">
        <!-- Arithmetic Calculator -->
        <div id="arithmetic-calculator" class="calculator-panel" style="display: none;">
            <div class="bg-white p-6 rounded-lg shadow-md max-w-sm mx-auto">
                <h1 class="text-2xl font-bold mb-4 text-center text-gray-800">Simple Calculator</h1>
                <div id="calc-display" class="bg-gray-200 text-right text-3xl font-mono rounded-md p-4 mb-4 overflow-x-auto">0</div>
                <div class="grid grid-cols-4 gap-2">
                    <button class="calc-btn bg-red-500 hover:bg-red-600 text-white text-2xl p-4 rounded-md">C</button>
                    <button class="calc-btn calc-op bg-gray-300 hover:bg-gray-400 text-2xl p-4 rounded-md">/</button>
                    <button class="calc-btn calc-op bg-gray-300 hover:bg-gray-400 text-2xl p-4 rounded-md">*</button>
                    <button class="calc-btn calc-op bg-gray-300 hover:bg-gray-400 text-2xl p-4 rounded-md">-</button>
                    
                    <button class="calc-btn calc-num bg-gray-200 hover:bg-gray-300 text-2xl p-4 rounded-md">7</button>
                    <button class="calc-btn calc-num bg-gray-200 hover:bg-gray-300 text-2xl p-4 rounded-md">8</button>
                    <button class="calc-btn calc-num bg-gray-200 hover:bg-gray-300 text-2xl p-4 rounded-md">9</button>
                    <button class="calc-btn calc-op bg-gray-300 hover:bg-gray-400 text-2xl p-4 rounded-md row-span-2">+</button>

                    <button class="calc-btn calc-num bg-gray-200 hover:bg-gray-300 text-2xl p-4 rounded-md">4</button>
                    <button class="calc-btn calc-num bg-gray-200 hover:bg-gray-300 text-2xl p-4 rounded-md">5</button>
                    <button class="calc-btn calc-num bg-gray-200 hover:bg-gray-300 text-2xl p-4 rounded-md">6</button>
                    
                    <button class="calc-btn calc-num bg-gray-200 hover:bg-gray-300 text-2xl p-4 rounded-md">1</button>
                    <button class="calc-btn calc-num bg-gray-200 hover:bg-gray-300 text-2xl p-4 rounded-md">2</button>
                    <button class="calc-btn calc-num bg-gray-200 hover:bg-gray-300 text-2xl p-4 rounded-md">3</button>
                    <button class="calc-btn bg-blue-500 hover:bg-blue-600 text-white text-2xl p-4 rounded-md row-span-2">=</button>

                    <button class="calc-btn calc-num bg-gray-200 hover:bg-gray-300 text-2xl p-4 rounded-md col-span-2">0</button>
                    <button class="calc-btn calc-num bg-gray-200 hover:bg-gray-300 text-2xl p-4 rounded-md">.</button>
                </div>
            </div>
        </div>

        <!-- LLM Cost Calculator -->
        <div id="llm-calculator" class="calculator-panel" style="display: none;">
            <div class="bg-gray-100 p-8 rounded-lg shadow-md">
                <h1 class="text-2xl font-bold mb-6 text-gray-800">LLM Cost Calculator</h1>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white p-6 rounded-lg">
                        <div class="mb-4">
                            <label for="model" class="block text-sm font-medium text-gray-700 mb-2">Language Model</label>
                            <select id="model" name="model" class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></select>
                        </div>
                        <div class="mb-4">
                            <label for="prompt-tokens" class="block text-sm font-medium text-gray-700 mb-2">Prompt Tokens</label>
                            <input type="number" id="prompt-tokens" name="prompt-tokens" value="1000" class="w-full p-2 border border-gray-300 rounded-md">
                        </div>
                        <div class="mb-4">
                            <label for="completion-tokens" class="block text-sm font-medium text-gray-700 mb-2">Completion Tokens</label>
                            <input type="number" id="completion-tokens" name="completion-tokens" value="500" class="w-full p-2 border border-gray-300 rounded-md">
                        </div>
                        <button id="calculate-btn" class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700">Calculate Cost</button>
                    </div>
                    <div class="bg-white p-6 rounded-lg flex flex-col justify-center">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4">Estimated Cost</h2>
                        <div id="result" class="text-center"></div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>