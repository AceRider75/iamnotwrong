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
function renderBjtSvg(containerId, { IcSat, VceCutoff, qPoint }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const existingSvg = container.querySelector('svg');
  if (existingSvg) existingSvg.remove();

  const width = 500;
  const height = 350;
  const margin = { top: 40, right: 40, bottom: 60, left: 80 };
  const viewW = width - margin.left - margin.right;
  const viewH = height - margin.top - margin.bottom;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';
  svg.style.border = '1px solid var(--color-border)';
  svg.style.borderRadius = 'var(--radius-base)';
  svg.style.background = 'white';

  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', width);
  bg.setAttribute('height', height);
  bg.setAttribute('fill', 'white');
  svg.appendChild(bg);

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);

  const maxIC = Math.max(IcSat * 1.2, qPoint.IC * 1.5);
  const maxVCE = Math.max(VceCutoff * 1.2, qPoint.VCE * 1.5);
  const toX = vce => Math.max(0, Math.min(viewW, (vce / maxVCE) * viewW));
  const toY = ic => Math.max(0, Math.min(viewH, viewH - (ic / maxIC) * viewH));

  // Enhanced grid with better styling
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
  pattern.setAttribute('id', 'grid');
  pattern.setAttribute('width', viewW / 10);
  pattern.setAttribute('height', viewH / 10);
  pattern.setAttribute('patternUnits', 'userSpaceOnUse');
  
  const gridRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  gridRect.setAttribute('width', viewW / 10);
  gridRect.setAttribute('height', viewH / 10);
  gridRect.setAttribute('fill', 'none');
  gridRect.setAttribute('stroke', '#f0f0f0');
  gridRect.setAttribute('stroke-width', '1');
  pattern.appendChild(gridRect);
  defs.appendChild(pattern);
  svg.appendChild(defs);

  const gridBackground = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  gridBackground.setAttribute('width', viewW);
  gridBackground.setAttribute('height', viewH);
  gridBackground.setAttribute('fill', 'url(#grid)');
  g.appendChild(gridBackground);

  // Enhanced axes with tick marks
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', 0);
  xAxis.setAttribute('y1', viewH);
  xAxis.setAttribute('x2', viewW);
  xAxis.setAttribute('y2', viewH);
  xAxis.setAttribute('stroke', '#333');
  xAxis.setAttribute('stroke-width', '2');
  g.appendChild(xAxis);

  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', 0);
  yAxis.setAttribute('y1', 0);
  yAxis.setAttribute('x2', 0);
  yAxis.setAttribute('y2', viewH);
  yAxis.setAttribute('stroke', '#333');
  yAxis.setAttribute('stroke-width', '2');
  g.appendChild(yAxis);

  // X-axis tick marks and labels
  for (let i = 0; i <= 10; i++) {
    const x = (i / 10) * viewW;
    const vceValue = (i / 10) * maxVCE;
    
    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tick.setAttribute('x1', x);
    tick.setAttribute('y1', viewH);
    tick.setAttribute('x2', x);
    tick.setAttribute('y2', viewH + 5);
    tick.setAttribute('stroke', '#333');
    tick.setAttribute('stroke-width', '1');
    g.appendChild(tick);

    if (i % 2 === 0) {
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.textContent = vceValue.toFixed(1);
      label.setAttribute('x', x);
      label.setAttribute('y', viewH + 20);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', '#333');
      label.setAttribute('font-size', '12');
      g.appendChild(label);
    }
  }

  // Y-axis tick marks and labels
  for (let i = 0; i <= 10; i++) {
    const y = (i / 10) * viewH;
    const icValue = ((10 - i) / 10) * maxIC;
    
    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tick.setAttribute('x1', 0);
    tick.setAttribute('y1', y);
    tick.setAttribute('x2', -5);
    tick.setAttribute('y2', y);
    tick.setAttribute('stroke', '#333');
    tick.setAttribute('stroke-width', '1');
    g.appendChild(tick);

    if (i % 2 === 0) {
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.textContent = icValue.toFixed(1);
      label.setAttribute('x', -15);
      label.setAttribute('y', y + 4);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('fill', '#333');
      label.setAttribute('font-size', '12');
      g.appendChild(label);
    }
  }

  // Enhanced load line with gradient
  const loadLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  loadLine.setAttribute('x1', toX(0));
  loadLine.setAttribute('y1', toY(IcSat));
  loadLine.setAttribute('x2', toX(VceCutoff));
  loadLine.setAttribute('y2', toY(0));
  loadLine.setAttribute('stroke', '#1FB8CD');
  loadLine.setAttribute('stroke-width', '3');
  loadLine.setAttribute('stroke-dasharray', '5,5');
  g.appendChild(loadLine);

  // Enhanced Q-point with glow effect
  const qPointCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  qPointCircle.setAttribute('cx', toX(qPoint.VCE));
  qPointCircle.setAttribute('cy', toY(qPoint.IC));
  qPointCircle.setAttribute('r', 8);
  qPointCircle.setAttribute('fill', '#DB4545');
  qPointCircle.setAttribute('stroke', '#B4413C');
  qPointCircle.setAttribute('stroke-width', '3');
  g.appendChild(qPointCircle);

  // Q-point label
  const qLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  qLabel.textContent = `Q(${qPoint.VCE.toFixed(2)}V, ${qPoint.IC.toFixed(2)}mA)`;
  qLabel.setAttribute('x', toX(qPoint.VCE) + 15);
  qLabel.setAttribute('y', toY(qPoint.IC) - 10);
  qLabel.setAttribute('fill', '#DB4545');
  qLabel.setAttribute('font-size', '12');
  qLabel.setAttribute('font-weight', 'bold');
  g.appendChild(qLabel);

  // Enhanced axis labels
  const xlabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xlabel.textContent = 'VCE (Volts)';
  xlabel.setAttribute('x', viewW / 2);
  xlabel.setAttribute('y', viewH + 45);
  xlabel.setAttribute('text-anchor', 'middle');
  xlabel.setAttribute('fill', '#333');
  xlabel.setAttribute('font-size', '14');
  xlabel.setAttribute('font-weight', 'bold');
  g.appendChild(xlabel);

  const ylabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  ylabel.textContent = 'IC (mA)';
  ylabel.setAttribute('x', -60);
  ylabel.setAttribute('y', viewH / 2);
  ylabel.setAttribute('transform', `rotate(-90 -60 ${viewH / 2})`);
  ylabel.setAttribute('text-anchor', 'middle');
  ylabel.setAttribute('fill', '#333');
  ylabel.setAttribute('font-size', '14');
  ylabel.setAttribute('font-weight', 'bold');
  g.appendChild(ylabel);

  // Enhanced title
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  title.textContent = 'DC Load Line Analysis & Q-Point';
  title.setAttribute('x', viewW / 2);
  title.setAttribute('y', -15);
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('fill', '#333');
  title.setAttribute('font-size', '16');
  title.setAttribute('font-weight', 'bold');
  g.appendChild(title);

  // Legend
  const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  legend.setAttribute('transform', `translate(${viewW - 120}, 20)`);
  
  const legendBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  legendBg.setAttribute('width', 110);
  legendBg.setAttribute('height', 50);
  legendBg.setAttribute('fill', 'white');
  legendBg.setAttribute('stroke', '#ccc');
  legendBg.setAttribute('stroke-width', '1');
  legendBg.setAttribute('rx', '5');
  legend.appendChild(legendBg);

  const loadLineLegend = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  loadLineLegend.setAttribute('x1', 10);
  loadLineLegend.setAttribute('y1', 15);
  loadLineLegend.setAttribute('x2', 30);
  loadLineLegend.setAttribute('y2', 15);
  loadLineLegend.setAttribute('stroke', '#1FB8CD');
  loadLineLegend.setAttribute('stroke-width', '3');
  loadLineLegend.setAttribute('stroke-dasharray', '5,5');
  legend.appendChild(loadLineLegend);

  const loadLineLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  loadLineLabel.textContent = 'Load Line';
  loadLineLabel.setAttribute('x', 35);
  loadLineLabel.setAttribute('y', 19);
  loadLineLabel.setAttribute('fill', '#333');
  loadLineLabel.setAttribute('font-size', '10');
  legend.appendChild(loadLineLabel);

  const qPointLegend = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  qPointLegend.setAttribute('cx', 20);
  qPointLegend.setAttribute('cy', 35);
  qPointLegend.setAttribute('r', 6);
  qPointLegend.setAttribute('fill', '#DB4545');
  qPointLegend.setAttribute('stroke', '#B4413C');
  qPointLegend.setAttribute('stroke-width', '2');
  legend.appendChild(qPointLegend);

  const qPointLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  qPointLabel.textContent = 'Q-Point';
  qPointLabel.setAttribute('x', 35);
  qPointLabel.setAttribute('y', 39);
  qPointLabel.setAttribute('fill', '#333');
  qPointLabel.setAttribute('font-size', '10');
  legend.appendChild(qPointLabel);

  g.appendChild(legend);

  container.appendChild(svg);
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
    const schematics = {
      'base': `<svg width="300" height="200" viewBox="0 0 300 200">
        <line x1="50" y1="50" x2="150" y2="50" stroke="black" stroke-width="2"/>
        <rect x="150" y="45" width="40" height="10" fill="none" stroke="black" stroke-width="2"/>
        <text x="170" y="40" text-anchor="middle" font-size="12">RB</text>
        <line x1="190" y1="50" x2="210" y2="50" stroke="black" stroke-width="2"/>
        <circle cx="210" cy="50" r="3" fill="black"/>
        <line x1="210" y1="50" x2="210" y2="80" stroke="black" stroke-width="2"/>
        <line x1="200" y1="80" x2="220" y2="80" stroke="black" stroke-width="2"/>
        <line x1="210" y1="80" x2="230" y2="60" stroke="black" stroke-width="2"/>
        <line x1="210" y1="80" x2="230" y2="100" stroke="black" stroke-width="2"/>
        <line x1="230" y1="60" x2="230" y2="30" stroke="black" stroke-width="2"/>
        <line x1="230" y1="30" x2="280" y2="30" stroke="black" stroke-width="2"/>
        <rect x="240" y="25" width="30" height="10" fill="none" stroke="black" stroke-width="2"/>
        <text x="255" y="20" text-anchor="middle" font-size="12">RC</text>
        <line x1="230" y1="100" x2="230" y2="130" stroke="black" stroke-width="2"/>
        <rect x="220" y="130" width="20" height="10" fill="none" stroke="black" stroke-width="2"/>
        <text x="230" y="155" text-anchor="middle" font-size="12">RE</text>
        <line x1="230" y1="140" x2="230" y2="170" stroke="black" stroke-width="2"/>
        <line x1="50" y1="30" x2="50" y2="170" stroke="black" stroke-width="2"/>
        <line x1="280" y1="30" x2="280" y2="170" stroke="black" stroke-width="2"/>
        <text x="40" y="100" text-anchor="middle" font-size="12">VCC</text>
        <text x="50" y="185" text-anchor="middle" font-size="12">GND</text>
      </svg>`,
      'voltage-divider': `<svg width="300" height="250" viewBox="0 0 300 250">
        <line x1="50" y1="50" x2="150" y2="50" stroke="black" stroke-width="2"/>
        <rect x="150" y="45" width="40" height="10" fill="none" stroke="black" stroke-width="2"/>
        <text x="170" y="40" text-anchor="middle" font-size="12">R1</text>
        <line x1="190" y1="50" x2="210" y2="50" stroke="black" stroke-width="2"/>
        <circle cx="210" cy="50" r="3" fill="black"/>
        <line x1="210" y1="50" x2="210" y2="80" stroke="black" stroke-width="2"/>
        <rect x="200" y="80" width="20" height="10" fill="none" stroke="black" stroke-width="2"/>
        <text x="170" y="95" text-anchor="middle" font-size="12">R2</text>
        <line x1="210" y1="90" x2="210" y2="120" stroke="black" stroke-width="2"/>
        <circle cx="210" cy="120" r="3" fill="black"/>
        <line x1="210" y1="120" x2="230" y2="120" stroke="black" stroke-width="2"/>
        <line x1="220" y1="120" x2="240" y2="120" stroke="black" stroke-width="2"/>
        <line x1="230" y1="120" x2="250" y2="100" stroke="black" stroke-width="2"/>
        <line x1="230" y1="120" x2="250" y2="140" stroke="black" stroke-width="2"/>
        <line x1="250" y1="100" x2="250" y2="70" stroke="black" stroke-width="2"/>
        <line x1="250" y1="70" x2="300" y2="70" stroke="black" stroke-width="2"/>
        <rect x="260" y="65" width="30" height="10" fill="none" stroke="black" stroke-width="2"/>
        <text x="275" y="60" text-anchor="middle" font-size="12">RC</text>
        <line x1="250" y1="140" x2="250" y2="170" stroke="black" stroke-width="2"/>
        <rect x="240" y="170" width="20" height="10" fill="none" stroke="black" stroke-width="2"/>
        <text x="250" y="195" text-anchor="middle" font-size="12">RE</text>
        <line x1="250" y1="180" x2="250" y2="210" stroke="black" stroke-width="2"/>
        <line x1="50" y1="50" x2="50" y2="210" stroke="black" stroke-width="2"/>
        <line x1="300" y1="70" x2="300" y2="210" stroke="black" stroke-width="2"/>
        <line x1="210" y1="120" x2="210" y2="210" stroke="black" stroke-width="2"/>
        <line x1="250" y1="210" x2="250" y2="210" stroke="black" stroke-width="2"/>
        <text x="40" y="130" text-anchor="middle" font-size="12">VCC</text>
        <text x="50" y="225" text-anchor="middle" font-size="12">GND</text>
      </svg>`,
      'collector-feedback': `<svg width="300" height="200" viewBox="0 0 300 200">
        <line x1="50" y1="50" x2="150" y2="50" stroke="black" stroke-width="2"/>
        <rect x="150" y="45" width="40" height="10" fill="none" stroke="black" stroke-width="2"/>
        <text x="170" y="40" text-anchor="middle" font-size="12">RC</text>
        <line x1="190" y1="50" x2="210" y2="50" stroke="black" stroke-width="2"/>
        <circle cx="210" cy="50" r="3" fill="black"/>
        <line x1="210" y1="50" x2="210" y2="30" stroke="black" stroke-width="2"/>
        <line x1="210" y1="30" x2="150" y2="30" stroke="black" stroke-width="2"/>
        <line x1="150" y1="30" x2="150" y2="70" stroke="black" stroke-width="2"/>
        <rect x="140" y="70" width="20" height="10" fill="none" stroke="black" stroke-width="2"/>
        <text x="110" y="85" text-anchor="middle" font-size="12">RB</text>
        <line x1="150" y1="80" x2="150" y2="100" stroke="black" stroke-width="2"/>
        <line x1="150" y1="100" x2="170" y2="100" stroke="black" stroke-width="2"/>
        <line x1="160" y1="100" x2="180" y2="100" stroke="black" stroke-width="2"/>
        <line x1="170" y1="100" x2="190" y2="80" stroke="black" stroke-width="2"/>
        <line x1="170" y1="100" x2="190" y2="120" stroke="black" stroke-width="2"/>
        <line x1="190" y1="80" x2="190" y2="50" stroke="black" stroke-width="2"/>
        <line x1="190" y1="120" x2="190" y2="150" stroke="black" stroke-width="2"/>
        <line x1="50" y1="50" x2="50" y2="150" stroke="black" stroke-width="2"/>
        <line x1="190" y1="150" x2="50" y2="150" stroke="black" stroke-width="2"/>
        <text x="40" y="100" text-anchor="middle" font-size="12">VCC</text>
        <text x="50" y="165" text-anchor="middle" font-size="12">GND</text>
      </svg>`
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
    const schematics = {
      'inverting': `<svg width="300" height="150" viewBox="0 0 300 150">
        <polygon points="150,50 150,100 200,75" fill="none" stroke="black" stroke-width="2"/>
        <line x1="50" y1="60" x2="120" y2="60" stroke="black" stroke-width="2"/>
        <rect x="120" y="55" width="30" height="10" fill="none" stroke="black" stroke-width="2"/>
        <text x="135" y="50" text-anchor="middle" font-size="10">R1</text>
        <line x1="120" y1="60" x2="150" y2="60" stroke="black" stroke-width="2"/>
        <line x1="155" y1="85" x2="155" y2="100" stroke="black" stroke-width="2"/>
        <line x1="155" y1="100" x2="250" y2="100" stroke="black" stroke-width="2"/>
        <line x1="250" y1="100" x2="250" y2="75" stroke="black" stroke-width="2"/>
        <line x1="200" y1="75" x2="250" y2="75" stroke="black" stroke-width="2"/>
        <rect x="210" y="70" width="30" height="10" fill="none" stroke="black" stroke-width="2"/>
        <text x="225" y="65" text-anchor="middle" font-size="10">R2</text>
        <text x="145" y="65" text-anchor="middle" font-size="12">-</text>
        <text x="145" y="90" text-anchor="middle" font-size="12">+</text>
        <text x="40" y="65" text-anchor="middle" font-size="12">Vin</text>
        <text x="260" y="80" text-anchor="middle" font-size="12">Vout</text>
      </svg>`,
      'summing': `<svg width="300" height="200" viewBox="0 0 300 200">
        <polygon points="150,75 150,125 200,100" fill="none" stroke="black" stroke-width="2"/>
        <line x1="50" y1="60" x2="120" y2="60" stroke="black" stroke-width="2"/>
        <rect x="120" y="55" width="30" height="10" fill="none" stroke="black" stroke-width="2"/>
        <text x="135" y="50" text-anchor="middle" font-size="10">R1</text>
        <line x1="50" y1="90" x2="120" y2="90" stroke="black" stroke-width="2"/>
        <rect x="120" y="85" width="30" height="10" fill="none" stroke="black" stroke-width="2"/>
        <text x="135" y="80" text-anchor="middle" font-size="10">R2</text>
        <line x1="120" y1="60" x2="140" y2="60" stroke="black" stroke-width="2"/>
        <line x1="120" y1="90" x2="140" y2="90" stroke="black" stroke-width="2"/>
        <line x1="140" y1="60" x2="140" y2="90" stroke="black" stroke-width="2"/>
        <line x1="140" y1="75" x2="150" y2="85" stroke="black" stroke-width="2"/>
        <line x1="155" y1="110" x2="155" y2="125" stroke="black" stroke-width="2"/>
        <line x1="155" y1="125" x2="250" y2="125" stroke="black" stroke-width="2"/>
        <line x1="250" y1="125" x2="250" y2="100" stroke="black" stroke-width="2"/>
        <line x1="200" y1="100" x2="250" y2="100" stroke="black" stroke-width="2"/>
        <rect x="210" y="95" width="30" height="10" fill="none" stroke="black" stroke-width="2"/>
        <text x="225" y="90" text-anchor="middle" font-size="10">Rf</text>
        <text x="145" y="90" text-anchor="middle" font-size="12">-</text>
        <text x="145" y="115" text-anchor="middle" font-size="12">+</text>
        <text x="30" y="65" text-anchor="middle" font-size="12">Vin1</text>
        <text x="30" y="95" text-anchor="middle" font-size="12">Vin2</text>
        <text x="270" y="105" text-anchor="middle" font-size="12">Vout</text>
      </svg>`
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
        <p class="panel-subtitle">Advanced digital circuit solvers and logic gate analysis</p>
      </div>
      <div class="feature-placeholder">
        <h3>🚀 Coming Soon!</h3>
        <p>This section will include comprehensive digital logic circuit solvers:</p>
        <ul style="text-align: left; margin: 20px 0; display: inline-block;">
          <li>Boolean algebra simplification</li>
          <li>Truth table generation</li>
          <li>Karnaugh map solving</li>
          <li>Sequential circuit analysis</li>
          <li>Timing diagram generation</li>
          <li>State machine design</li>
        </ul>
        <div class="status">In Development</div>
      </div>
    `;
    
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
