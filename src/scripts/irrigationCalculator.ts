export function initIrrigationCalculator() {
  // ROI Calculator Logic
  const calculatorForm = document.querySelector('form');
  const resultsDiv = document.getElementById('results');
  const waterSavingsSpan = document.getElementById('waterSavings');
  const yieldIncreaseSpan = document.getElementById('yieldIncrease');

  if (calculatorForm) {
    calculatorForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Get form values
      const areaInput = document.getElementById('area') as HTMLInputElement;
      const cropSelect = document.getElementById('crop') as HTMLSelectElement;
      const waterUsageInput = document.getElementById('waterUsage') as HTMLInputElement;
      const yieldInput = document.getElementById('yield') as HTMLInputElement;
      
      const area = areaInput?.value ? parseFloat(areaInput.value) : 0;
      const crop = cropSelect?.value || '';
      const currentWater = waterUsageInput?.value ? parseFloat(waterUsageInput.value) : 0;
      const currentYield = yieldInput?.value ? parseFloat(yieldInput.value) : 0;

      // Calculate savings (simplified example)
      const waterSavings = Math.round(currentWater * 0.4 * area); // 40% water savings
      const yieldIncrease = 35; // 35% yield increase

      // Display results
      if (resultsDiv && waterSavingsSpan && yieldIncreaseSpan) {
        resultsDiv.classList.remove('hidden');
        waterSavingsSpan.textContent = waterSavings.toLocaleString();
        yieldIncreaseSpan.textContent = yieldIncrease.toString();
      }
    });
  }
}