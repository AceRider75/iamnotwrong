// Educational BJT Voltage Divider Bias Simulator

// Default parameters and ranges
const defaultParameters = {
  VCC: 12,
  R1: 22000,
  R2: 6800,
  RC: 2200,
  RE: 1000,
  beta: 100,
  VBE: 0.7
};

const parameterRanges = {
  VCC: { min: 5, max: 30, unit: "V", step: 0.1 },
  R1: { min: 1000, max: 100000, unit: "Ω", step: 100 },
  R2: { min: 1000, max: 100000, unit: "Ω", step: 100 },
  RC: { min: 100, max: 20000, unit: "Ω", step: 10 },
  RE: { min: 100, max: 5000, unit: "Ω", step: 10 },
  beta: { min: 50, max: 500, unit: "", step: 1 },
  VBE: { min: 0.6, max: 0.8, unit: "V", step: 0.01 }
};

// Example configurations from provided data
const exampleConfigurations = [
  {
    name: "General Purpose Amplifier",
    VCC: 12,
    R1: 22000,
    R2: 6800,
    RC: 2200,
    RE: 1000,
    beta: 100,
    VBE: 0.7
  },
  {
    name: "High Stability Design",
    VCC: 15,
    R1: 15000,
    R2: 3300,
    RC: 3900,
    RE: 1500,
    beta: 150,
    VBE: 0.7
  },
  {
    name: "Low Power Application",
    VCC: 9,
    R1: 47000,
    R2: 10000,
    RC: 4700,
    RE: 2200,
    beta: 200,
    VBE: 0.7
  }
];

// Global variables
let loadLineChart = null;
let currentMethod = 'exact';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  createParameterForm();
  populateExampleSelect();
  setupEventListeners();
  updateMethodExplanation();
  calculateAndUpdate();
});

// Create parameter input form
function createParameterForm() {
  const form = document.getElementById('paramForm');
  
  Object.keys(defaultParameters).forEach(param => {
    const range = parameterRanges[param];
    const paramGroup = document.createElement('div');
    paramGroup.className = 'param-group';
    
    const label = document.createElement('label');
    label.className = 'form-label';
    label.htmlFor = param;
    label.textContent = `${getParameterName(param)} (${range.unit})`;
    
    const input = document.createElement('input');
    input.type = 'number';
    input.id = param;
    input.className = 'form-control';
    input.value = defaultParameters[param];
    input.min = range.min;
    input.max = range.max;
    input.step = range.step;
    input.title = getParameterTooltip(param);
    
    const info = document.createElement('div');
    info.className = 'param-info';
    info.textContent = `Range: ${range.min} - ${range.max} ${range.unit}`;
    
    paramGroup.appendChild(label);
    paramGroup.appendChild(input);
    paramGroup.appendChild(info);
    form.appendChild(paramGroup);
  });
}

// Get human-readable parameter names
function getParameterName(param) {
  const names = {
    VCC: 'Supply Voltage',
    R1: 'Upper Divider Resistor',
    R2: 'Lower Divider Resistor',
    RC: 'Collector Resistor',
    RE: 'Emitter Resistor',
    beta: 'Current Gain (β)',
    VBE: 'Base-Emitter Voltage'
  };
  return names[param] || param;
}

// Get parameter tooltips
function getParameterTooltip(param) {
  const tooltips = {
    VCC: 'DC supply voltage for the circuit',
    R1: 'Upper resistor in the voltage divider bias network',
    R2: 'Lower resistor in the voltage divider bias network',
    RC: 'Collector load resistor',
    RE: 'Emitter stabilization resistor',
    beta: 'DC current gain of the transistor (IC/IB)',
    VBE: 'Base-emitter junction voltage drop'
  };
  return tooltips[param] || '';
}

// Populate example select
function populateExampleSelect() {
  const select = document.getElementById('exampleSelect');
  
  exampleConfigurations.forEach(config => {
    const option = document.createElement('option');
    option.value = config.name;
    option.textContent = config.name;
    select.appendChild(option);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Parameter inputs - use both input and change events for better responsiveness
  Object.keys(defaultParameters).forEach(param => {
    const input = document.getElementById(param);
    if (input) {
      input.addEventListener('input', handleParameterChange);
      input.addEventListener('change', handleParameterChange);
    }
  });
  
  // Analysis method radio buttons
  document.querySelectorAll('input[name="analysisMethod"]').forEach(radio => {
    radio.addEventListener('change', handleMethodChange);
  });
  
  // Reset button
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetParameters);
  }
  
  // Example select
  const exampleSelect = document.getElementById('exampleSelect');
  if (exampleSelect) {
    exampleSelect.addEventListener('change', loadExample);
  }
}

// Handle parameter change
function handleParameterChange(event) {
  // Validate input
  const input = event.target;
  const value = parseFloat(input.value);
  const param = input.id;
  const range = parameterRanges[param];
  
  if (isNaN(value) || value < range.min || value > range.max) {
    // Don't update if invalid
    return;
  }
  
  // Update calculations
  calculateAndUpdate();
}

// Handle method change
function handleMethodChange(event) {
  currentMethod = event.target.value;
  updateMethodExplanation();
  calculateAndUpdate();
}

// Update method explanation
function updateMethodExplanation() {
  const explanation = document.getElementById('methodExplanation');
  
  if (currentMethod === 'exact') {
    explanation.innerHTML = `
      <h4>Exact Method (Thevenin Equivalent)</h4>
      <p>This method uses Thevenin's theorem to simplify the voltage divider network into an equivalent circuit, then applies Kirchhoff's voltage law to solve for the exact operating point. It accounts for the loading effect of the base current on the voltage divider.</p>
      <p><strong>When to use:</strong> Always accurate, use when precision is critical or when the approximate method conditions aren't met.</p>
    `;
  } else {
    explanation.innerHTML = `
      <h4>Approximate Method</h4>
      <p>This method assumes the base current is negligible compared to the voltage divider current, simplifying the analysis. It's valid when RTH ≪ (β+1)×RE, meaning the voltage divider is "stiff" relative to the base loading.</p>
      <p><strong>When to use:</strong> Quick estimates when the stiff divider condition is satisfied. Much simpler calculations.</p>
    `;
  }
}

// Get current parameters
function getCurrentParameters() {
  const params = {};
  Object.keys(defaultParameters).forEach(param => {
    const element = document.getElementById(param);
    if (element) {
      const value = parseFloat(element.value);
      params[param] = isNaN(value) ? defaultParameters[param] : value;
    } else {
      params[param] = defaultParameters[param];
    }
  });
  return params;
}

// Calculate using exact method
function calculateExact(params) {
  const { VCC, R1, R2, RC, RE, beta, VBE } = params;
  
  // Step 1: Calculate Thevenin equivalent
  const VTH = VCC * (R2 / (R1 + R2));
  const RTH = (R1 * R2) / (R1 + R2);
  
  // Step 2: Solve for collector current using KVL
  const IC = (VTH - VBE) / (RE + RTH / beta);
  
  // Step 3: Calculate other parameters
  const IB = IC / beta;
  const IE = IC + IB;
  const VE = IE * RE;
  const VB = VE + VBE;
  const VC = VCC - IC * RC;
  const VCE = VC - VE;
  
  return {
    VTH, RTH, IC, IB, IE, VB, VE, VC, VCE,
    method: 'exact'
  };
}

// Calculate using approximate method
function calculateApproximate(params) {
  const { VCC, R1, R2, RC, RE, beta, VBE } = params;
  
  // Step 1: Calculate base voltage (assuming no loading)
  const VB = VCC * (R2 / (R1 + R2));
  
  // Step 2: Calculate emitter voltage
  const VE = VB - VBE;
  
  // Step 3: Calculate currents
  const IE = VE / RE;
  const IC = IE; // Approximation: IC ≈ IE
  const IB = IC / beta;
  
  // Step 4: Calculate collector voltage
  const VC = VCC - IC * RC;
  const VCE = VC - VE;
  
  // Calculate Thevenin for comparison
  const VTH = VCC * (R2 / (R1 + R2));
  const RTH = (R1 * R2) / (R1 + R2);
  
  return {
    VTH, RTH, IC, IB, IE, VB, VE, VC, VCE,
    method: 'approximate'
  };
}

// Generate calculation steps
function generateCalculationSteps(params, results) {
  const steps = [];
  
  if (currentMethod === 'exact') {
    steps.push({
      title: "Step 1: Calculate Thevenin Equivalent Voltage",
      formula: "VTH = VCC × (R2 / (R1 + R2))",
      explanation: "This is the voltage divider rule applied to the unloaded bias network. It represents the open-circuit voltage at the base when no current is drawn.",
      calculation: `VTH = ${params.VCC}V × (${params.R2}Ω / (${params.R1}Ω + ${params.R2}Ω))`,
      result: `VTH = ${results.VTH.toFixed(3)}V`
    });
    
    steps.push({
      title: "Step 2: Calculate Thevenin Equivalent Resistance",
      formula: "RTH = (R1 × R2) / (R1 + R2)",
      explanation: "This is the equivalent resistance looking into the voltage divider with the voltage source (VCC) shorted. It represents the internal resistance of the Thevenin equivalent circuit.",
      calculation: `RTH = (${params.R1}Ω × ${params.R2}Ω) / (${params.R1}Ω + ${params.R2}Ω)`,
      result: `RTH = ${results.RTH.toFixed(1)}Ω`
    });
    
    steps.push({
      title: "Step 3: Apply KVL to Base-Emitter Loop",
      formula: "VTH = IB×RTH + VBE + IE×RE",
      explanation: "Kirchhoff's Voltage Law: The sum of voltage drops around the base-emitter loop equals the Thevenin voltage. This accounts for the voltage drop across RTH due to base current.",
      calculation: "Substituting IC = β×IB and IE ≈ IC:",
      result: "VTH = IB×RTH + VBE + (β×IB)×RE"
    });
    
    steps.push({
      title: "Step 4: Solve for Collector Current",
      formula: "IC = (VTH - VBE) / (RE + RTH/β)",
      explanation: "This formula comes from solving the KVL equation for IC. The denominator shows that RE is the dominant term when RTH/β is small, which is desirable for stability.",
      calculation: `IC = (${results.VTH.toFixed(3)}V - ${params.VBE}V) / (${params.RE}Ω + ${results.RTH.toFixed(1)}Ω/${params.beta})`,
      result: `IC = ${(results.IC * 1000).toFixed(2)}mA`
    });
    
  } else {
    // Check approximate method validity
    const RTH = (params.R1 * params.R2) / (params.R1 + params.R2);
    const conditionValue = RTH / ((params.beta + 1) * params.RE);
    const conditionMet = conditionValue < 0.1; // RTH << (β+1)×RE
    
    steps.push({
      title: "Step 1: Check Approximate Method Validity",
      formula: "RTH ≪ (β+1)×RE",
      explanation: "For the approximate method to be valid, the Thevenin resistance should be much smaller than the reflected emitter resistance. This ensures base current loading is negligible.",
      calculation: `RTH = ${RTH.toFixed(1)}Ω, (β+1)×RE = ${((params.beta + 1) * params.RE).toFixed(0)}Ω`,
      result: `Ratio = ${conditionValue.toFixed(3)} ${conditionMet ? '(Condition met ✓)' : '(Condition not met ⚠️)'}`,
      conditionMet: conditionMet
    });
    
    steps.push({
      title: "Step 2: Calculate Base Voltage",
      formula: "VB = VCC × (R2 / (R1 + R2))",
      explanation: "When base loading is negligible, the base voltage equals the unloaded voltage divider output. This assumes the base current is much smaller than the divider current.",
      calculation: `VB = ${params.VCC}V × (${params.R2}Ω / (${params.R1}Ω + ${params.R2}Ω))`,
      result: `VB = ${results.VB.toFixed(3)}V`
    });
    
    steps.push({
      title: "Step 3: Calculate Emitter Voltage",
      formula: "VE = VB - VBE",
      explanation: "In an NPN transistor, the emitter is one VBE drop below the base. This is a fundamental relationship in the forward-active region.",
      calculation: `VE = ${results.VB.toFixed(3)}V - ${params.VBE}V`,
      result: `VE = ${results.VE.toFixed(3)}V`
    });
    
    steps.push({
      title: "Step 4: Calculate Collector Current",
      formula: "IC = IE = VE / RE",
      explanation: "Ohm's law applied to the emitter resistor. We use IC ≈ IE since the base current is much smaller than the emitter current (IB = IC/β).",
      calculation: `IC = ${results.VE.toFixed(3)}V / ${params.RE}Ω`,
      result: `IC = ${(results.IC * 1000).toFixed(2)}mA`
    });
  }
  
  // Common final steps
  steps.push({
    title: "Final Step: Calculate Collector-Emitter Voltage",
    formula: "VCE = VCC - IC×(RC + RE)",
    explanation: "The collector-emitter voltage is found by applying KVL around the collector-emitter loop. This determines the operating point position on the load line.",
    calculation: `VCE = ${params.VCC}V - ${(results.IC * 1000).toFixed(2)}mA × (${params.RC}Ω + ${params.RE}Ω)`,
    result: `VCE = ${results.VCE.toFixed(3)}V`
  });
  
  return steps;
}

// Display calculation steps
function displayCalculationSteps(steps) {
  const container = document.getElementById('calculationSteps');
  container.innerHTML = '';
  
  steps.forEach((step, index) => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'calculation-step';
    
    const header = document.createElement('div');
    header.className = 'step-header';
    header.textContent = step.title;
    
    const content = document.createElement('div');
    content.className = 'step-content';
    
    const formula = document.createElement('div');
    formula.className = 'step-formula';
    formula.textContent = step.formula;
    
    const explanation = document.createElement('div');
    explanation.className = 'step-explanation';
    explanation.textContent = step.explanation;
    
    const calculation = document.createElement('div');
    calculation.className = 'step-calculation';
    calculation.textContent = step.calculation;
    
    const result = document.createElement('div');
    result.className = 'step-result';
    result.textContent = step.result;
    
    // Add condition checking for approximate method
    if (step.conditionMet !== undefined) {
      const conditionDiv = document.createElement('div');
      conditionDiv.className = `condition-check ${step.conditionMet ? 'condition-met' : 'condition-not-met'}`;
      conditionDiv.textContent = step.conditionMet ? 
        'Approximate method is valid for this circuit.' : 
        'Approximate method may not be accurate - consider using exact method.';
      content.appendChild(conditionDiv);
    }
    
    content.appendChild(formula);
    content.appendChild(explanation);
    content.appendChild(calculation);
    content.appendChild(result);
    
    stepDiv.appendChild(header);
    stepDiv.appendChild(content);
    container.appendChild(stepDiv);
  });
}

// Update results display
function updateResults(results) {
  const resultsGrid = document.getElementById('resultsGrid');
  resultsGrid.innerHTML = '';
  
  const displayResults = [
    { label: 'Base Voltage', value: results.VB, unit: 'V', precision: 3 },
    { label: 'Emitter Voltage', value: results.VE, unit: 'V', precision: 3 },
    { label: 'Collector Voltage', value: results.VC, unit: 'V', precision: 3 },
    { label: 'VCE', value: results.VCE, unit: 'V', precision: 3 },
    { label: 'Collector Current', value: results.IC * 1000, unit: 'mA', precision: 2 },
    { label: 'Emitter Current', value: results.IE * 1000, unit: 'mA', precision: 2 },
    { label: 'Base Current', value: results.IB * 1000000, unit: 'µA', precision: 1 },
    { label: 'Power Dissipation', value: results.VCE * results.IC * 1000, unit: 'mW', precision: 2 }
  ];
  
  displayResults.forEach(result => {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result-item';
    
    const label = document.createElement('div');
    label.className = 'result-label';
    label.textContent = result.label;
    
    const value = document.createElement('div');
    value.className = 'result-value';
    value.textContent = result.value.toFixed(result.precision);
    
    const unit = document.createElement('span');
    unit.className = 'result-unit';
    unit.textContent = ` ${result.unit}`;
    
    value.appendChild(unit);
    resultDiv.appendChild(label);
    resultDiv.appendChild(value);
    resultsGrid.appendChild(resultDiv);
  });
}

// Update method comparison
function updateMethodComparison(params) {
  const exactResults = calculateExact(params);
  const approxResults = calculateApproximate(params);
  
  const container = document.getElementById('methodComparison');
  container.innerHTML = '';
  
  const exactColumn = document.createElement('div');
  exactColumn.className = 'comparison-column comparison-exact';
  exactColumn.innerHTML = `
    <h4>Exact Method Results</h4>
    <div class="comparison-result">
      <span>IC:</span>
      <span>${(exactResults.IC * 1000).toFixed(2)} mA</span>
    </div>
    <div class="comparison-result">
      <span>VCE:</span>
      <span>${exactResults.VCE.toFixed(3)} V</span>
    </div>
    <div class="comparison-result">
      <span>VB:</span>
      <span>${exactResults.VB.toFixed(3)} V</span>
    </div>
  `;
  
  const approxColumn = document.createElement('div');
  approxColumn.className = 'comparison-column comparison-approximate';
  
  const icDiff = Math.abs(exactResults.IC - approxResults.IC) / exactResults.IC * 100;
  const vceDiff = Math.abs(exactResults.VCE - approxResults.VCE) / exactResults.VCE * 100;
  const vbDiff = Math.abs(exactResults.VB - approxResults.VB) / exactResults.VB * 100;
  
  approxColumn.innerHTML = `
    <h4>Approximate Method Results</h4>
    <div class="comparison-result">
      <span>IC:</span>
      <span>${(approxResults.IC * 1000).toFixed(2)} mA</span>
      <span class="comparison-difference">(${icDiff.toFixed(1)}% diff)</span>
    </div>
    <div class="comparison-result">
      <span>VCE:</span>
      <span>${approxResults.VCE.toFixed(3)} V</span>
      <span class="comparison-difference">(${vceDiff.toFixed(1)}% diff)</span>
    </div>
    <div class="comparison-result">
      <span>VB:</span>
      <span>${approxResults.VB.toFixed(3)} V</span>
      <span class="comparison-difference">(${vbDiff.toFixed(1)}% diff)</span>
    </div>
  `;
  
  container.appendChild(exactColumn);
  container.appendChild(approxColumn);
}

// Update operating status
function updateOperatingStatus(results) {
  const opStatus = document.getElementById('opStatus');
  
  let status, statusClass;
  if (results.VCE < 0.2) {
    status = 'Saturation';
    statusClass = 'status--saturation';
  } else if (results.IC <= 0 || results.VCE >= 15) {
    status = 'Cutoff';
    statusClass = 'status--cutoff';
  } else {
    status = 'Active';
    statusClass = 'status--active';
  }
  
  opStatus.textContent = status;
  opStatus.className = `status ${statusClass}`;
}

// Update load line chart
function updateLoadLineChart(params, results) {
  const ctx = document.getElementById('loadLineChart').getContext('2d');
  
  const VCE_sat = 0;
  const VCE_cutoff = params.VCC;
  const IC_sat = params.VCC / (params.RC + params.RE);
  const IC_cutoff = 0;
  
  if (loadLineChart) {
    loadLineChart.destroy();
  }
  
  loadLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Load Line',
          data: [
            { x: VCE_sat, y: IC_sat * 1000 },
            { x: VCE_cutoff, y: IC_cutoff * 1000 }
          ],
          borderColor: '#1FB8CD',
          backgroundColor: 'rgba(31, 184, 205, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        },
        {
          label: 'Q-Point',
          data: [{ x: results.VCE, y: results.IC * 1000 }],
          borderColor: '#B4413C',
          backgroundColor: '#B4413C',
          pointRadius: 8,
          pointHoverRadius: 10,
          showLine: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: {
            display: true,
            text: 'VCE (V)'
          },
          min: 0,
          max: Math.max(params.VCC, results.VCE + 2)
        },
        y: {
          title: {
            display: true,
            text: 'IC (mA)'
          },
          min: 0,
          max: Math.max(IC_sat * 1000, results.IC * 1000) * 1.2
        }
      }
    }
  });
}

// Main calculation and update function
function calculateAndUpdate() {
  const params = getCurrentParameters();
  
  let results;
  if (currentMethod === 'exact') {
    results = calculateExact(params);
  } else {
    results = calculateApproximate(params);
  }
  
  const steps = generateCalculationSteps(params, results);
  
  displayCalculationSteps(steps);
  updateResults(results);
  updateMethodComparison(params);
  updateOperatingStatus(results);
  updateLoadLineChart(params, results);
  
  // Update example select to show custom when parameters change
  const exampleSelect = document.getElementById('exampleSelect');
  if (exampleSelect) {
    exampleSelect.value = 'custom';
  }
}

// Reset parameters
function resetParameters() {
  Object.keys(defaultParameters).forEach(param => {
    const element = document.getElementById(param);
    if (element) {
      element.value = defaultParameters[param];
    }
  });
  
  // Reset method to exact
  const exactRadio = document.querySelector('input[name="analysisMethod"][value="exact"]');
  if (exactRadio) {
    exactRadio.checked = true;
    currentMethod = 'exact';
  }
  
  updateMethodExplanation();
  calculateAndUpdate();
}

// Load example configuration
function loadExample() {
  const exampleSelect = document.getElementById('exampleSelect');
  if (!exampleSelect) return;
  
  const selectedName = exampleSelect.value;
  
  if (selectedName === 'custom') return;
  
  const config = exampleConfigurations.find(c => c.name === selectedName);
  if (!config) return;
  
  Object.keys(defaultParameters).forEach(param => {
    const element = document.getElementById(param);
    if (element && config[param] !== undefined) {
      element.value = config[param];
    }
  });
  
  calculateAndUpdate();
}