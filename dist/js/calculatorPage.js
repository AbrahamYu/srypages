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
                if (!shouldResetDisplay) {
                    currentInput += ` ${value} `;
                }
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
}