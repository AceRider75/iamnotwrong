// ElectroSolve v2 - Enhanced Modular Electronics Problem Solver
// Fixed Q-point coordinate system bug AND navigation issues - 2025-07-14
class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.themeToggle = document.getElementById('theme-toggle');
    this.themeIcon = this.themeToggle.querySelector('.material-icons');
    this.init();
  }

  init() {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.currentTheme = 'dark';
    }
    
    this.applyTheme();
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
    
    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        this.currentTheme = e.matches ? 'dark' : 'light';
        this.applyTheme();
      });
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme();
  }

  applyTheme() {
    document.documentElement.setAttribute('data-color-scheme', this.currentTheme);
    this.themeIcon.textContent = this.currentTheme === 'light' ? 'dark_mode' : 'light_mode';
  }
}


// ===== UTILITY FUNCTIONS =====
// ElectroSolve v2 - Enhanced Modular Electronics Problem Solver
// Fixed Q-point coordinate system bug AND navigation issues - 2025-07-14

// ===== UTILITY FUNCTIONS =====
const formatNumber = (num, decimals = 3) => {
  if (Math.abs(num) < 0.001) return num.toExponential(2);
  return Number(num.toFixed(decimals));
};

const formatValue = (value, unit = '') => {
  const formatted = formatNumber(value);
  return `${formatted}${unit ? ' ' + unit : ''}`;
};

// ===== FIXED DYNAMIC LOAD LINE DRAWING UTILITY =====
function drawLoadLine(canvas, IcSat, VceCutoff, qPoint, snapToLoadLine = false) {
  const ctx = canvas.getContext('2d');

  // Sync canvas size with CSS display size
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  const width = canvas.width;
  const height = canvas.height;
  const margin = 60;
  const plotWidth = width - 2 * margin;
  const plotHeight = height - 2 * margin;

  // Convert currents from mA to μA for plotting
  const maxIC = IcSat*1;       // μA scale with padding
  const maxVCE = VceCutoff * 1;         // V scale with padding

  ctx.clearRect(0, 0, width, height);

  // Draw background
  ctx.fillStyle = '#f9f9f9';
  ctx.fillRect(margin, margin, plotWidth, plotHeight);

  // Draw grid lines
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 10; i++) {
    const x = margin + (i * plotWidth / 10);
    const y = margin + (i * plotHeight / 10);
    // Vertical grid line
    ctx.beginPath();
    ctx.moveTo(x, margin);
    ctx.lineTo(x, height - margin);
    ctx.stroke();
    // Horizontal grid line
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(width - margin, y);
    ctx.stroke();
  }

  // Draw axes
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin, margin);
  ctx.lineTo(margin, height - margin);
  ctx.lineTo(width - margin, height - margin);
  ctx.stroke();

  // Draw load line
  ctx.strokeStyle = '#2196F3';
  ctx.lineWidth = 3;
  ctx.beginPath();
  const x1 = margin;               // VCE = 0
  const y1 = margin;               // IC = IcSat (top)
  const x2 = margin + plotWidth * (VceCutoff / maxVCE);  // VCE = cutoff (right)
  const y2 = margin + plotHeight; // IC = 0 (bottom)
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Calculate Q-point coordinates
  let actualVCE = qPoint.VCE;
  let actualIC = qPoint.IC;

  if (snapToLoadLine) {
    // Snap IC onto load line: IC = IcSat * (1 - VCE / VceCutoff)
    actualIC = IcSat * (1 - actualVCE / VceCutoff);
  }

  // Convert IC from mA to μA for plotting
  actualIC = actualIC * 1000;

  // Clamp values inside axis limits
  actualIC = Math.max(0, Math.min(actualIC, maxIC));
  actualVCE = Math.max(0, Math.min(actualVCE, maxVCE));

  // Convert Q-point to canvas coordinates
  const qX = margin + plotWidth * (actualVCE / maxVCE);
  const qY = margin + plotHeight * (1 - actualIC / maxIC);

  // Draw Q-point
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.arc(qX, qY, 6, 0, 2 * Math.PI);
  ctx.fill();

  ctx.strokeStyle = '#cc0000';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw crosshairs for Q-point
  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(qX, margin);
  ctx.lineTo(qX, height - margin);
  ctx.moveTo(margin, qY);
  ctx.lineTo(width - margin, qY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Axis labels
  ctx.fillStyle = '#333';
  ctx.font = '10px Arial';
  ctx.textAlign = 'right';
  ctx.fillText('VCE (V)', width / 2, height - 15);
  ctx.save();
  ctx.translate(15, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('IC (mA)', 0, 0);
  ctx.restore();

  // Numeric axis labels in μA for IC
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  for (let i = 0; i <= 10; i++) {
    const vceVal = (i * maxVCE / 10);
    const icVal = (i * maxIC );
    const x = margin + (i * plotWidth / 10);
    const y = margin + plotHeight * (1 - i / 10);

    if (i % 2 === 0) {
      ctx.fillText(vceVal.toFixed(1), x, height - margin + 20);
      ctx.fillText((icVal / 10000).toFixed(2), margin - 30, y + 5);

    }
  }

  // Title
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('DC Load Line & Q-Point', width / 2, 25);

  // Legend
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#2196F3';
  ctx.fillText('— Load Line', width - 150, 50);
  ctx.fillStyle = '#ff4444';
  ctx.fillText('● Q-Point', width - 150, 70);

  // Q-point info
  ctx.fillStyle = '#333';
  ctx.fillText(`Q-Point: (${actualVCE.toFixed(2)}V, ${(actualIC/1000).toFixed(2)}mA)`, width - 150, 90);
}



// ===== ENHANCED BJT SOLVER CLASS =====
class BJTSolver {
  static biasTypes = {
    'base': 'Base Bias',
    'voltage-divider': 'Voltage Divider Bias',
    'collector-feedback': 'Collector Feedback Bias',
    'emitter-bias': 'Emitter Bias (Single Supply)',
    'dual-supply': 'Dual Supply Emitter Bias'
  };

  static getInputSchema(biasType) {
    const schemas = {
      'base': [
        { name: 'VCC', label: 'Supply Voltage (VCC)', unit: 'V', default: 12 },
        { name: 'RB', label: 'Base Resistor (RB)', unit: 'kΩ', default: 470 },
        { name: 'RC', label: 'Collector Resistor (RC)', unit: 'kΩ', default: 2.2 },
        { name: 'RE', label: 'Emitter Resistor (RE)', unit: 'kΩ', default: 1.0 },
        { name: 'beta', label: 'Current Gain (β)', unit: '', default: 100 },
        { name: 'VBE', label: 'Base-Emitter Voltage (VBE)', unit: 'V', default: 0.7 }
      ],
      'voltage-divider': [
        { name: 'VCC', label: 'Supply Voltage (VCC)', unit: 'V', default: 12 },
        { name: 'R1', label: 'Upper Divider Resistor (R1)', unit: 'kΩ', default: 10 },
        { name: 'R2', label: 'Lower Divider Resistor (R2)', unit: 'kΩ', default: 2.2 },
        { name: 'RC', label: 'Collector Resistor (RC)', unit: 'kΩ', default: 2.2 },
        { name: 'RE', label: 'Emitter Resistor (RE)', unit: 'kΩ', default: 1.0 },
        { name: 'beta', label: 'Current Gain (β)', unit: '', default: 100 },
        { name: 'VBE', label: 'Base-Emitter Voltage (VBE)', unit: 'V', default: 0.7 }
      ],
      'collector-feedback': [
        { name: 'VCC', label: 'Supply Voltage (VCC)', unit: 'V', default: 12 },
        { name: 'RC', label: 'Collector Resistor (RC)', unit: 'kΩ', default: 2.2 },
        { name: 'RB', label: 'Base Resistor (RB)', unit: 'kΩ', default: 100 },
        { name: 'beta', label: 'Current Gain (β)', unit: '', default: 100 },
        { name: 'VBE', label: 'Base-Emitter Voltage (VBE)', unit: 'V', default: 0.7 }
      ],
      'emitter-bias': [
        { name: 'VCC', label: 'Supply Voltage (VCC)', unit: 'V', default: 12 },
        { name: 'RC', label: 'Collector Resistor (RC)', unit: 'kΩ', default: 2.2 },
        { name: 'RE', label: 'Emitter Resistor (RE)', unit: 'kΩ', default: 1.0 },
        { name: 'beta', label: 'Current Gain (β)', unit: '', default: 100 },
        { name: 'VBE', label: 'Base-Emitter Voltage (VBE)', unit: 'V', default: 0.7 }
      ],
      'dual-supply': [
        { name: 'VCC', label: 'Positive Supply (VCC)', unit: 'V', default: 12 },
        { name: 'VEE', label: 'Negative Supply (VEE)', unit: 'V', default: -12 },
        { name: 'RC', label: 'Collector Resistor (RC)', unit: 'kΩ', default: 2.2 },
        { name: 'RE', label: 'Emitter Resistor (RE)', unit: 'kΩ', default: 1.0 },
        { name: 'beta', label: 'Current Gain (β)', unit: '', default: 100 },
        { name: 'VBE', label: 'Base-Emitter Voltage (VBE)', unit: 'V', default: 0.7 }
      ]
    };
    return schemas[biasType] || [];
  }

  static getSVG(biasType) {
    const themeBlue = '#2196F3';
    const themeRed = '#ff4444';
    const themeGray = '#888';
    const themeWire = '#333';
    const themeResistor = '#FFC107';
    const themeGround = '#444';
    const themeVcc = '#43A047';
    // Standard NPN transistor symbol (no extra lines)
    const npnTransistor = `
      <g>
        <circle cx="0" cy="0" r="16" fill="white" stroke="#333" stroke-width="2"/>
        <!-- Collector (top) -->
        <line x1="0" y1="-16" x2="0" y2="-28" stroke="#333" stroke-width="2"/>
        <!-- Emitter (bottom, with arrow) -->
        <line x1="0" y1="16" x2="0" y2="32" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
        <!-- Base (left) -->
        <line x1="-16" y1="0" x2="-28" y2="0" stroke="#333" stroke-width="2"/>
        <!-- Internal base to emitter (inside circle only) -->
        <line x1="-12" y1="0" x2="0" y2="12" stroke="#333" stroke-width="2"/>
      </g>
    `;
    // Arrowhead marker for NPN emitter
    const arrowMarker = `<defs><marker id="arrowhead" markerWidth="8" markerHeight="8" refX="0" refY="4" orient="auto" markerUnits="strokeWidth"><polygon points="0 0, 8 4, 0 8" fill="#2196F3"/></marker></defs>`;
    // Standard base bias circuit
    const baseBias = `<svg width="340" height="220" viewBox="0 0 340 220">
      ${arrowMarker}
      <!-- Vcc rail -->
      <line x1="60" y1="40" x2="200" y2="40" stroke="#43A047" stroke-width="3"/>
      <text x="50" y="35" font-size="12" fill="#43A047">VCC</text>
      <!-- RB from Vcc to base -->
      <rect x="110" y="40" width="20" height="40" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="120" y="55" text-anchor="middle" font-size="12" fill="#333">RB</text>
      <line x1="120" y1="80" x2="120" y2="100" stroke="#333" stroke-width="2"/>
      <!-- Base to transistor -->
      <line x1="120" y1="100" x2="170" y2="100" stroke="#333" stroke-width="2"/>
      <!-- RC from Vcc to collector -->
      <rect x="180" y="40" width="20" height="40" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="190" y="55" text-anchor="middle" font-size="12" fill="#333">RC</text>
      <line x1="190" y1="80" x2="190" y2="100" stroke="#333" stroke-width="2"/>
      <!-- Collector to transistor -->
      <line x1="190" y1="100" x2="170" y2="100" stroke="#333" stroke-width="2"/>
      <!-- NPN transistor -->
      <g transform="translate(170,100)">${npnTransistor}</g>
      <!-- RE from emitter to ground -->
      <rect x="160" y="160" width="20" height="40" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="170" y="185" text-anchor="middle" font-size="12" fill="#333">RE</text>
      <line x1="170" y1="130" x2="170" y2="160" stroke="#333" stroke-width="2"/>
      <!-- Emitter to ground -->
      <line x1="170" y1="200" x2="170" y2="210" stroke="#444" stroke-width="3"/>
      <line x1="160" y1="210" x2="180" y2="210" stroke="#444" stroke-width="3"/>
      <line x1="163" y1="214" x2="177" y2="214" stroke="#444" stroke-width="2"/>
      <line x1="166" y1="218" x2="174" y2="218" stroke="#444" stroke-width="2"/>
      <text x="170" y="225" text-anchor="middle" font-size="12" fill="#444">GND</text>
    </svg>`;
    // Standard voltage divider bias circuit
    const voltageDivider = `<svg width="340" height="240" viewBox="0 0 340 240">
      ${arrowMarker}
      <!-- Vcc rail -->
      <line x1="60" y1="40" x2="200" y2="40" stroke="#43A047" stroke-width="3"/>
      <text x="50" y="35" font-size="12" fill="#43A047">VCC</text>
      <!-- R1 from Vcc to divider node -->
      <rect x="110" y="40" width="20" height="40" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="120" y="55" text-anchor="middle" font-size="12" fill="#333">R1</text>
      <line x1="120" y1="80" x2="120" y2="120" stroke="#333" stroke-width="2"/>
      <!-- R2 from divider node to ground -->
      <rect x="110" y="120" width="20" height="40" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="120" y="135" text-anchor="middle" font-size="12" fill="#333">R2</text>
      <line x1="120" y1="160" x2="120" y2="210" stroke="#333" stroke-width="2"/>
      <!-- Divider node to base -->
      <line x1="120" y1="120" x2="170" y2="120" stroke="#333" stroke-width="2"/>
      <!-- RC from Vcc to collector -->
      <rect x="180" y="40" width="20" height="40" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="190" y="55" text-anchor="middle" font-size="12" fill="#333">RC</text>
      <line x1="190" y1="80" x2="190" y2="120" stroke="#333" stroke-width="2"/>
      <!-- Collector to transistor -->
      <line x1="190" y1="120" x2="170" y2="120" stroke="#333" stroke-width="2"/>
      <!-- NPN transistor -->
      <g transform="translate(170,120)">${npnTransistor}</g>
      <!-- RE from emitter to ground -->
      <rect x="160" y="180" width="20" height="40" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="170" y="205" text-anchor="middle" font-size="12" fill="#333">RE</text>
      <line x1="170" y1="150" x2="170" y2="180" stroke="#333" stroke-width="2"/>
      <!-- Emitter to ground -->
      <line x1="170" y1="220" x2="170" y2="230" stroke="#444" stroke-width="3"/>
      <line x1="160" y1="230" x2="180" y2="230" stroke="#444" stroke-width="3"/>
      <line x1="163" y1="234" x2="177" y2="234" stroke="#444" stroke-width="2"/>
      <line x1="166" y1="238" x2="174" y2="238" stroke="#444" stroke-width="2"/>
      <text x="170" y="245" text-anchor="middle" font-size="12" fill="#444">GND</text>
    </svg>`;
    // --- BJT Collector-Feedback Bias ---
    const collectorFeedback = `<svg width="340" height="220" viewBox="0 0 340 220">
      ${arrowMarker}
      <line x1="60" y1="40" x2="200" y2="40" stroke="#43A047" stroke-width="3"/>
      <text x="50" y="35" font-size="12" fill="#43A047">VCC</text>
      <!-- RC from Vcc to collector -->
      <rect x="180" y="40" width="20" height="40" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="190" y="55" text-anchor="middle" font-size="12" fill="#333">RC</text>
      <line x1="190" y1="80" x2="190" y2="100" stroke="#333" stroke-width="2"/>
      <!-- Collector to transistor -->
      <line x1="190" y1="100" x2="170" y2="100" stroke="#333" stroke-width="2"/>
      <!-- RB from collector to base -->
      <rect x="120" y="80" width="20" height="40" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="130" y="95" text-anchor="middle" font-size="12" fill="#333">RB</text>
      <line x1="130" y1="80" x2="190" y2="80" stroke="#333" stroke-width="2"/>
      <line x1="130" y1="120" x2="130" y2="100" stroke="#333" stroke-width="2"/>
      <line x1="130" y1="100" x2="170" y2="100" stroke="#333" stroke-width="2"/>
      <!-- NPN transistor -->
      <g transform="translate(170,100)">${npnTransistor}</g>
      <!-- RE from emitter to ground -->
      <rect x="160" y="160" width="20" height="40" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="170" y="185" text-anchor="middle" font-size="12" fill="#333">RE</text>
      <line x1="170" y1="130" x2="170" y2="160" stroke="#333" stroke-width="2"/>
      <!-- Emitter to ground -->
      <line x1="170" y1="200" x2="170" y2="210" stroke="#444" stroke-width="3"/>
      <line x1="160" y1="210" x2="180" y2="210" stroke="#444" stroke-width="3"/>
      <line x1="163" y1="214" x2="177" y2="214" stroke="#444" stroke-width="2"/>
      <line x1="166" y1="218" x2="174" y2="218" stroke="#444" stroke-width="2"/>
      <text x="170" y="225" text-anchor="middle" font-size="12" fill="#444">GND</text>
    </svg>`;
    // --- BJT Emitter-Bias ---
    const emitterBias = `<svg width="340" height="220" viewBox="0 0 340 220">
      ${arrowMarker}
      <line x1="60" y1="40" x2="200" y2="40" stroke="#43A047" stroke-width="3"/>
      <text x="50" y="35" font-size="12" fill="#43A047">VCC</text>
      <!-- RC from Vcc to collector -->
      <rect x="180" y="40" width="20" height="40" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="190" y="55" text-anchor="middle" font-size="12" fill="#333">RC</text>
      <line x1="190" y1="80" x2="190" y2="100" stroke="#333" stroke-width="2"/>
      <!-- Collector to transistor -->
      <line x1="190" y1="100" x2="170" y2="100" stroke="#333" stroke-width="2"/>
      <!-- RE from emitter to ground -->
      <rect x="160" y="160" width="20" height="40" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="170" y="185" text-anchor="middle" font-size="12" fill="#333">RE</text>
      <line x1="170" y1="130" x2="170" y2="160" stroke="#333" stroke-width="2"/>
      <!-- Emitter to ground -->
      <line x1="170" y1="200" x2="170" y2="210" stroke="#444" stroke-width="3"/>
      <line x1="160" y1="210" x2="180" y2="210" stroke="#444" stroke-width="3"/>
      <line x1="163" y1="214" x2="177" y2="214" stroke="#444" stroke-width="2"/>
      <line x1="166" y1="218" x2="174" y2="218" stroke="#444" stroke-width="2"/>
      <text x="170" y="225" text-anchor="middle" font-size="12" fill="#444">GND</text>
      <!-- Base bias resistor to ground -->
      <rect x="80" y="100" width="20" height="40" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="90" y="115" text-anchor="middle" font-size="12" fill="#333">RB</text>
      <line x1="90" y1="100" x2="90" y2="130" stroke="#333" stroke-width="2"/>
      <line x1="90" y1="130" x2="170" y2="130" stroke="#333" stroke-width="2"/>
      <line x1="90" y1="140" x2="90" y2="210" stroke="#333" stroke-width="2"/>
      <line x1="90" y1="210" x2="170" y2="210" stroke="#333" stroke-width="2"/>
    </svg>`;
    // --- BJT Dual-Supply Bias ---
    const dualSupply = `<svg width="340" height="260" viewBox="0 0 340 260">
      ${arrowMarker}
      <line x1="60" y1="40" x2="200" y2="40" stroke="#43A047" stroke-width="3"/>
      <text x="50" y="35" font-size="12" fill="#43A047">VCC</text>
      <!-- RC from Vcc to collector -->
      <rect x="180" y="40" width="20" height="40" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="190" y="55" text-anchor="middle" font-size="12" fill="#333">RC</text>
      <line x1="190" y1="80" x2="190" y2="100" stroke="#333" stroke-width="2"/>
      <!-- Collector to transistor -->
      <line x1="190" y1="100" x2="170" y2="100" stroke="#333" stroke-width="2"/>
      <!-- RE from emitter to VEE -->
      <rect x="160" y="180" width="20" height="40" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="170" y="205" text-anchor="middle" font-size="12" fill="#333">RE</text>
      <line x1="170" y1="130" x2="170" y2="180" stroke="#333" stroke-width="2"/>
      <!-- Emitter to VEE -->
      <line x1="170" y1="220" x2="170" y2="240" stroke="#43A047" stroke-width="3"/>
      <text x="170" y="255" text-anchor="middle" font-size="12" fill="#43A047">VEE</text>
      <!-- Base bias resistor to ground -->
      <rect x="80" y="100" width="20" height="40" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="90" y="115" text-anchor="middle" font-size="12" fill="#333">RB</text>
      <line x1="90" y1="100" x2="90" y2="130" stroke="#333" stroke-width="2"/>
      <line x1="90" y1="130" x2="170" y2="130" stroke="#333" stroke-width="2"/>
    </svg>`;
    const schematics = {
      'base': baseBias,
      'voltage-divider': voltageDivider,
      'collector-feedback': collectorFeedback,
      'emitter-bias': emitterBias,
      'dual-supply': dualSupply,
    };
    return schematics[biasType] || '<svg width="300" height="200"><text x="150" y="100" text-anchor="middle">Schematic not available</text></svg>';
  }

  static solve(biasType, inputs) {
    switch (biasType) {
      case 'base':
        return this.solveBaseBias(inputs);
      case 'voltage-divider':
        return this.solveVoltageDivider(inputs);
      case 'collector-feedback':
        return this.solveCollectorFeedback(inputs);
      case 'emitter-bias':
        return this.solveEmitterBias(inputs);
      case 'dual-supply':
        return this.solveDualSupply(inputs);
      default:
        throw new Error(`Unsupported bias type: ${biasType}`);
    }
  }

  static solveBaseBias(inputs) {
    const { VCC, RB, RC, RE, beta, VBE } = inputs;
    const RB_ohms = RB * 1000;
    const RC_ohms = RC * 1000;
    const RE_ohms = RE * 1000;
    const steps = [];

    // Step 1: Calculate base current
    const IB = (VCC - VBE) / RB_ohms;
    steps.push({
      title: 'Determine Base Current',
      explanation: 'In base bias, the base current is determined by applying Kirchhoff\'s Voltage Law around the base-emitter loop. The base resistor RB limits the current flowing from VCC through the base-emitter junction.',
      formula: 'IB = (VCC - VBE) / RB',
      substitution: `IB = (${VCC} - ${VBE}) / ${RB_ohms}`,
      result: `IB = ${formatValue(IB * 1000, 'mA')}`
    });

    // Step 2: Calculate collector current
    const IC = beta * IB;
    steps.push({
      title: 'Calculate Collector Current',
      explanation: 'The collector current is amplified by the transistor\'s current gain β. This fundamental relationship shows how a small base current controls a much larger collector current in the active region.',
      formula: 'IC = β × IB',
      substitution: `IC = ${beta} × ${formatValue(IB * 1000, 'mA')}`,
      result: `IC = ${formatValue(IC * 1000, 'mA')}`
    });

    // Step 3: Calculate emitter current
    const IE = IC + IB;
    steps.push({
      title: 'Find Emitter Current',
      explanation: 'By Kirchhoff\'s Current Law at the emitter node, the emitter current equals the sum of collector and base currents. Since β is typically large, IE ≈ IC in most practical cases.',
      formula: 'IE = IC + IB',
      substitution: `IE = ${formatValue(IC * 1000, 'mA')} + ${formatValue(IB * 1000, 'mA')}`,
      result: `IE = ${formatValue(IE * 1000, 'mA')}`
    });

    // Step 4: Calculate collector-emitter voltage
    const VCE = VCC - IC * (RC_ohms + RE_ohms);
    steps.push({
      title: 'Determine Collector-Emitter Voltage',
      explanation: 'Applying KVL around the collector-emitter loop, VCE equals the supply voltage minus the voltage drops across the collector and emitter resistors. This determines the transistor\'s operating point.',
      formula: 'VCE = VCC - IC × (RC + RE)',
      substitution: `VCE = ${VCC} - ${formatValue(IC * 1000, 'mA')} × (${RC} + ${RE})kΩ`,
      result: `VCE = ${formatValue(VCE, 'V')}`
    });

    // Calculate load line parameters
    const IcSat = VCC / (RC + RE);
    const VceCutoff = VCC;
    const qPoint = { VCE: VCE, IC: IC * 1000 };

    let operatingRegion = 'Active';
    if (VCE < 0.2) {
      operatingRegion = 'Saturation';
      steps.push({
        title: 'Operating Region Analysis',
        explanation: 'The transistor enters saturation when VCE drops below approximately 0.2V. In this region, the collector-base junction becomes forward biased, and the transistor acts like a closed switch.',
        formula: 'VCE < 0.2V indicates saturation',
        substitution: `${formatValue(VCE, 'V')} < 0.2V`,
        result: 'Transistor is in saturation'
      });
    }

    return {
      results: {
        IB: formatValue(IB * 1000, 'mA'),
        IC: formatValue(IC * 1000, 'mA'),
        IE: formatValue(IE * 1000, 'mA'),
        VCE: formatValue(VCE, 'V'),
        region: operatingRegion
      },
      steps,
      svg: this.getSVG('base'),
      loadLine: { IcSat: IcSat * 1000, VceCutoff, qPoint }
    };
  }

  static solveVoltageDivider(inputs) {
    const { VCC, R1, R2, RC, RE, beta, VBE } = inputs;
    const R1_ohms = R1 * 1000;
    const R2_ohms = R2 * 1000;
    const RC_ohms = RC * 1000;
    const RE_ohms = RE * 1000;
    const steps = [];

    // Step 1: Thevenin voltage
    const VTH = (VCC * R2_ohms) / (R1_ohms + R2_ohms);
    steps.push({
      title: 'Calculate Thevenin Equivalent Voltage',
      explanation: 'The voltage divider R1-R2 creates a stable base bias voltage. Using the voltage divider theorem, we find the Thevenin equivalent voltage seen by the base circuit.',
      formula: 'VTH = VCC × R2 / (R1 + R2)',
      substitution: `VTH = ${VCC} × ${R2}kΩ / (${R1}kΩ + ${R2}kΩ)`,
      result: `VTH = ${formatValue(VTH, 'V')}`
    });

    // Step 2: Thevenin resistance
    const RTH = (R1_ohms * R2_ohms) / (R1_ohms + R2_ohms);
    steps.push({
      title: 'Find Thevenin Equivalent Resistance',
      explanation: 'The Thevenin resistance is the parallel combination of R1 and R2 as seen from the base terminal. This resistance affects the base current and overall circuit stability.',
      formula: 'RTH = (R1 × R2) / (R1 + R2)',
      substitution: `RTH = (${R1}kΩ × ${R2}kΩ) / (${R1}kΩ + ${R2}kΩ)`,
      result: `RTH = ${formatValue(RTH / 1000, 'kΩ')}`
    });

    // Step 3: Collector current (exact analysis)
    const IC = (VTH - VBE) / (RE_ohms + RTH / beta);
    steps.push({
      title: 'Calculate Collector Current',
      explanation: 'Using the exact analysis that accounts for base current loading, the collector current depends on the Thevenin equivalent circuit and the emitter degeneration effect.',
      formula: 'IC = (VTH - VBE) / (RE + RTH/β)',
      substitution: `IC = (${formatValue(VTH, 'V')} - ${VBE}V) / (${RE}kΩ + ${formatValue(RTH / 1000, 'kΩ')}/${beta})`,
      result: `IC = ${formatValue(IC * 1000, 'mA')}`
    });

    // Step 4: Base current
    const IB = IC / beta;
    steps.push({
      title: 'Determine Base Current',
      explanation: 'The base current is related to collector current by the transistor\'s current gain β. This relationship holds in the active region of operation.',
      formula: 'IB = IC / β',
      substitution: `IB = ${formatValue(IC * 1000, 'mA')} / ${beta}`,
      result: `IB = ${formatValue(IB * 1000, 'mA')}`
    });

    // Step 5: Emitter current
    const IE = IC + IB;
    steps.push({
      title: 'Calculate Emitter Current',
      explanation: 'By Kirchhoff\'s Current Law at the emitter node, the emitter current is the sum of collector and base currents flowing out of the transistor.',
      formula: 'IE = IC + IB',
      substitution: `IE = ${formatValue(IC * 1000, 'mA')} + ${formatValue(IB * 1000, 'mA')}`,
      result: `IE = ${formatValue(IE * 1000, 'mA')}`
    });

    // Step 6: Collector-emitter voltage
    const VCE = VCC - IC * (RC_ohms + RE_ohms);
    steps.push({
      title: 'Find Collector-Emitter Voltage',
      explanation: 'The collector-emitter voltage determines the operating point on the load line. It equals the supply voltage minus the voltage drops across the collector and emitter resistances.',
      formula: 'VCE = VCC - IC × (RC + RE)',
      substitution: `VCE = ${VCC}V - ${formatValue(IC * 1000, 'mA')} × (${RC}kΩ + ${RE}kΩ)`,
      result: `VCE = ${formatValue(VCE, 'V')}`
    });

    // Calculate load line parameters
    const IcSat = VCC / (RC + RE);
    const VceCutoff = VCC;
    const qPoint = { VCE: VCE, IC: IC * 1000 };

    let operatingRegion = 'Active';
    if (VCE < 0.2) operatingRegion = 'Saturation';

    return {
      results: {
        VTH: formatValue(VTH, 'V'),
        RTH: formatValue(RTH / 1000, 'kΩ'),
        IB: formatValue(IB * 1000, 'mA'),
        IC: formatValue(IC * 1000, 'mA'),
        IE: formatValue(IE * 1000, 'mA'),
        VCE: formatValue(VCE, 'V'),
        region: operatingRegion
      },
      steps,
      svg: this.getSVG('voltage-divider'),
      loadLine: { IcSat: IcSat * 1000, VceCutoff, qPoint }
    };
  }

  static solveCollectorFeedback(inputs) {
    const { VCC, RC, RB, beta, VBE } = inputs;
    const RC_ohms = RC * 1000;
    const RB_ohms = RB * 1000;
    const steps = [];

    // Iterative solution for collector feedback
    const IC = (VCC - VBE) / (RC_ohms + RB_ohms / beta);
    const IB = IC / beta;
    const VCE = VCC - IC * RC_ohms;

    steps.push({
      title: 'Analyze Feedback Loop',
      explanation: 'In collector feedback bias, the base resistor connects to the collector, creating negative feedback. This improves stability by automatically adjusting the base current when collector current changes.',
      formula: 'IC = (VCC - VBE) / (RC + RB/β)',
      substitution: `IC = (${VCC} - ${VBE}) / (${RC}kΩ + ${RB}kΩ/${beta})`,
      result: `IC = ${formatValue(IC * 1000, 'mA')}`
    });

    const IcSat = VCC / RC;
    const VceCutoff = VCC;
    const qPoint = { VCE: VCE, IC: IC * 1000 };

    return {
      results: {
        IB: formatValue(IB * 1000, 'mA'),
        IC: formatValue(IC * 1000, 'mA'),
        VCE: formatValue(VCE, 'V'),
        region: VCE < 0.2 ? 'Saturation' : 'Active'
      },
      steps,
      svg: this.getSVG('collector-feedback'),
      loadLine: { IcSat: IcSat * 1000, VceCutoff, qPoint }
    };
  }

  static solveEmitterBias(inputs) {
    const { VCC, RC, RE, beta, VBE } = inputs;
    const RC_ohms = RC * 1000;
    const RE_ohms = RE * 1000;
    const steps = [];

    // For emitter bias, base is connected to ground through large resistor
    const IE = (VCC - VBE) / RE_ohms;
    const IC = IE * beta / (beta + 1);
    const IB = IE / (beta + 1);
    const VCE = VCC - IC * RC_ohms - IE * RE_ohms;

    steps.push({
      title: 'Calculate Emitter Current',
      explanation: 'In emitter bias, the emitter current is primarily determined by the supply voltage and emitter resistance, making it relatively independent of transistor parameters.',
      formula: 'IE ≈ (VCC - VBE) / RE',
      substitution: `IE = (${VCC} - ${VBE}) / ${RE}kΩ`,
      result: `IE = ${formatValue(IE * 1000, 'mA')}`
    });

    const IcSat = VCC / (RC + RE);
    const VceCutoff = VCC;
    const qPoint = { VCE: VCE, IC: IC * 1000 };

    return {
      results: {
        IB: formatValue(IB * 1000, 'mA'),
        IC: formatValue(IC * 1000, 'mA'),
        IE: formatValue(IE * 1000, 'mA'),
        VCE: formatValue(VCE, 'V'),
        region: VCE < 0.2 ? 'Saturation' : 'Active'
      },
      steps,
      svg: this.getSVG('emitter-bias'),
      loadLine: { IcSat: IcSat * 1000, VceCutoff, qPoint }
    };
  }

  static solveDualSupply(inputs) {
    const { VCC, VEE, RC, RE, beta, VBE } = inputs;
    const RC_ohms = RC * 1000;
    const RE_ohms = RE * 1000;
    const steps = [];

    // For dual supply, emitter current is well-defined
    const IE = (0 - VBE - VEE) / RE_ohms;
    const IC = IE * beta / (beta + 1);
    const IB = IE / (beta + 1);
    const VCE = VCC - IC * RC_ohms + IE * RE_ohms;

    steps.push({
      title: 'Analyze Dual Supply Operation',
      explanation: 'With dual supplies, the emitter is referenced to the negative supply VEE, providing excellent bias stability and allowing for symmetric operation about ground.',
      formula: 'IE = (0 - VBE - VEE) / RE',
      substitution: `IE = (0 - ${VBE} - (${VEE})) / ${RE}kΩ`,
      result: `IE = ${formatValue(IE * 1000, 'mA')}`
    });

    const IcSat = (VCC - VEE) / (RC + RE);
    const VceCutoff = VCC - VEE;
    const qPoint = { VCE: VCE, IC: IC * 1000 };

    return {
      results: {
        IB: formatValue(IB * 1000, 'mA'),
        IC: formatValue(IC * 1000, 'mA'),
        IE: formatValue(IE * 1000, 'mA'),
        VCE: formatValue(VCE, 'V'),
        region: VCE < 0.2 ? 'Saturation' : 'Active'
      },
      steps,
      svg: this.getSVG('dual-supply'),
      loadLine: { IcSat: IcSat * 1000, VceCutoff, qPoint }
    };
  }
}

// ===== ENHANCED OP-AMP SOLVER CLASS =====
class OpAmpSolver {
  static configurations = {
    'inverting': 'Inverting Amplifier',
    'non-inverting': 'Non-Inverting Amplifier',
    'summing': 'Summing Amplifier',
    'integrator': 'Integrator',
    'instrumentation': 'Instrumentation Amplifier'
  };

  static getInputSchema(config) {
    const schemas = {
      'inverting': [
        { name: 'Vin', label: 'Input Voltage (Vin)', unit: 'V', default: 1.0 },
        { name: 'R1', label: 'Input Resistor (R1)', unit: 'kΩ', default: 10 },
        { name: 'R2', label: 'Feedback Resistor (R2)', unit: 'kΩ', default: 100 },
        { name: 'Vsat_pos', label: 'Positive Saturation (+Vsat)', unit: 'V', default: 12 },
        { name: 'Vsat_neg', label: 'Negative Saturation (-Vsat)', unit: 'V', default: -12 }
      ],
      'non-inverting': [
        { name: 'Vin', label: 'Input Voltage (Vin)', unit: 'V', default: 1.0 },
        { name: 'R1', label: 'Feedback Resistor (R1)', unit: 'kΩ', default: 10 },
        { name: 'R2', label: 'Ground Resistor (R2)', unit: 'kΩ', default: 100 },
        { name: 'Vsat_pos', label: 'Positive Saturation (+Vsat)', unit: 'V', default: 12 },
        { name: 'Vsat_neg', label: 'Negative Saturation (-Vsat)', unit: 'V', default: -12 }
      ],
      'summing': [
        { name: 'Vin1', label: 'Input 1 (Vin1)', unit: 'V', default: 1.0 },
        { name: 'Vin2', label: 'Input 2 (Vin2)', unit: 'V', default: 2.0 },
        { name: 'R1', label: 'Input 1 Resistor (R1)', unit: 'kΩ', default: 10 },
        { name: 'R2', label: 'Input 2 Resistor (R2)', unit: 'kΩ', default: 20 },
        { name: 'Rf', label: 'Feedback Resistor (Rf)', unit: 'kΩ', default: 100 }
      ],
      'integrator': [
        { name: 'Vin', label: 'Input Voltage (Vin)', unit: 'V', default: 1.0 },
        { name: 'R', label: 'Input Resistor (R)', unit: 'kΩ', default: 10 },
        { name: 'C', label: 'Feedback Capacitor (C)', unit: 'µF', default: 1.0 },
        { name: 'time', label: 'Time Duration (t)', unit: 'ms', default: 10 }
      ],
      'instrumentation': [
        { name: 'Vin1', label: 'Input 1 (Vin1)', unit: 'V', default: 1.0 },
        { name: 'Vin2', label: 'Input 2 (Vin2)', unit: 'V', default: 1.1 },
        { name: 'R1', label: 'Input Stage Resistor (R1)', unit: 'kΩ', default: 10 },
        { name: 'Rg', label: 'Gain Resistor (Rg)', unit: 'kΩ', default: 1.0 },
        { name: 'R2', label: 'Diff Stage Resistor (R2)', unit: 'kΩ', default: 10 },
        { name: 'R3', label: 'Diff Stage Resistor (R3)', unit: 'kΩ', default: 10 }
      ]
    };
    return schemas[config] || [];
  }

  static getSVG(config) {
    const themeBlue = '#2196F3';
    const themeRed = '#ff4444';
    const themeWire = '#333';
    const themeResistor = '#FFC107';
    const opampTriangle = `<polygon points="150,60 150,120 220,90" fill="white" stroke="${themeWire}" stroke-width="3"/>`;
    const plusMinus = `
      <text x="145" y="80" text-anchor="middle" font-size="16" fill="${themeWire}">+</text>
      <text x="145" y="110" text-anchor="middle" font-size="16" fill="${themeWire}">-</text>
    `;
    const resistorSymbol = (x, y, label) => `
      <g>
        <rect x="${x - 15}" y="${y - 5}" width="30" height="10" fill="${themeResistor}" stroke="${themeWire}" stroke-width="2" rx="3"/>
        <text x="${x}" y="${y - 8}" text-anchor="middle" font-size="12" fill="${themeWire}">${label}</text>
      </g>
    `;
    // --- Op-Amp Inverting Amplifier (restore previous version) ---
    const inverting = `<svg width="340" height="180" viewBox="0 0 340 180">
      <!-- Op-amp triangle -->
      <polygon points="180,80 180,140 260,110" fill="white" stroke="#333" stroke-width="3"/>
      <!-- + and - -->
      <text x="175" y="100" text-anchor="middle" font-size="16" fill="#333">-</text>
      <text x="175" y="130" text-anchor="middle" font-size="16" fill="#333">+</text>
      <!-- Input Vin to R1 -->
      <line x1="60" y1="100" x2="110" y2="100" stroke="#2196F3" stroke-width="2"/>
      <text x="60" y="90" text-anchor="middle" font-size="12" fill="#2196F3">Vin</text>
      <rect x="110" y="90" width="30" height="20" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="125" y="85" text-anchor="middle" font-size="12" fill="#333">R1</text>
      <!-- R1 to op-amp - input -->
      <line x1="140" y1="100" x2="180" y2="100" stroke="#333" stroke-width="2"/>
      <!-- Feedback R2 from output to - input -->
      <rect x="220" y="80" width="30" height="20" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="235" y="75" text-anchor="middle" font-size="12" fill="#333">R2</text>
      <line x1="250" y1="110" x2="250" y2="90" stroke="#333" stroke-width="2"/>
      <line x1="250" y1="90" x2="180" y2="100" stroke="#333" stroke-width="2"/>
      <!-- + input to ground -->
      <line x1="180" y1="130" x2="180" y2="160" stroke="#444" stroke-width="2"/>
      <line x1="170" y1="160" x2="190" y2="160" stroke="#444" stroke-width="2"/>
      <text x="180" y="175" text-anchor="middle" font-size="12" fill="#444">GND</text>
      <!-- Output -->
      <line x1="260" y1="110" x2="300" y2="110" stroke="#ff4444" stroke-width="3"/>
      <circle cx="300" cy="110" r="5" fill="#ff4444"/>
      <text x="310" y="110" text-anchor="start" font-size="12" fill="#ff4444">Vout</text>
    </svg>`;
    // --- Op-Amp Non-Inverting Amplifier (standard ground symbol) ---
    const nonInverting = `<svg width="340" height="180" viewBox="0 0 340 180">
      <!-- Op-amp triangle -->
      <polygon points="180,80 180,140 260,110" fill="white" stroke="#333" stroke-width="3"/>
      <!-- + and - -->
      <text x="175" y="100" text-anchor="middle" font-size="16" fill="#333">-</text>
      <text x="175" y="130" text-anchor="middle" font-size="16" fill="#333">+</text>
      <!-- Vin to + input (horizontal, below triangle) -->
      <line x1="60" y1="130" x2="180" y2="130" stroke="#2196F3" stroke-width="2"/>
      <text x="60" y="140" text-anchor="middle" font-size="12" fill="#2196F3">Vin</text>
      <!-- - input to R1 to ground (vertical, left of triangle) -->
      <line x1="180" y1="100" x2="140" y2="100" stroke="#333" stroke-width="2"/>
      <rect x="110" y="90" width="30" height="20" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="125" y="85" text-anchor="middle" font-size="12" fill="#333">R1</text>
      <line x1="140" y1="100" x2="140" y2="160" stroke="#333" stroke-width="2"/>
      <rect x="125" y="160" width="30" height="20" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="140" y="195" text-anchor="middle" font-size="12" fill="#333">R2</text>
      <line x1="140" y1="180" x2="140" y2="210" stroke="#333" stroke-width="2"/>
      <!-- Standard ground symbol -->
      <line x1="140" y1="210" x2="140" y2="214" stroke="#444" stroke-width="2"/>
      <line x1="134" y1="214" x2="146" y2="214" stroke="#444" stroke-width="2"/>
      <line x1="136" y1="216" x2="144" y2="216" stroke="#444" stroke-width="1.5"/>
      <line x1="138" y1="218" x2="142" y2="218" stroke="#444" stroke-width="1"/>
      <text x="140" y="225" text-anchor="middle" font-size="12" fill="#444">GND</text>
      <!-- Feedback from output to - input (above triangle, no overlap) -->
      <line x1="260" y1="110" x2="260" y2="70" stroke="#333" stroke-width="2"/>
      <rect x="210" y="60" width="30" height="20" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="225" y="55" text-anchor="middle" font-size="12" fill="#333">R2</text>
      <line x1="260" y1="70" x2="240" y2="70" stroke="#333" stroke-width="2"/>
      <line x1="210" y1="70" x2="180" y2="100" stroke="#333" stroke-width="2"/>
      <!-- Output -->
      <line x1="260" y1="110" x2="300" y2="110" stroke="#ff4444" stroke-width="3"/>
      <circle cx="300" cy="110" r="5" fill="#ff4444"/>
      <text x="310" y="110" text-anchor="start" font-size="12" fill="#ff4444">Vout</text>
    </svg>`;
    // --- Op-Amp Summing Amplifier (standard layout) ---
    const summing = `<svg width="340" height="200" viewBox="0 0 340 200">
      <!-- Op-amp triangle -->
      <polygon points="180,80 180,140 260,110" fill="white" stroke="#333" stroke-width="3"/>
      <!-- + and - -->
      <text x="175" y="100" text-anchor="middle" font-size="16" fill="#333">-</text>
      <text x="175" y="130" text-anchor="middle" font-size="16" fill="#333">+</text>
      <!-- Vin1 to R1 (top input) -->
      <line x1="60" y1="90" x2="110" y2="90" stroke="#2196F3" stroke-width="2"/>
      <text x="60" y="80" text-anchor="middle" font-size="12" fill="#2196F3">Vin1</text>
      <rect x="110" y="80" width="30" height="20" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="125" y="75" text-anchor="middle" font-size="12" fill="#333">R1</text>
      <line x1="140" y1="90" x2="180" y2="100" stroke="#333" stroke-width="2"/>
      <!-- Vin2 to R2 (bottom input) -->
      <line x1="60" y1="130" x2="110" y2="130" stroke="#2196F3" stroke-width="2"/>
      <text x="60" y="140" text-anchor="middle" font-size="12" fill="#2196F3">Vin2</text>
      <rect x="110" y="120" width="30" height="20" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="125" y="115" text-anchor="middle" font-size="12" fill="#333">R2</text>
      <line x1="140" y1="130" x2="180" y2="100" stroke="#333" stroke-width="2"/>
      <!-- + input to ground -->
      <line x1="180" y1="130" x2="180" y2="170" stroke="#444" stroke-width="2"/>
      <line x1="170" y1="170" x2="190" y2="170" stroke="#444" stroke-width="2"/>
      <text x="180" y="185" text-anchor="middle" font-size="12" fill="#444">GND</text>
      <!-- Output -->
      <line x1="260" y1="110" x2="300" y2="110" stroke="#ff4444" stroke-width="3"/>
      <circle cx="300" cy="110" r="5" fill="#ff4444"/>
      <text x="310" y="110" text-anchor="start" font-size="12" fill="#ff4444">Vout</text>
      <!-- Feedback Rf from output to - input (above triangle) -->
      <line x1="260" y1="110" x2="260" y2="70" stroke="#333" stroke-width="2"/>
      <rect x="210" y="60" width="30" height="20" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="225" y="55" text-anchor="middle" font-size="12" fill="#333">Rf</text>
      <line x1="260" y1="70" x2="240" y2="70" stroke="#333" stroke-width="2"/>
      <line x1="210" y1="70" x2="180" y2="100" stroke="#333" stroke-width="2"/>
    </svg>`;
    // --- Op-Amp Integrator (standard layout) ---
    const integrator = `<svg width="340" height="180" viewBox="0 0 340 180">
      <!-- Op-amp triangle -->
      <polygon points="180,80 180,140 260,110" fill="white" stroke="#333" stroke-width="3"/>
      <!-- + and - -->
      <text x="175" y="100" text-anchor="middle" font-size="16" fill="#333">-</text>
      <text x="175" y="130" text-anchor="middle" font-size="16" fill="#333">+</text>
      <!-- Vin to R (horizontal, below triangle) -->
      <line x1="60" y1="130" x2="110" y2="130" stroke="#2196F3" stroke-width="2"/>
      <text x="60" y="140" text-anchor="middle" font-size="12" fill="#2196F3">Vin</text>
      <rect x="110" y="120" width="30" height="20" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="125" y="115" text-anchor="middle" font-size="12" fill="#333">R</text>
      <line x1="140" y1="130" x2="140" y2="100" stroke="#333" stroke-width="2"/>
      <line x1="140" y1="100" x2="180" y2="100" stroke="#333" stroke-width="2"/>
      <!-- + input to ground -->
      <line x1="180" y1="130" x2="180" y2="160" stroke="#444" stroke-width="2"/>
      <line x1="170" y1="160" x2="190" y2="160" stroke="#444" stroke-width="2"/>
      <text x="180" y="175" text-anchor="middle" font-size="12" fill="#444">GND</text>
      <!-- Output -->
      <line x1="260" y1="110" x2="300" y2="110" stroke="#ff4444" stroke-width="3"/>
      <circle cx="300" cy="110" r="5" fill="#ff4444"/>
      <text x="310" y="110" text-anchor="start" font-size="12" fill="#ff4444">Vout</text>
      <!-- Feedback C from output to - input (above triangle) -->
      <line x1="260" y1="110" x2="260" y2="70" stroke="#333" stroke-width="2"/>
      <rect x="210" y="60" width="30" height="20" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="225" y="55" text-anchor="middle" font-size="12" fill="#333">C</text>
      <line x1="260" y1="70" x2="240" y2="70" stroke="#333" stroke-width="2"/>
      <line x1="210" y1="70" x2="180" y2="100" stroke="#333" stroke-width="2"/>
    </svg>`;
    // --- Op-Amp Instrumentation Amplifier (standard layout, simplified) ---
    const instrumentation = `<svg width="340" height="200" viewBox="0 0 340 200">
      <!-- First op-amp triangle -->
      <polygon points="100,80 100,140 180,110" fill="white" stroke="#333" stroke-width="3"/>
      <text x="95" y="100" text-anchor="middle" font-size="16" fill="#333">-</text>
      <text x="95" y="130" text-anchor="middle" font-size="16" fill="#333">+</text>
      <!-- Second op-amp triangle -->
      <polygon points="220,80 220,140 300,110" fill="white" stroke="#333" stroke-width="3"/>
      <text x="215" y="100" text-anchor="middle" font-size="16" fill="#333">-</text>
      <text x="215" y="130" text-anchor="middle" font-size="16" fill="#333">+</text>
      <!-- Vin1 to first + input -->
      <line x1="40" y1="130" x2="100" y2="130" stroke="#2196F3" stroke-width="2"/>
      <text x="40" y="140" text-anchor="middle" font-size="12" fill="#2196F3">Vin1</text>
      <!-- Vin2 to second + input -->
      <line x1="40" y1="90" x2="220" y2="90" stroke="#2196F3" stroke-width="2"/>
      <text x="40" y="80" text-anchor="middle" font-size="12" fill="#2196F3">Vin2</text>
      <!-- Rg between first and second op-amp - inputs -->
      <rect x="160" y="100" width="20" height="20" fill="#FFC107" stroke="#333" stroke-width="2" rx="3"/>
      <text x="170" y="95" text-anchor="middle" font-size="12" fill="#333">Rg</text>
      <line x1="180" y1="110" x2="220" y2="110" stroke="#333" stroke-width="2"/>
      <!-- Output from second op-amp -->
      <line x1="300" y1="110" x2="330" y2="110" stroke="#ff4444" stroke-width="3"/>
      <circle cx="330" cy="110" r="5" fill="#ff4444"/>
      <text x="340" y="110" text-anchor="start" font-size="12" fill="#ff4444">Vout</text>
    </svg>`;
    const schematics = {
      'inverting': inverting,
      'non-inverting': nonInverting,
      'summing': summing,
      'integrator': integrator,
      'instrumentation': instrumentation,
    };
    return schematics[config] || '<svg width="300" height="150"><text x="150" y="75" text-anchor="middle">Schematic available</text></svg>';
  }

  static solve(config, inputs) {
    switch (config) {
      case 'inverting':
        return this.solveInverting(inputs);
      case 'non-inverting':
        return this.solveNonInverting(inputs);
      case 'summing':
        return this.solveSumming(inputs);
      case 'integrator':
        return this.solveIntegrator(inputs);
      case 'instrumentation':
        return this.solveInstrumentation(inputs);
      default:
        throw new Error(`Unsupported configuration: ${config}`);
    }
  }

  static solveInverting(inputs) {
    const { Vin, R1, R2, Vsat_pos, Vsat_neg } = inputs;
    const steps = [];
    
    const gain = -R2 / R1;
    steps.push({
      title: 'Calculate Voltage Gain',
      explanation: 'In an inverting amplifier, the gain is negative due to the input being applied to the inverting terminal. The virtual short concept makes the inverting input appear at ground potential.',
      formula: 'Av = -R2 / R1',
      substitution: `Av = -${R2}kΩ / ${R1}kΩ`,
      result: `Av = ${formatValue(gain)}`
    });

    const VoutIdeal = gain * Vin;
    steps.push({
      title: 'Calculate Ideal Output',
      explanation: 'The ideal output voltage is simply the input voltage multiplied by the gain. This assumes the op-amp has infinite gain and operates in the linear region.',
      formula: 'Vout = Av × Vin',
      substitution: `Vout = ${formatValue(gain)} × ${Vin}V`,
      result: `Vout = ${formatValue(VoutIdeal, 'V')}`
    });

    let VoutActual = VoutIdeal;
    let saturated = false;
    if (VoutIdeal > Vsat_pos) {
      VoutActual = Vsat_pos;
      saturated = true;
      steps.push({
        title: 'Check for Saturation',
        explanation: 'The op-amp cannot output voltages beyond its supply rails. When the ideal output exceeds the positive saturation voltage, the actual output is clipped.',
        formula: 'Vout limited by +Vsat',
        substitution: `${formatValue(VoutIdeal, 'V')} > ${Vsat_pos}V`,
        result: `Vout = ${formatValue(Vsat_pos, 'V')} (saturated)`
      });
    } else if (VoutIdeal < Vsat_neg) {
      VoutActual = Vsat_neg;
      saturated = true;
      steps.push({
        title: 'Check for Saturation',
        explanation: 'Similarly, when the ideal output is below the negative saturation voltage, the output is clipped to the negative supply rail.',
        formula: 'Vout limited by -Vsat',
        substitution: `${formatValue(VoutIdeal, 'V')} < ${Vsat_neg}V`,
        result: `Vout = ${formatValue(Vsat_neg, 'V')} (saturated)`
      });
    }

    return {
      results: {
        gain: formatValue(gain),
        Vout: formatValue(VoutActual, 'V'),
        Zin: formatValue(R1, 'kΩ'),
        status: saturated ? 'Saturated' : 'Linear'
      },
      steps,
      svg: this.getSVG('inverting')
    };
  }

  static solveNonInverting(inputs) {
    const { Vin, R1, R2, Vsat_pos, Vsat_neg } = inputs;
    const steps = [];
    
    const gain = 1 + R2 / R1;
    steps.push({
      title: 'Calculate Voltage Gain',
      explanation: 'In a non-inverting amplifier, the gain is always positive and greater than 1. The feedback network creates a voltage divider that determines the gain.',
      formula: 'Av = 1 + R2 / R1',
      substitution: `Av = 1 + ${R2}kΩ / ${R1}kΩ`,
      result: `Av = ${formatValue(gain)}`
    });

    const VoutIdeal = gain * Vin;
    steps.push({
      title: 'Calculate Ideal Output',
      explanation: 'The output voltage is the input voltage amplified by the gain factor. The non-inverting configuration preserves the input signal polarity.',
      formula: 'Vout = Av × Vin',
      substitution: `Vout = ${formatValue(gain)} × ${Vin}V`,
      result: `Vout = ${formatValue(VoutIdeal, 'V')}`
    });

    let VoutActual = VoutIdeal;
    let saturated = false;
    if (VoutIdeal > Vsat_pos) {
      VoutActual = Vsat_pos;
      saturated = true;
    } else if (VoutIdeal < Vsat_neg) {
      VoutActual = Vsat_neg;
      saturated = true;
    }

    return {
      results: {
        gain: formatValue(gain),
        Vout: formatValue(VoutActual, 'V'),
        Zin: '∞',
        status: saturated ? 'Saturated' : 'Linear'
      },
      steps,
      svg: this.getSVG('non-inverting')
    };
  }

  static solveSumming(inputs) {
    const { Vin1, Vin2, R1, R2, Rf } = inputs;
    const steps = [];
    
    const Vout = -(Rf * (Vin1 / R1 + Vin2 / R2));
    steps.push({
      title: 'Calculate Summing Output',
      explanation: 'The summing amplifier adds input voltages with individual gain factors. Each input contributes to the output proportional to the ratio of feedback to input resistance.',
      formula: 'Vout = -Rf × (Vin1/R1 + Vin2/R2)',
      substitution: `Vout = -${Rf}kΩ × (${Vin1}V/${R1}kΩ + ${Vin2}V/${R2}kΩ)`,
      result: `Vout = ${formatValue(Vout, 'V')}`
    });

    return {
      results: {
        Vout: formatValue(Vout, 'V'),
        gain1: formatValue(-Rf / R1),
        gain2: formatValue(-Rf / R2),
        status: 'Linear'
      },
      steps,
      svg: this.getSVG('summing')
    };
  }

  static solveIntegrator(inputs) {
    const { Vin, R, C, time } = inputs;
    const steps = [];
    
    const Vout = -(Vin * time * 0.001) / (R * 1000 * C * 0.000001);
    steps.push({
      title: 'Calculate Integration Output',
      explanation: 'The integrator produces an output proportional to the integral of the input voltage over time. The rate of change depends on the RC time constant.',
      formula: 'Vout = -∫(Vin/RC)dt',
      substitution: `Vout = -(${Vin}V × ${time}ms) / (${R}kΩ × ${C}µF)`,
      result: `Vout = ${formatValue(Vout, 'V')}`
    });

    return {
      results: {
        Vout: formatValue(Vout, 'V'),
        timeConstant: formatValue(R * C, 'ms'),
        status: 'Integrating'
      },
      steps,
      svg: this.getSVG('integrator')
    };
  }

  static solveInstrumentation(inputs) {
    const { Vin1, Vin2, R1, Rg, R2, R3 } = inputs;
    const steps = [];
    
    const gain = (1 + 2 * R1 / Rg) * (R3 / R2);
    const Vout = gain * (Vin1 - Vin2);
    
    steps.push({
      title: 'Calculate Instrumentation Gain',
      explanation: 'The instrumentation amplifier provides high input impedance and excellent common-mode rejection. The gain is set by the ratio of resistors in two stages.',
      formula: 'Av = (1 + 2R1/Rg) × (R3/R2)',
      substitution: `Av = (1 + 2×${R1}kΩ/${Rg}kΩ) × (${R3}kΩ/${R2}kΩ)`,
      result: `Av = ${formatValue(gain)}`
    });

    return {
      results: {
        gain: formatValue(gain),
        Vout: formatValue(Vout, 'V'),
        Vdiff: formatValue(Vin1 - Vin2, 'V'),
        status: 'Linear'
      },
      steps,
      svg: this.getSVG('instrumentation')
    };
  }
}

// ===== APPLICATION CONTROLLER =====
class ElectroSolveApp {
  constructor() {
    this.currentPanel = 'BJT Bias';
    this.themeManager = new ThemeManager();
    this.init();
  }

  init() {
    this.createNavigation();
    this.createPanels();
    this.showPanel('BJT Bias');
  }

  createNavigation() {
    const tabBar = document.getElementById('tabBar');
    tabBar.className = 'nav-tabs';
    
    const tabs = [
      { id: 'bjt-bias', name: 'BJT Bias' },
      { id: 'op-amp', name: 'Op-Amp' },
      { id: 'digital-logic', name: 'Digital Logic' }
    ];
    
    tabs.forEach(tab => {
      const tabElement = document.createElement('button');
      tabElement.className = 'nav-tab';
      tabElement.textContent = tab.name;
      tabElement.addEventListener('click', (e) => {
        e.preventDefault();
        this.showPanel(tab.name);
      });
      tabBar.appendChild(tabElement);
    });
  }

  createPanels() {
    const appRoot = document.getElementById('appRoot');
    
    // BJT Bias Panel
    const bjtPanel = this.buildBJTPanel();
    appRoot.appendChild(bjtPanel);
    
    // Op-Amp Panel
    const opampPanel = this.buildOpAmpPanel();
    appRoot.appendChild(opampPanel);
    
    // Digital Logic Panel
    const digitalPanel = this.buildDigitalLogicPanel();
    appRoot.appendChild(digitalPanel);
  }

  buildBJTPanel() {
    const panel = document.createElement('section');
    panel.className = 'panel hidden';
    panel.id = 'panel-bjt-bias';
    
    const typeOptions = Object.entries(BJTSolver.biasTypes)
      .map(([val, label]) => `<option value="${val}">${label}</option>`)
      .join('');
    
    panel.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">BJT Bias Circuit Analysis</h2>
        <p class="panel-subtitle">Step-by-step solutions with dynamic Q-point visualization</p>
      </div>
      <div class="solver-form">
        <div class="form-section">
          <h3>Configuration</h3>
          <div class="form-group">
            <label class="form-label">Circuit Type</label>
            <select class="form-control" id="bjt-type">${typeOptions}</select>
          </div>
          <div id="bjt-inputs"></div>
        </div>
        <div class="form-section">
          <h3>Real-time Q-Point Graph</h3>
          <p>Dynamic visualization updates as you change values</p>
          <div class="load-line-chart">
            <h4>DC Load Line & Q-Point (Live)</h4>
            <canvas id="live-loadline-canvas" class="load-line-canvas" width="500" height="400"></canvas>
          </div>
          <div class="solver-actions">
            <button type="button" class="btn btn--secondary" id="bjt-example">Load Example</button>
            <button type="button" class="btn btn--outline" id="bjt-reset">Reset Form</button>
            <button type="button" class="btn btn--primary" id="bjt-solve">Solve Circuit</button>
          </div>
        </div>
      </div>
      <div class="results-container" id="bjt-results"></div>
    `;
    
    return panel;
  }

  buildOpAmpPanel() {
    const panel = document.createElement('section');
    panel.className = 'panel hidden';
    panel.id = 'panel-op-amp';
    
    const typeOptions = Object.entries(OpAmpSolver.configurations)
      .map(([val, label]) => `<option value="${val}">${label}</option>`)
      .join('');
    
    panel.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">Op-Amp Circuit Analysis</h2>
        <p class="panel-subtitle">Step-by-step solutions with circuit theory explanations</p>
      </div>
      <div class="solver-form">
        <div class="form-section">
          <h3>Configuration</h3>
          <div class="form-group">
            <label class="form-label">Circuit Type</label>
            <select class="form-control" id="opamp-type">${typeOptions}</select>
          </div>
          <div id="opamp-inputs"></div>
        </div>
        <div class="form-section">
          <h3>Quick Actions</h3>
          <p>Load example values or reset form</p>
          <div class="solver-actions">
            <button type="button" class="btn btn--secondary" id="opamp-example">Load Example</button>
            <button type="button" class="btn btn--outline" id="opamp-reset">Reset Form</button>
            <button type="button" class="btn btn--primary" id="opamp-solve">Solve Circuit</button>
          </div>
        </div>
      </div>
      <div class="results-container" id="opamp-results"></div>
    `;
    
    return panel;
  }

  buildDigitalLogicPanel() {
    const panel = document.createElement('section');
    panel.className = 'panel hidden';
    panel.id = 'panel-digital-logic';

    panel.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">Digital Logic Circuit Analysis</h2>
        <p class="panel-subtitle">Boolean algebra, truth tables, and more</p>
      </div>
      <div class="logic-tabs">
        <button class="logic-tab active" id="tab-boolean">Boolean Simplification</button>
        <button class="logic-tab" id="tab-truth">Truth Table</button>
        <button class="logic-tab" id="tab-kmap">Karnaugh Map</button>
        <button class="logic-tab" id="tab-kmap-minterms">K-Map Solver (Minterms)</button>
      </div>
      <div class="logic-content" id="logic-boolean" style="display:block;">
        <h3>Boolean Expression Simplification</h3>
        <form id="boolean-form">
          <label for="boolean-input">Enter Boolean Expression:</label>
          <input type="text" id="boolean-input" class="form-control" placeholder="e.g. A + A'B" required />
          <button type="submit" class="btn btn--primary">Simplify</button>
        </form>
        <div class="logic-result" id="boolean-result"></div>
      </div>
      <div class="logic-content" id="logic-truth" style="display:none;">
        <h3>Truth Table Generator</h3>
        <form id="truth-form">
          <label for="truth-input">Enter Boolean Expression:</label>
          <input type="text" id="truth-input" class="form-control" placeholder="e.g. AB + C'" required />
          <button type="submit" class="btn btn--primary">Generate Table</button>
        </form>
        <div class="logic-result" id="truth-result"></div>
      </div>
      <div class="logic-content" id="logic-kmap" style="display:none;">
        <h3>Karnaugh Map Solver</h3>
        <form id="kmap-form">
          <label for="kmap-input">Enter Boolean Expression:</label>
          <input type="text" id="kmap-input" class="form-control" placeholder="e.g. A'B + AC" required />
          <button type="submit" class="btn btn--primary">Show K-Map</button>
        </form>
        <div class="logic-result" id="kmap-result"></div>
      </div>
      <div class="logic-content" id="logic-kmap-minterms" style="display:none;">
        <h3>K-Map Solver (Minterms & Don't Cares)</h3>
        <form id="kmap-minterms-form">
          <label for="kmap-minterms-input">Enter Minterms (comma-separated):</label>
          <input type="text" id="kmap-minterms-input" class="form-control" placeholder="e.g. 1,3,5" required />
          <label for="kmap-dc-input">Enter Don't Cares (comma-separated, optional):</label>
          <input type="text" id="kmap-dc-input" class="form-control" placeholder="e.g. 2,7" />
          <label for="kmap-vars-input">Number of Variables (2-4):</label>
          <input type="number" id="kmap-vars-input" class="form-control" min="2" max="4" value="3" required />
          <button type="submit" class="btn btn--primary">Solve K-Map</button>
        </form>
        <div class="logic-result" id="kmap-minterms-result"></div>
      </div>
    `;

    // Tab switching logic
    setTimeout(() => {
      const tabBoolean = panel.querySelector('#tab-boolean');
      const tabTruth = panel.querySelector('#tab-truth');
      const tabKmap = panel.querySelector('#tab-kmap');
      const tabKmapMinterms = panel.querySelector('#tab-kmap-minterms');
      const contentBoolean = panel.querySelector('#logic-boolean');
      const contentTruth = panel.querySelector('#logic-truth');
      const contentKmap = panel.querySelector('#logic-kmap');
      const contentKmapMinterms = panel.querySelector('#logic-kmap-minterms');
      tabBoolean.addEventListener('click', () => {
        tabBoolean.classList.add('active');
        tabTruth.classList.remove('active');
        tabKmap.classList.remove('active');
        tabKmapMinterms.classList.remove('active');
        contentBoolean.style.display = 'block';
        contentTruth.style.display = 'none';
        contentKmap.style.display = 'none';
        contentKmapMinterms.style.display = 'none';
      });
      tabTruth.addEventListener('click', () => {
        tabTruth.classList.add('active');
        tabBoolean.classList.remove('active');
        tabKmap.classList.remove('active');
        tabKmapMinterms.classList.remove('active');
        contentBoolean.style.display = 'none';
        contentTruth.style.display = 'block';
        contentKmap.style.display = 'none';
        contentKmapMinterms.style.display = 'none';
      });
      tabKmap.addEventListener('click', () => {
        tabKmap.classList.add('active');
        tabBoolean.classList.remove('active');
        tabTruth.classList.remove('active');
        tabKmapMinterms.classList.remove('active');
        contentBoolean.style.display = 'none';
        contentTruth.style.display = 'none';
        contentKmap.style.display = 'block';
        contentKmapMinterms.style.display = 'none';
      });
      tabKmapMinterms.addEventListener('click', () => {
        tabKmapMinterms.classList.add('active');
        tabBoolean.classList.remove('active');
        tabTruth.classList.remove('active');
        tabKmap.classList.remove('active');
        contentBoolean.style.display = 'none';
        contentTruth.style.display = 'none';
        contentKmap.style.display = 'none';
        contentKmapMinterms.style.display = 'block';
      });

      // Boolean Simplification Logic
      const booleanForm = panel.querySelector('#boolean-form');
      const booleanInput = panel.querySelector('#boolean-input');
      const booleanResult = panel.querySelector('#boolean-result');
      booleanForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const expr = booleanInput.value.trim();
        if (!expr) {
          booleanResult.innerHTML = '<div class="error-message">Please enter a Boolean expression.</div>';
          return;
        }
        try {
          const simplified = simplifyExpr(expr);
          booleanResult.innerHTML = `<div class="success-message">Simplified: <b>${simplified}</b></div>`;
        } catch (err) {
          booleanResult.innerHTML = `<div class="error-message">Error: ${err.message}</div>`;
        }
      });

      // Truth Table Generation Logic
      const truthForm = panel.querySelector('#truth-form');
      const truthInput = panel.querySelector('#truth-input');
      const truthResult = panel.querySelector('#truth-result');
      truthForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const expr = truthInput.value.trim();
        if (!expr) {
          truthResult.innerHTML = '<div class="error-message">Please enter a Boolean expression.</div>';
          return;
        }
        try {
          const { vars, table } = getTruthTable(expr);
          if (vars.length === 0) {
            truthResult.innerHTML = '<div class="error-message">No variables found in expression.</div>';
            return;
          }
          let html = `<table class="truth-table"><thead><tr>${vars.map(v => `<th>${v}</th>`).join('')}<th>Output</th></tr></thead><tbody>`;
          for (const row of table) {
            html += `<tr>${vars.map(v => `<td>${row[v]}</td>`).join('')}<td>${row.out}</td></tr>`;
          }
          html += '</tbody></table>';
          truthResult.innerHTML = html;
        } catch (err) {
          truthResult.innerHTML = `<div class="error-message">Error: ${err.message}</div>`;
        }
      });

      // Karnaugh Map Logic
      const kmapForm = panel.querySelector('#kmap-form');
      const kmapInput = panel.querySelector('#kmap-input');
      const kmapResult = panel.querySelector('#kmap-result');
      kmapForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const expr = kmapInput.value.trim();
        if (!expr) {
          kmapResult.innerHTML = '<div class="error-message">Please enter a Boolean expression.</div>';
          return;
        }
        try {
          const { vars, table } = getTruthTable(expr);
          if (vars.length < 2 || vars.length > 4) {
            kmapResult.innerHTML = '<div class="error-message">K-map only supports 2 to 4 variables.</div>';
            return;
          }
          const minterms = table.map((row, i) => row.out === 1 ? i : null).filter(i => i !== null);
          kmapResult.innerHTML = renderKMap(vars, minterms);
        } catch (err) {
          kmapResult.innerHTML = `<div class="error-message">Error: ${err.message}</div>`;
        }
      });

      // K-Map Minterms Solver Logic
      const kmapMintermsForm = panel.querySelector('#kmap-minterms-form');
      const kmapMintermsInput = panel.querySelector('#kmap-minterms-input');
      const kmapDCInput = panel.querySelector('#kmap-dc-input');
      const kmapVarsInput = panel.querySelector('#kmap-vars-input');
      const kmapMintermsResult = panel.querySelector('#kmap-minterms-result');
      kmapMintermsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const minterms = kmapMintermsInput.value.split(',').map(x => x.trim()).filter(x => x !== '').map(Number);
        const dcs = kmapDCInput.value.split(',').map(x => x.trim()).filter(x => x !== '').map(Number);
        const n = parseInt(kmapVarsInput.value);
        if (isNaN(n) || n < 2 || n > 4) {
          kmapMintermsResult.innerHTML = '<div class="error-message">Number of variables must be 2-4.</div>';
          return;
        }
        if (minterms.some(x => isNaN(x) || x < 0 || x >= (1 << n))) {
          kmapMintermsResult.innerHTML = '<div class="error-message">Invalid minterm index.</div>';
          return;
        }
        if (dcs.some(x => isNaN(x) || x < 0 || x >= (1 << n))) {
          kmapMintermsResult.innerHTML = '<div class="error-message">Invalid don\'t care index.</div>';
          return;
        }
        // Render K-map with minterms and don't cares
        kmapMintermsResult.innerHTML = renderKMapMinterms(n, minterms, dcs);
        // Show step-by-step simplification
        kmapMintermsResult.innerHTML += renderKMapSteps(n, minterms, dcs);
      });
    }, 0);

    return panel;
  }

  attachEventListeners() {
    // BJT Panel listeners
    const bjtTypeSelect = document.getElementById('bjt-type');
    const bjtExampleBtn = document.getElementById('bjt-example');
    const bjtResetBtn = document.getElementById('bjt-reset');
    const bjtSolveBtn = document.getElementById('bjt-solve');
    
    if (bjtTypeSelect) {
      bjtTypeSelect.addEventListener('change', () => this.updateBJTInputs());
    }
    if (bjtExampleBtn) {
      bjtExampleBtn.addEventListener('click', () => this.loadBJTExample());
    }
    if (bjtResetBtn) {
      bjtResetBtn.addEventListener('click', () => this.resetBJTForm());
    }
    if (bjtSolveBtn) {
      bjtSolveBtn.addEventListener('click', () => this.solveBJT());
    }
    
    // Op-Amp Panel listeners
    const opampTypeSelect = document.getElementById('opamp-type');
    const opampExampleBtn = document.getElementById('opamp-example');
    const opampResetBtn = document.getElementById('opamp-reset');
    const opampSolveBtn = document.getElementById('opamp-solve');
    
    if (opampTypeSelect) {
      opampTypeSelect.addEventListener('change', () => this.updateOpAmpInputs());
    }
    if (opampExampleBtn) {
      opampExampleBtn.addEventListener('click', () => this.loadOpAmpExample());
    }
    if (opampResetBtn) {
      opampResetBtn.addEventListener('click', () => this.resetOpAmpForm());
    }
    if (opampSolveBtn) {
      opampSolveBtn.addEventListener('click', () => this.solveOpAmp());
    }
  }

  updateBJTInputs() {
    const typeSelector = document.getElementById('bjt-type');
    const inputsContainer = document.getElementById('bjt-inputs');
    
    if (!typeSelector || !inputsContainer) return;
    
    const selectedType = typeSelector.value;
    const schema = BJTSolver.getInputSchema(selectedType);
    
    this.buildInputs(inputsContainer, schema);
    this.attachDynamicListeners();
    this.updateLiveGraph();
  }

  updateOpAmpInputs() {
    const typeSelector = document.getElementById('opamp-type');
    const inputsContainer = document.getElementById('opamp-inputs');
    
    if (!typeSelector || !inputsContainer) return;
    
    const selectedType = typeSelector.value;
    const schema = OpAmpSolver.getInputSchema(selectedType);
    
    this.buildInputs(inputsContainer, schema);
  }

  buildInputs(container, schema) {
    container.innerHTML = '';
    
    const grid = document.createElement('div');
    grid.className = 'form-grid';
    
    schema.forEach(field => {
      const group = document.createElement('div');
      group.className = 'input-group';
      
      const label = document.createElement('label');
      label.textContent = field.label;
      if (field.unit) {
        const span = document.createElement('span');
        span.className = 'unit';
        span.textContent = ` (${field.unit})`;
        label.appendChild(span);
      }
      
      const input = document.createElement('input');
      input.type = 'number';
      input.step = 'any';
      input.className = 'form-control';
      input.name = field.name;
      input.value = field.default ?? '';
      input.required = true;
      
      group.appendChild(label);
      group.appendChild(input);
      grid.appendChild(group);
    });
    
    container.appendChild(grid);
  }

  attachDynamicListeners() {
    const inputsContainer = document.getElementById('bjt-inputs');
    if (!inputsContainer) return;
    
    const inputs = inputsContainer.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('input', () => this.updateLiveGraph());
    });
  }

  updateLiveGraph() {
    const typeSelector = document.getElementById('bjt-type');
    const inputsContainer = document.getElementById('bjt-inputs');
    
    if (!typeSelector || !inputsContainer) return;
    
    const selectedType = typeSelector.value;
    const data = this.collectInputData(inputsContainer);
    
    if (!data) return; // Don't update if invalid inputs
    
    try {
      const solution = BJTSolver.solve(selectedType, data);
      if (solution.loadLine) {
        const canvas = document.getElementById('live-loadline-canvas');
        if (canvas) {
          const { IcSat, VceCutoff, qPoint } = solution.loadLine;
          drawLoadLine(canvas, IcSat, VceCutoff, qPoint);
        }
      }
    } catch (error) {
      // Silently fail for real-time updates
    }
  }

  showPanel(panelName) {
    this.currentPanel = panelName;
    
    // Update navigation
    document.querySelectorAll('.nav-tab').forEach((tab, i) => {
      const isActive = (i === 0 && panelName === 'BJT Bias') || 
                       (i === 1 && panelName === 'Op-Amp') ||
                       (i === 2 && panelName === 'Digital Logic');
      tab.classList.toggle('active', isActive);
    });
    
    // Update panels
    document.querySelectorAll('.panel').forEach(p => {
      p.classList.add('hidden');
      p.classList.remove('active');
    });
    
    let panelId;
    switch (panelName) {
      case 'BJT Bias':
        panelId = 'panel-bjt-bias';
        break;
      case 'Op-Amp':
        panelId = 'panel-op-amp';
        break;
      case 'Digital Logic':
        panelId = 'panel-digital-logic';
        break;
    }
    
    const target = document.getElementById(panelId);
    if (target) {
      target.classList.remove('hidden');
      setTimeout(() => {
        target.classList.add('active');
        // Re-attach event listeners when panel becomes active
        this.attachEventListeners();
        
        // Initialize inputs for the active panel
        if (panelName === 'BJT Bias') {
          this.updateBJTInputs();
        } else if (panelName === 'Op-Amp') {
          this.updateOpAmpInputs();
        }
      }, 50);
    }
  }

  solveBJT() {
    const typeSelector = document.getElementById('bjt-type');
    const inputsContainer = document.getElementById('bjt-inputs');
    const resultsContainer = document.getElementById('bjt-results');
    
    const selectedType = typeSelector.value;
    const data = this.collectInputData(inputsContainer);
    
    if (!data) {
      this.showError(resultsContainer, 'Please enter valid numeric values.');
      return;
    }
    
    this.showLoading(resultsContainer);
    
    setTimeout(() => {
      try {
        const solution = BJTSolver.solve(selectedType, data);
        this.displayResults(resultsContainer, solution);
      } catch (error) {
        this.showError(resultsContainer, error.message);
      }
    }, 300);
  }

  solveOpAmp() {
    const typeSelector = document.getElementById('opamp-type');
    const inputsContainer = document.getElementById('opamp-inputs');
    const resultsContainer = document.getElementById('opamp-results');
    
    const selectedType = typeSelector.value;
    const data = this.collectInputData(inputsContainer);
    
    if (!data) {
      this.showError(resultsContainer, 'Please enter valid numeric values.');
      return;
    }
    
    this.showLoading(resultsContainer);
    
    setTimeout(() => {
      try {
        const solution = OpAmpSolver.solve(selectedType, data);
        this.displayResults(resultsContainer, solution);
      } catch (error) {
        this.showError(resultsContainer, error.message);
      }
    }, 300);
  }

  collectInputData(container) {
    const data = {};
    let hasErrors = false;
    
    container.querySelectorAll('input').forEach(input => {
      const value = parseFloat(input.value);
      if (isNaN(value)) {
        hasErrors = true;
        input.style.borderColor = 'var(--color-error)';
      } else {
        input.style.borderColor = '';
        data[input.name] = value;
      }
    });
    
    return hasErrors ? null : data;
  }

  showLoading(container) {
    container.innerHTML = '<div class="loading"><div class="loading-spinner"></div><span>Calculating solution...</span></div>';
    container.classList.add('show');
  }

  showError(container, message) {
    container.innerHTML = `<div class="error-message"><strong>Error:</strong> ${message}</div>`;
    container.classList.add('show');
  }

  displayResults(container, solution) {
    const { results, steps, svg, loadLine } = solution;
    
    let html = `
      <div class="results-header">
        <div class="results-icon">✓</div>
        <h3>Solution Complete</h3>
      </div>
      
      <div class="final-answer">
        <h4>Final Results</h4>
        <div class="answer-grid">
          ${Object.entries(results).map(([key, value]) => `
            <div class="answer-item">
              <div class="answer-label">${key.toUpperCase()}</div>
              <div class="answer-value">${value}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    if (svg) {
      html += `
        <div class="circuit-schematic">
          <h4>Circuit Schematic</h4>
          ${svg}
        </div>
      `;
    }
    
    html += `
      <div class="steps-container">
        <div class="steps-header">
          <div class="steps-icon">i</div>
          <h4>Step-by-Step Solution</h4>
        </div>
        ${steps.map((step, i) => `
          <div class="step">
            <div class="step-header">
              <div class="step-number">${i + 1}</div>
              <div class="step-title">${step.title}</div>
            </div>
            <div class="step-content">
              <div class="step-explanation">${step.explanation}</div>
              ${step.formula ? `<div class="step-formula">${step.formula}</div>` : ''}
              ${step.substitution ? `<div class="step-substitution">${step.substitution}</div>` : ''}
              ${step.result ? `<div class="step-reason">Result: ${step.result}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    container.innerHTML = html;
    container.classList.add('show');
    
    setTimeout(() => container.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  loadBJTExample() {
    const typeSelector = document.getElementById('bjt-type');
    const inputsContainer = document.getElementById('bjt-inputs');
    
    const selectedType = typeSelector.value;
    const schema = BJTSolver.getInputSchema(selectedType);
    
    this.loadExampleValues(inputsContainer, schema);
    this.updateLiveGraph();
  }

  loadOpAmpExample() {
    const typeSelector = document.getElementById('opamp-type');
    const inputsContainer = document.getElementById('opamp-inputs');
    
    const selectedType = typeSelector.value;
    const schema = OpAmpSolver.getInputSchema(selectedType);
    
    this.loadExampleValues(inputsContainer, schema);
  }

  loadExampleValues(container, schema) {
    container.querySelectorAll('input').forEach(input => {
      const field = schema.find(f => f.name === input.name);
      if (field) {
        input.value = field.default ?? '';
        input.style.borderColor = '';
      }
    });
  }

  resetBJTForm() {
    const inputsContainer = document.getElementById('bjt-inputs');
    const resultsContainer = document.getElementById('bjt-results');
    
    this.resetFormInputs(inputsContainer);
    this.clearResults(resultsContainer);
    this.clearLiveGraph();
  }

  resetOpAmpForm() {
    const inputsContainer = document.getElementById('opamp-inputs');
    const resultsContainer = document.getElementById('opamp-results');
    
    this.resetFormInputs(inputsContainer);
    this.clearResults(resultsContainer);
  }

  resetFormInputs(container) {
    container.querySelectorAll('input').forEach(input => {
      input.value = '';
      input.style.borderColor = '';
    });
  }

  clearResults(container) {
    container.innerHTML = '';
    container.classList.remove('show');
  }

  clearLiveGraph() {
    const canvas = document.getElementById('live-loadline-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw empty graph background
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Enter circuit values to see dynamic Q-point', canvas.width / 2, canvas.height / 2);
    }
  }
}

// ===== APPLICATION INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  new ElectroSolveApp();
});

// Boolean logic helpers
function parseExpr(expr, vars) {
  let s = expr.replace(/\s+/g, '');
  // Step 1: Replace NOT (A') with !A
  s = s.replace(/([A-Za-z0-9])'/g, '!$1');
  // Step 2: Insert & for implicit AND
  // Insert & between:
  //   - variable or ) and variable or ! or (
  //   - ! and variable or (
  // But do NOT insert & before ! if it is already a NOT operator
  s = s.replace(/([A-Za-z0-9\)])(?=[A-Za-z!(])/g, '$1&');
  s = s.replace(/!([A-Za-z(])/g, '!&$1'); // !A or !(A) should be !&A or !&(A)
  s = s.replace(/!&/g, '!'); // revert !& to ! for correct NOT
  // Step 3: Replace * with &
  s = s.replace(/\*/g, '&');
  // Step 4: Replace + with |
  s = s.replace(/\+/g, '|');
  // Only allow valid chars
  if (/[^A-Za-z0-9!&|()]/.test(s)) throw new Error('Invalid character in expression');
  return s;
}
function evalExpr(expr, values) {
  let s = expr;
  // Replace each variable with its value using word boundaries
  for (const v in values) {
    // Use regex with word boundary to avoid partial replacements
    s = s.replace(new RegExp('(?<![A-Za-z0-9_])' + v + '(?![A-Za-z0-9_])', 'g'), values[v] ? '1' : '0');
  }
  try {
    // eslint-disable-next-line no-new-func
    return !!Function('return ' + s)();
  } catch {
    throw new Error('Invalid Boolean expression');
  }
}
function getVars(expr) {
  return Array.from(new Set(expr.match(/[A-Za-z]/g))).sort();
}
function getTruthTable(expr) {
  const vars = getVars(expr);
  const rows = 1 << vars.length;
  const table = [];
  const parsed = parseExpr(expr, vars);
  for (let i = 0; i < rows; i++) {
    const values = {};
    vars.forEach((v, idx) => {
      values[v] = (i >> (vars.length - idx - 1)) & 1;
    });
    let out;
    try {
      out = evalExpr(parsed, values) ? 1 : 0;
    } catch {
      out = '?';
    }
    table.push({ ...values, out });
  }
  return { vars, table };
}
// Quine-McCluskey minimizer for up to 4 variables
function mintermsToExpr(vars, minterms) {
  if (minterms.length === 0) return '0';
  if (minterms.length === (1 << vars.length)) return '1';
  // For small cases, just join minterms
  return minterms.map(m => {
    return vars.map((v, i) => ((m >> (vars.length - i - 1)) & 1) ? v : v + "'").join('');
  }).join(' + ');
}
function simplifyExpr(expr) {
  const { vars, table } = getTruthTable(expr);
  if (vars.length > 4) return 'Too many variables to minimize';
  // Get minterms
  const minterms = table.map((row, i) => row.out === 1 ? i : null).filter(i => i !== null);
  // For now, just return sum of minterms (SOP)
  return mintermsToExpr(vars, minterms);
}
// Karnaugh Map rendering and grouping logic
function renderKMap(vars, minterms) {
  // Gray code order for 2, 3, 4 variables
  const gray = n => n ^ (n >> 1);
  const n = vars.length;
  let rows, cols, rowLabels, colLabels;
  if (n === 2) {
    rows = 2; cols = 2;
    rowLabels = ['0', '1'];
    colLabels = ['0', '1'];
  } else if (n === 3) {
    rows = 2; cols = 4;
    rowLabels = ['0', '1'];
    colLabels = ['00', '01', '11', '10'];
  } else if (n === 4) {
    rows = 4; cols = 4;
    rowLabels = ['00', '01', '11', '10'];
    colLabels = ['00', '01', '11', '10'];
  } else {
    return '<div class="error-message">K-map only supports 2 to 4 variables.</div>';
  }
  // Build K-map grid
  let html = `<table class="kmap-table"><thead><tr><th></th>`;
  for (const c of colLabels) html += `<th>${c}</th>`;
  html += '</tr></thead><tbody>';
  for (let r = 0; r < rows; r++) {
    html += `<tr><th>${rowLabels[r]}</th>`;
    for (let c = 0; c < cols; c++) {
      let idx;
      if (n === 2) idx = (r << 1) | c;
      else if (n === 3) idx = (r << 2) | [0,1,3,2][c];
      else if (n === 4) idx = ([0,1,3,2][r] << 2) | [0,1,3,2][c];
      const isMinterm = minterms.includes(idx);
      html += `<td class="kmap-cell${isMinterm ? ' kmap-minterm' : ''}">${isMinterm ? '1' : '0'}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  // Optionally, add grouping/prime implicant visualization here
  html += `<div class="kmap-summary">Minterms: ${minterms.length ? minterms.join(', ') : 'None'}</div>`;
  return html;
}
// Render K-map with minterms and don't cares
function renderKMapMinterms(n, minterms, dcs) {
  // Gray code order for 2, 3, 4 variables
  const gray = x => x ^ (x >> 1);
  let rows, cols, rowLabels, colLabels;
  if (n === 2) {
    rows = 2; cols = 2;
    rowLabels = ['0', '1'];
    colLabels = ['0', '1'];
  } else if (n === 3) {
    rows = 2; cols = 4;
    rowLabels = ['0', '1'];
    colLabels = ['00', '01', '11', '10'];
  } else if (n === 4) {
    rows = 4; cols = 4;
    rowLabels = ['00', '01', '11', '10'];
    colLabels = ['00', '01', '11', '10'];
  } else {
    return '<div class="error-message">K-map only supports 2 to 4 variables.</div>';
  }
  let html = `<table class="kmap-table"><thead><tr><th></th>`;
  for (const c of colLabels) html += `<th>${c}</th>`;
  html += '</tr></thead><tbody>';
  for (let r = 0; r < rows; r++) {
    html += `<tr><th>${rowLabels[r]}</th>`;
    for (let c = 0; c < cols; c++) {
      let idx;
      if (n === 2) idx = (r << 1) | c;
      else if (n === 3) idx = (r << 2) | [0,1,3,2][c];
      else if (n === 4) idx = ([0,1,3,2][r] << 2) | [0,1,3,2][c];
      let cellClass = 'kmap-cell';
      if (minterms.includes(idx)) cellClass += ' kmap-minterm';
      else if (dcs.includes(idx)) cellClass += ' kmap-dc';
      html += `<td class="${cellClass}">${minterms.includes(idx) ? '1' : dcs.includes(idx) ? 'X' : '0'}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  html += `<div class="kmap-summary">Minterms: ${minterms.length ? minterms.join(', ') : 'None'} | Don't Cares: ${dcs.length ? dcs.join(', ') : 'None'}</div>`;
  return html;
}
// Step-by-step Quine-McCluskey for up to 4 variables
function renderKMapSteps(n, minterms, dcs) {
  if (n > 4) return '';
  // 1. Initial grouping by number of 1s
  let groups = {};
  minterms.concat(dcs).forEach(m => {
    const ones = m.toString(2).split('').filter(x => x === '1').length;
    if (!groups[ones]) groups[ones] = [];
    groups[ones].push(m);
  });
  let html = '<div class="kmap-step"><b>Step 1: Initial Grouping</b><br>';
  Object.keys(groups).sort((a,b)=>a-b).forEach(k => {
    html += `Group ${k}: [${groups[k].join(', ')}]<br>`;
  });
  html += '</div>';
  // 2. Prime implicant chart (simple, not full Petrick's method)
  // For brevity, use a basic Quine-McCluskey for up to 4 vars
  function combine(a, b) {
    let diff = 0, pos = -1;
    for (let i = 0; i < n; i++) {
      if (((a >> i) & 1) !== ((b >> i) & 1)) { diff++; pos = i; }
    }
    if (diff === 1) return a & ~(1 << pos);
    return null;
  }
  let terms = minterms.concat(dcs).map(m => ({ms: [m], mask: 0, used: false}));
  let next = [], primeImplicants = [];
  let step = 2;
  while (terms.length) {
    let marked = new Array(terms.length).fill(false);
    let combined = [];
    for (let i = 0; i < terms.length; i++) {
      for (let j = i+1; j < terms.length; j++) {
        let diff = terms[i].ms[0] ^ terms[j].ms[0];
        if (diff && (diff & (diff-1)) === 0 && terms[i].mask === terms[j].mask) {
          let mask = terms[i].mask | diff;
          let ms = Array.from(new Set(terms[i].ms.concat(terms[j].ms))).sort((a,b)=>a-b);
          let exists = next.find(t => t.ms.join(',') === ms.join(',') && t.mask === mask);
          if (!exists) next.push({ms, mask, used: false});
          marked[i] = marked[j] = true;
        }
      }
    }
    for (let i = 0; i < terms.length; i++) {
      if (!marked[i] && !terms[i].used) primeImplicants.push(terms[i]);
    }
    if (next.length === 0) break;
    terms = next;
    next = [];
    html += `<div class="kmap-step"><b>Step ${step++}: Combine Groups</b><br>`;
    terms.forEach(t => {
      html += `Implicant: [${t.ms.join(', ')}], Mask: ${t.mask.toString(2).padStart(n,'0')}<br>`;
    });
    html += '</div>';
  }
  // 3. Prime implicant chart for minterms
  html += '<div class="kmap-step"><b>Step '+step+++': Prime Implicants</b><br>';
  primeImplicants.forEach((t,i) => {
    html += `PI ${i+1}: covers [${t.ms.join(', ')}], Mask: ${t.mask.toString(2).padStart(n,'0')}<br>`;
  });
  html += '</div>';
  // 4. Cover minterms with prime implicants (greedy)
  let covered = new Set();
  let cover = [];
  for (let t of primeImplicants) {
    let covers = t.ms.filter(m => minterms.includes(m));
    if (covers.length) {
      cover.push(t);
      covers.forEach(m => covered.add(m));
    }
    if (covered.size === minterms.length) break;
  }
  html += '<div class="kmap-step"><b>Step '+step+++': Cover Minterms</b><br>';
  cover.forEach((t,i) => {
    html += `Selected: [${t.ms.join(', ')}], Mask: ${t.mask.toString(2).padStart(n,'0')}<br>`;
  });
  html += '</div>';
  // 5. Final expression
  function termToExpr(t) {
    let bits = [];
    for (let i = n-1; i >= 0; i--) {
      if ((t.mask & (1<<i)) === 0) {
        bits.push(((t.ms[0]>>i)&1) ? String.fromCharCode(65+n-i-1) : String.fromCharCode(65+n-i-1)+"'");
      }
    }
    return bits.join('');
  }
  let expr = cover.map(termToExpr).join(' + ');
  html += `<div class="kmap-step"><b>Final Minimal SOP Expression:</b> <span style="color:var(--color-primary,#43a047);font-weight:bold;">${expr||'0'}</span></div>`;
  return html;
}
