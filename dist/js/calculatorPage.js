function setupCalculators() {
    // --- Arithmetic Calculator Logic ---
    const display = document.getElementById('calc-display');
    const calcButtons = document.querySelectorAll('.calc-btn');
    let currentInput = '0';
    let shouldResetDisplay = true;

    // To prevent multiple listeners, we clone and replace the buttons
    calcButtons.forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', () => {
            const value = newButton.textContent;

            if (newButton.classList.contains('calc-num')) {
                if (currentInput === '0' || shouldResetDisplay) {
                    currentInput = value;
                    shouldResetDisplay = false;
                } else {
                    currentInput += value;
                }
            } else if (newButton.classList.contains('calc-op')) {
                currentInput += ` ${value} `;
                shouldResetDisplay = false;
            } else if (value === '=') {
                try {
                    let expression = currentInput.replace(/×/g, '*').replace(/÷/g, '/');
                    let result = eval(expression);
                    currentInput = result.toString();
                    shouldResetDisplay = true;
                } catch (error) {
                    currentInput = 'Error';
                    shouldResetDisplay = true;
                }
            } else if (value === 'C') {
                currentInput = '0';
                shouldResetDisplay = true;
            }
            
            display.textContent = currentInput;
        });
    });
    // Initial display state
    display.textContent = '0';


    // --- LLM Cost Calculator Logic ---
    const modelPricing = {
        "GPT-4o": { prompt: 0.005, completion: 0.015 },
        "GPT-4 Turbo": { prompt: 0.01, completion: 0.03 },
        "GPT-3.5 Turbo": { prompt: 0.0005, completion: 0.0015 },
        "Claude 3 Opus": { prompt: 0.015, completion: 0.075 },
        "Claude 3 Sonnet": { prompt: 0.003, completion: 0.015 },
        "Gemini 1.5 Pro": { prompt: 0.0035, completion: 0.0105 },
    };

    const modelSelect = document.getElementById('model');
    const promptTokensInput = document.getElementById('prompt-tokens');
    const completionTokensInput = document.getElementById('completion-tokens');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultDiv = document.getElementById('result');

    // Populate dropdown only if it's not already populated
    if (modelSelect.options.length === 0) {
        for (const modelName in modelPricing) {
            const option = document.createElement('option');
            option.value = modelName;
            option.textContent = modelName;
            modelSelect.appendChild(option);
        }
    }

    function calculateLlmCost() {
        const selectedModel = modelSelect.value;
        const promptTokens = parseInt(promptTokensInput.value) || 0;
        const completionTokens = parseInt(completionTokensInput.value) || 0;

        if (!selectedModel || !modelPricing[selectedModel]) {
            if (resultDiv) resultDiv.innerHTML = '<p class="text-red-500">Please select a valid model.</p>';
            return;
        }

        const pricing = modelPricing[selectedModel];
        const promptCost = (promptTokens / 1000) * pricing.prompt;
        const completionCost = (completionTokens / 1000) * pricing.completion;
        const totalCost = promptCost + completionCost;

        if (resultDiv) {
            resultDiv.innerHTML = `
                <div class="space-y-3">
                    <div class="flex justify-between items-center"><span class="font-medium text-gray-600">Prompt Cost:</span><span class="font-bold text-lg text-blue-600">$${promptCost.toFixed(6)}</span></div>
                    <div class="flex justify-between items-center"><span class="font-medium text-gray-600">Completion Cost:</span><span class="font-bold text-lg text-green-600">$${completionCost.toFixed(6)}</span></div>
                    <hr class="my-2">
                    <div class="flex justify-between items-center"><span class="font-bold text-gray-800 text-xl">Total Cost:</span><span class="font-extrabold text-2xl text-gray-900">$${totalCost.toFixed(6)}</span></div>
                </div>
            `;
        }
    }

    const newCalculateBtn = calculateBtn.cloneNode(true);
    calculateBtn.parentNode.replaceChild(newCalculateBtn, calculateBtn);
    newCalculateBtn.addEventListener('click', calculateLlmCost);

    if (modelSelect.value) {
        calculateLlmCost();
    }

    setupTriangleCalculator();
}

function setupTriangleCalculator() {
    const inputs = {
        a: document.getElementById('side-a'),
        b: document.getElementById('side-b'),
        c: document.getElementById('side-c'),
        A: document.getElementById('angle-A'),
        B: document.getElementById('angle-B'),
        C: document.getElementById('angle-C'),
    };
    const calcBtn = document.getElementById('triangle-calculate-btn');
    const resetBtn = document.getElementById('triangle-reset-btn');
    const canvas = document.getElementById('triangle-canvas');
    const valuesDiv = document.getElementById('triangle-values');
    const errorDiv = document.getElementById('triangle-error');
    const ctx = canvas.getContext('2d');

    const toRad = (deg) => deg * Math.PI / 180;
    const toDeg = (rad) => rad * 180 / Math.PI;

    function drawTriangle(triangle) {
        // Set canvas resolution based on its displayed size
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientWidth * 0.8; // Maintain an aspect ratio

        const { a, b, c, A, B, C } = triangle;
        const padding = 40;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.font = "14px Arial";
        ctx.fillStyle = "black";

        // Scale the triangle to fit the canvas
        const maxSide = Math.max(a, b, c);
        const scale = (Math.min(canvasWidth, canvasHeight) - 2 * padding) / maxSide;

        // Let side 'a' be the base, from B to C
        const pB = { x: padding, y: canvasHeight - padding };
        const pC = { x: padding + a * scale, y: canvasHeight - padding };
        const pA = { 
            x: pB.x + c * scale * Math.cos(toRad(B)),
            y: pB.y - c * scale * Math.sin(toRad(B))
        };
        
        // Draw triangle
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.lineTo(pC.x, pC.y);
        ctx.closePath();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw labels
        // Vertices
        ctx.fillText(`A (${A.toFixed(1)}°)`, pA.x - 10, pA.y - 10);
        ctx.fillText(`B (${B.toFixed(1)}°)`, pB.x - 40, pB.y + 15);
        ctx.fillText(`C (${C.toFixed(1)}°)`, pC.x + 10, pC.y + 15);

        // Sides
        ctx.save();
        ctx.translate((pA.x + pB.x) / 2, (pA.y + pB.y) / 2);
        ctx.rotate(-Math.atan2(pB.y - pA.y, pB.x - pA.x));
        ctx.fillText(`c = ${c.toFixed(2)}`, -15, -8);
        ctx.restore();

        ctx.save();
        ctx.translate((pB.x + pC.x) / 2, (pB.y + pC.y) / 2);
        ctx.fillText(`a = ${a.toFixed(2)}`, -15, 20);
        ctx.restore();

        ctx.save();
        ctx.translate((pC.x + pA.x) / 2, (pC.y + pA.y) / 2);
        ctx.rotate(-Math.atan2(pA.y - pC.y, pA.x - pC.x));
        ctx.fillText(`b = ${b.toFixed(2)}`, -15, -8);
        ctx.restore();
    }

    function displayResults(triangle) {
        drawTriangle(triangle);
        valuesDiv.innerHTML = `
            <div class="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                <span class="font-medium text-gray-600">Side a:</span><span class="font-bold">${triangle.a.toFixed(3)}</span>
                <span class="font-medium text-gray-600">Angle A:</span><span class="font-bold">${triangle.A.toFixed(3)}°</span>
                <span class="font-medium text-gray-600">Side b:</span><span class="font-bold">${triangle.b.toFixed(3)}</span>
                <span class="font-medium text-gray-600">Angle B:</span><span class="font-bold">${triangle.B.toFixed(3)}°</span>
                <span class="font-medium text-gray-600">Side c:</span><span class="font-bold">${triangle.c.toFixed(3)}</span>
                <span class="font-medium text-gray-600">Angle C:</span><span class="font-bold">${triangle.C.toFixed(3)}°</span>
            </div>
            <hr class="my-3">
            <div class="flex justify-between items-center">
                <span class="font-bold text-lg">Area:</span>
                <span class="font-extrabold text-xl">${triangle.area.toFixed(3)}</span>
            </div>
        `;
        errorDiv.textContent = '';
    }

    function calculateTriangle() {
        let sides = { a: parseFloat(inputs.a.value), b: parseFloat(inputs.b.value), c: parseFloat(inputs.c.value) };
        let angles = { A: parseFloat(inputs.A.value), B: parseFloat(inputs.B.value), C: parseFloat(inputs.C.value) };

        const sideCount = Object.values(sides).filter(v => !isNaN(v) && v > 0).length;
        const angleCount = Object.values(angles).filter(v => !isNaN(v) && v > 0).length;

        if (sideCount + angleCount !== 3) {
            errorDiv.textContent = 'Please enter exactly 3 positive values.';
            return;
        }

        try {
            // SSS case
            if (sideCount === 3) {
                const { a, b, c } = sides;
                if (a + b <= c || a + c <= b || b + c <= a) throw new Error("Invalid sides (triangle inequality).");
                angles.A = toDeg(Math.acos((b * b + c * c - a * a) / (2 * b * c)));
                angles.B = toDeg(Math.acos((a * a + c * c - b * b) / (2 * a * c)));
                angles.C = 180 - angles.A - angles.B;
            }
            // SAS case
            else if (sideCount === 2 && angleCount === 1) {
                if (!isNaN(sides.a) && !isNaN(sides.b) && !isNaN(angles.C)) { // a, b, C
                    sides.c = Math.sqrt(sides.a**2 + sides.b**2 - 2 * sides.a * sides.b * Math.cos(toRad(angles.C)));
                    angles.A = toDeg(Math.asin(sides.a * Math.sin(toRad(angles.C)) / sides.c));
                    angles.B = 180 - angles.A - angles.C;
                } else if (!isNaN(sides.b) && !isNaN(sides.c) && !isNaN(angles.A)) { // b, c, A
                    sides.a = Math.sqrt(sides.b**2 + sides.c**2 - 2 * sides.b * sides.c * Math.cos(toRad(angles.A)));
                    angles.B = toDeg(Math.asin(sides.b * Math.sin(toRad(angles.A)) / sides.a));
                    angles.C = 180 - angles.A - angles.B;
                } else if (!isNaN(sides.a) && !isNaN(sides.c) && !isNaN(angles.B)) { // a, c, B
                    sides.b = Math.sqrt(sides.a**2 + sides.c**2 - 2 * sides.a * sides.c * Math.cos(toRad(angles.B)));
                    angles.A = toDeg(Math.asin(sides.a * Math.sin(toRad(angles.B)) / sides.b));
                    angles.C = 180 - angles.A - angles.B;
                } else {
                     // This is the ambiguous SSA case. For now, we'll ask for a non-ambiguous case.
                     throw new Error("Ambiguous case (SSA). Please provide a non-ambiguous case like SAS, ASA, or SSS.");
                }
            }
            // ASA or AAS case
            else if (sideCount === 1 && angleCount === 2) {
                const angleSum = Object.values(angles).filter(v => !isNaN(v)).reduce((s, v) => s + v, 0);
                if (angleSum >= 180) throw new Error("Sum of two angles cannot be 180° or more.");

                if (isNaN(angles.A)) angles.A = 180 - angles.B - angles.C;
                if (isNaN(angles.B)) angles.B = 180 - angles.A - angles.C;
                if (isNaN(angles.C)) angles.C = 180 - angles.A - angles.B;

                const sinA = Math.sin(toRad(angles.A));
                const sinB = Math.sin(toRad(angles.B));
                const sinC = Math.sin(toRad(angles.C));

                if (!isNaN(sides.a)) {
                    sides.b = sides.a * sinB / sinA;
                    sides.c = sides.a * sinC / sinA;
                } else if (!isNaN(sides.b)) {
                    sides.a = sides.b * sinA / sinB;
                    sides.c = sides.b * sinC / sinB;
                } else if (!isNaN(sides.c)) {
                    sides.a = sides.c * sinA / sinC;
                    sides.b = sides.c * sinB / sinC;
                }
            } else {
                throw new Error("Unsupported combination of inputs. Please provide SSS, SAS, ASA, or AAS.");
            }

            const { a, b, c } = sides;
            const { A, B, C } = angles;
            if ([a,b,c,A,B,C].some(v => isNaN(v) || v <= 0)) throw new Error("Calculation resulted in invalid triangle values.");

            const s = (a + b + c) / 2;
            const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

            displayResults({ a, b, c, A, B, C, area });

        } catch (e) {
            errorDiv.textContent = e.message;
            valuesDiv.innerHTML = '<p class="text-gray-500 text-center">Calculation failed.</p>';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    function resetCalculator() {
        Object.values(inputs).forEach(input => input.value = '');
        valuesDiv.innerHTML = '<p class="text-gray-500 text-center">Results will appear here.</p>';
        errorDiv.textContent = '';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    calcBtn.addEventListener('click', calculateTriangle);
    resetBtn.addEventListener('click', resetCalculator);

    setupVatCalculator();
}

function setupVatCalculator() {
    const totalInput = document.getElementById('vat-total');
    const supplyInput = document.getElementById('vat-supply');
    const taxInput = document.getElementById('vat-tax');
    const resetBtn = document.getElementById('vat-reset-btn');

    let isCalculating = false;

    const formatNumber = (num) => {
        if (isNaN(num) || num === null) return '';
        return Math.round(num).toLocaleString();
    };

    const parseNumber = (str) => {
        if (typeof str !== 'string') return NaN;
        return parseFloat(str.replace(/,/g, '')) || 0;
    };

    const updateValues = (source) => {
        if (isCalculating) return;
        isCalculating = true;

        const value = parseNumber(source.value);

        if (source.id === 'vat-total') {
            const supply = value / 1.1;
            const tax = value - supply;
            supplyInput.value = formatNumber(supply);
            taxInput.value = formatNumber(tax);
        } else if (source.id === 'vat-supply') {
            const tax = value * 0.1;
            const total = value + tax;
            totalInput.value = formatNumber(total);
            taxInput.value = formatNumber(tax);
        } else if (source.id === 'vat-tax') {
            const supply = value * 10;
            const total = supply + value;
            totalInput.value = formatNumber(total);
            supplyInput.value = formatNumber(supply);
        }
        
        // Format the source input field as well
        if (document.activeElement === source) {
            source.value = formatNumber(value);
        }

        isCalculating = false;
    };

    [totalInput, supplyInput, taxInput].forEach(input => {
        input.addEventListener('input', (e) => {
            updateValues(e.target);
        });
        // also format when user leaves the input field
        input.addEventListener('change', (e) => {
            const value = parseNumber(e.target.value);
            e.target.value = formatNumber(value);
        });
    });

    resetBtn.addEventListener('click', () => {
        isCalculating = true;
        totalInput.value = '';
        supplyInput.value = '';
        taxInput.value = '';
        isCalculating = false;
    });
}