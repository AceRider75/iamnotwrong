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
const formatNumber = (num, decimals = 3) => {
  if (Math.abs(num) < 0.001) return num.toExponential(2);
  return Number(num.toFixed(decimals));
};

const formatValue = (value, unit = '') => {
  const formatted = formatNumber(value);
  return `${formatted}${unit ? ' ' + unit : ''}`;
};

// ===== FIXED DYNAMIC LOAD LINE DRAWING UTILITY =====
function drawLoadLine(canvas, IcSat, VceCutoff, qPoint) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Set up coordinate system
  const margin = 60;
  const plotWidth = width - 2 * margin;
  const plotHeight = height - 2 * margin;
  
  // Calculate scales with 10% headroom
  const maxIC = IcSat * 1.1;
  const maxVCE = VceCutoff * 1.1;
  
  // Draw background
  ctx.fillStyle = '#f9f9f9';
  ctx.fillRect(margin, margin, plotWidth, plotHeight);
  
  // Draw grid
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 10; i++) {
    const x = margin + (i * plotWidth / 10);
    const y = margin + (i * plotHeight / 10);
    ctx.beginPath();
    ctx.moveTo(x, margin);
    ctx.lineTo(x, height - margin);
    ctx.stroke();
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
  
  // Draw load line - FIXED COORDINATE SYSTEM
  ctx.strokeStyle = '#2196F3';
  ctx.lineWidth = 3;
  ctx.beginPath();
  // Load line from (0, IcSat) to (VceCutoff, 0)
  const loadLineStartX = margin + (0 * plotWidth / maxVCE); // (0, IcSat)
  const loadLineStartY = height - margin - (IcSat * plotHeight / maxIC); // (0, IcSat)
  const loadLineEndX = margin + (VceCutoff * plotWidth / maxVCE); // (VceCutoff, 0)
  const loadLineEndY = height - margin; // (VceCutoff, 0)
  
  ctx.moveTo(loadLineStartX, loadLineStartY);
  ctx.lineTo(loadLineEndX, loadLineEndY);
  ctx.stroke();
  
  // Correct the Q-point calculation based on load line equation
  const calculatedIC = - (IcSat / VceCutoff) * qPoint.VCE + IcSat; // Load line equation
  
  // Q-point scaling on canvas
  const qX = margin + (qPoint.VCE * plotWidth / maxVCE);
  const qY = height - margin - (calculatedIC * plotHeight / maxIC); // Correct the scaling of IC
  
  // Draw Q-point
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.arc(qX, qY, 8, 0, 2 * Math.PI);
  ctx.fill();
  
  // Q-point border
  ctx.strokeStyle = '#cc0000';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Q-point crosshairs
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
  
  // Add axis labels
  ctx.fillStyle = '#333';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('VCE (V)', width / 2, height - 15);
  ctx.save();
  ctx.translate(15, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('IC (mA)', 0, 0);
  ctx.restore();
  
  // Add scale labels
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  for (let i = 0; i <= 10; i++) {
    const vce = (i * maxVCE / 10);
    const ic = (i * maxIC / 10);
    const x = margin + (i * plotWidth / 10);
    const y = height - margin - (i * plotHeight / 10);
    
    if (i % 2 === 0) { // Show every other label to avoid crowding
      ctx.fillText(vce.toFixed(1), x, height - margin + 20);
      ctx.fillText(ic.toFixed(1), margin - 25, y + 5);
    }
  }
  
  // Add title
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('DC Load Line & Q-Point', width / 2, 25);
  
  // Add legend
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#2196F3';
  ctx.fillText('— Load Line', width - 150, 50);
  ctx.fillStyle = '#ff4444';
  ctx.fillText('● Q-Point', width - 150, 70);
  
  // Add Q-point coordinates
  ctx.fillStyle = '#333';
  ctx.font = '12px Arial';
  ctx.fillText(`Q-Point: (${qPoint.VCE.toFixed(2)}V, ${calculatedIC.toFixed(2)}mA)`, width - 200, height - 20);
}

// ===== ENHANCED BJT SOLVER CLASS =====
class SchematicRenderer {
  static renderBJTSchematic(containerId, type = 'voltageDivider') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const existingSvg = container.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    const width = 400;
    const height = 300;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';
    svg.style.border = '1px solid var(--color-border)';
    svg.style.borderRadius = 'var(--radius-base)';
    svg.style.background = 'white';

    // Background
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', width);
    bg.setAttribute('height', height);
    bg.setAttribute('fill', 'white');
    svg.appendChild(bg);

    // Create circuit based on type
    switch (type) {
      case 'voltageDivider':
        this.drawVoltageDividerBias(svg, width, height);
        break;
      case 'baseResistor':
        this.drawBaseResistorBias(svg, width, height);
        break;
      case 'collectorFeedback':
        this.drawCollectorFeedbackBias(svg, width, height);
        break;
      case 'emitterBias':
        this.drawEmitterBias(svg, width, height);
        break;
      default:
        this.drawVoltageDividerBias(svg, width, height);
    }

    container.appendChild(svg);
  }

  static drawVoltageDividerBias(svg, width, height) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(g);

    // BJT symbol (NPN)
    const bjtX = width / 2;
    const bjtY = height / 2;
    
    // Base line
    const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    baseLine.setAttribute('x1', bjtX - 30);
    baseLine.setAttribute('y1', bjtY);
    baseLine.setAttribute('x2', bjtX - 10);
    baseLine.setAttribute('y2', bjtY);
    baseLine.setAttribute('stroke', '#333');
    baseLine.setAttribute('stroke-width', '2');
    g.appendChild(baseLine);

    // Vertical line (base terminal)
    const baseTerminal = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    baseTerminal.setAttribute('x1', bjtX - 10);
    baseTerminal.setAttribute('y1', bjtY - 20);
    baseTerminal.setAttribute('x2', bjtX - 10);
    baseTerminal.setAttribute('y2', bjtY + 20);
    baseTerminal.setAttribute('stroke', '#333');
    baseTerminal.setAttribute('stroke-width', '3');
    g.appendChild(baseTerminal);

    // Collector line
    const collectorLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    collectorLine.setAttribute('x1', bjtX - 10);
    collectorLine.setAttribute('y1', bjtY - 20);
    collectorLine.setAttribute('x2', bjtX + 15);
    collectorLine.setAttribute('y2', bjtY - 35);
    collectorLine.setAttribute('stroke', '#333');
    collectorLine.setAttribute('stroke-width', '2');
    g.appendChild(collectorLine);

    // Emitter line
    const emitterLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    emitterLine.setAttribute('x1', bjtX - 10);
    emitterLine.setAttribute('y1', bjtY + 20);
    emitterLine.setAttribute('x2', bjtX + 15);
    emitterLine.setAttribute('y2', bjtY + 35);
    emitterLine.setAttribute('stroke', '#333');
    emitterLine.setAttribute('stroke-width', '2');
    g.appendChild(emitterLine);

    // Arrow for NPN
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    arrow.setAttribute('points', `${bjtX + 10},${bjtY + 30} ${bjtX + 15},${bjtY + 35} ${bjtX + 5},${bjtY + 35}`);
    arrow.setAttribute('fill', '#333');
    g.appendChild(arrow);

    // VCC supply line
    const vccLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vccLine.setAttribute('x1', bjtX + 15);
    vccLine.setAttribute('y1', 30);
    vccLine.setAttribute('x2', bjtX + 15);
    vccLine.setAttribute('y2', bjtY - 35);
    vccLine.setAttribute('stroke', '#333');
    vccLine.setAttribute('stroke-width', '2');
    g.appendChild(vccLine);

    // RC resistor
    this.drawResistor(g, bjtX + 15, 30, bjtX + 15, 80, 'RC');

    // R1 resistor (voltage divider top)
    this.drawResistor(g, bjtX - 80, 30, bjtX - 80, 80, 'R1');

    // R2 resistor (voltage divider bottom)
    this.drawResistor(g, bjtX - 80, 120, bjtX - 80, 170, 'R2');

    // RE resistor
    this.drawResistor(g, bjtX + 15, bjtY + 35, bjtX + 15, height - 50, 'RE');

    // Connection lines
    const connections = [
      // R1 to R2 junction to base
      { x1: bjtX - 80, y1: 120, x2: bjtX - 30, y2: 120 },
      { x1: bjtX - 30, y1: 120, x2: bjtX - 30, y2: bjtY },
      // VCC connections
      { x1: bjtX - 80, y1: 30, x2: bjtX + 15, y2: 30 },
      // Ground connections
      { x1: bjtX - 80, y1: 170, x2: bjtX + 15, y2: 170 },
      { x1: bjtX + 15, y1: height - 50, x2: bjtX + 15, y2: 170 }
    ];

    connections.forEach(conn => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', conn.x1);
      line.setAttribute('y1', conn.y1);
      line.setAttribute('x2', conn.x2);
      line.setAttribute('y2', conn.y2);
      line.setAttribute('stroke', '#333');
      line.setAttribute('stroke-width', '2');
      g.appendChild(line);
    });

    // Labels
    this.addLabel(g, bjtX - 30, bjtY - 10, 'B', '#333');
    this.addLabel(g, bjtX + 25, bjtY - 45, 'C', '#333');
    this.addLabel(g, bjtX + 25, bjtY + 45, 'E', '#333');
    this.addLabel(g, bjtX + 25, 15, 'VCC', '#333');
    this.addLabel(g, bjtX + 25, height - 30, 'GND', '#333');

    // Ground symbols
    this.drawGround(g, bjtX - 80, 170);
    this.drawGround(g, bjtX + 15, 170);

    // VCC symbol
    this.drawVccSymbol(g, bjtX + 15, 30);
  }

  static drawBaseResistorBias(svg, width, height) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(g);

    const bjtX = width / 2;
    const bjtY = height / 2;
    
    // Similar BJT drawing as above
    this.drawNPNTransistor(g, bjtX, bjtY);
    
    // RB resistor (base resistor)
    this.drawResistor(g, bjtX - 80, 30, bjtX - 80, bjtY, 'RB');
    
    // RC resistor
    this.drawResistor(g, bjtX + 15, 30, bjtX + 15, 80, 'RC');
    
    // RE resistor
    this.drawResistor(g, bjtX + 15, bjtY + 35, bjtX + 15, height - 50, 'RE');

    // Connection lines
    const connections = [
      // RB to base
      { x1: bjtX - 80, y1: bjtY, x2: bjtX - 30, y2: bjtY },
      // VCC connections
      { x1: bjtX - 80, y1: 30, x2: bjtX + 15, y2: 30 },
      // Ground connection
      { x1: bjtX + 15, y1: height - 50, x2: bjtX + 15, y2: height - 30 }
    ];

    connections.forEach(conn => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', conn.x1);
      line.setAttribute('y1', conn.y1);
      line.setAttribute('x2', conn.x2);
      line.setAttribute('y2', conn.y2);
      line.setAttribute('stroke', '#333');
      line.setAttribute('stroke-width', '2');
      g.appendChild(line);
    });

    // Labels and symbols
    this.addLabel(g, bjtX - 30, bjtY - 10, 'B', '#333');
    this.addLabel(g, bjtX + 25, bjtY - 45, 'C', '#333');
    this.addLabel(g, bjtX + 25, bjtY + 45, 'E', '#333');
    this.addLabel(g, bjtX + 25, 15, 'VCC', '#333');
    
    this.drawGround(g, bjtX + 15, height - 30);
    this.drawVccSymbol(g, bjtX + 15, 30);
  }

  static drawCollectorFeedbackBias(svg, width, height) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(g);

    const bjtX = width / 2;
    const bjtY = height / 2;
    
    this.drawNPNTransistor(g, bjtX, bjtY);
    
    // RB resistor (feedback from collector to base)
    this.drawResistor(g, bjtX - 50, bjtY - 60, bjtX - 50, bjtY - 10, 'RB');
    
    // RC resistor
    this.drawResistor(g, bjtX + 15, 30, bjtX + 15, 80, 'RC');

    // Feedback connection
    const feedbackLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    feedbackLine1.setAttribute('x1', bjtX + 15);
    feedbackLine1.setAttribute('y1', bjtY - 35);
    feedbackLine1.setAttribute('x2', bjtX - 50);
    feedbackLine1.setAttribute('y2', bjtY - 35);
    feedbackLine1.setAttribute('stroke', '#333');
    feedbackLine1.setAttribute('stroke-width', '2');
    g.appendChild(feedbackLine1);

    const feedbackLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    feedbackLine2.setAttribute('x1', bjtX - 50);
    feedbackLine2.setAttribute('y1', bjtY - 35);
    feedbackLine2.setAttribute('x2', bjtX - 50);
    feedbackLine2.setAttribute('y2', bjtY - 60);
    feedbackLine2.setAttribute('stroke', '#333');
    feedbackLine2.setAttribute('stroke-width', '2');
    g.appendChild(feedbackLine2);

    const feedbackLine3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    feedbackLine3.setAttribute('x1', bjtX - 50);
    feedbackLine3.setAttribute('y1', bjtY - 10);
    feedbackLine3.setAttribute('x2', bjtX - 30);
    feedbackLine3.setAttribute('y2', bjtY);
    feedbackLine3.setAttribute('stroke', '#333');
    feedbackLine3.setAttribute('stroke-width', '2');
    g.appendChild(feedbackLine3);

    // VCC and ground connections
    const vccLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vccLine.setAttribute('x1', bjtX + 15);
    vccLine.setAttribute('y1', 30);
    vccLine.setAttribute('x2', bjtX + 15);
    vccLine.setAttribute('y2', bjtY - 35);
    vccLine.setAttribute('stroke', '#333');
    vccLine.setAttribute('stroke-width', '2');
    g.appendChild(vccLine);

    const groundLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    groundLine.setAttribute('x1', bjtX + 15);
    groundLine.setAttribute('y1', bjtY + 35);
    groundLine.setAttribute('x2', bjtX + 15);
    groundLine.setAttribute('y2', height - 30);
    groundLine.setAttribute('stroke', '#333');
    groundLine.setAttribute('stroke-width', '2');
    g.appendChild(groundLine);

    // Labels and symbols
    this.addLabel(g, bjtX + 25, 15, 'VCC', '#333');
    this.drawGround(g, bjtX + 15, height - 30);
    this.drawVccSymbol(g, bjtX + 15, 30);
  }

  static drawEmitterBias(svg, width, height) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(g);

    const bjtX = width / 2;
    const bjtY = height / 2;
    
    this.drawNPNTransistor(g, bjtX, bjtY);
    
    // RC resistor
    this.drawResistor(g, bjtX + 15, 30, bjtX + 15, 80, 'RC');
    
    // RE resistor
    this.drawResistor(g, bjtX + 15, bjtY + 35, bjtX + 15, height - 70, 'RE');

    // Base to ground (direct connection)
    const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    baseLine.setAttribute('x1', bjtX - 30);
    baseLine.setAttribute('y1', bjtY);
    baseLine.setAttribute('x2', bjtX - 80);
    baseLine.setAttribute('y2', bjtY);
    baseLine.setAttribute('stroke', '#333');
    baseLine.setAttribute('stroke-width', '2');
    g.appendChild(baseLine);

    const baseGround = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    baseGround.setAttribute('x1', bjtX - 80);
    baseGround.setAttribute('y1', bjtY);
    baseGround.setAttribute('x2', bjtX - 80);
    baseGround.setAttribute('y2', height - 30);
    baseGround.setAttribute('stroke', '#333');
    baseGround.setAttribute('stroke-width', '2');
    g.appendChild(baseGround);

    // VCC and connections
    const vccLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vccLine.setAttribute('x1', bjtX + 15);
    vccLine.setAttribute('y1', 30);
    vccLine.setAttribute('x2', bjtX + 15);
    vccLine.setAttribute('y2', bjtY - 35);
    vccLine.setAttribute('stroke', '#333');
    vccLine.setAttribute('stroke-width', '2');
    g.appendChild(vccLine);

    // Emitter to negative supply
    const emitterSupply = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    emitterSupply.setAttribute('x1', bjtX + 15);
    emitterSupply.setAttribute('y1', height - 70);
    emitterSupply.setAttribute('x2', bjtX + 15);
    emitterSupply.setAttribute('y2', height - 30);
    emitterSupply.setAttribute('stroke', '#333');
    emitterSupply.setAttribute('stroke-width', '2');
    g.appendChild(emitterSupply);

    // Labels and symbols
    this.addLabel(g, bjtX + 25, 15, 'VCC', '#333');
    this.addLabel(g, bjtX + 25, height - 15, '-VEE', '#333');
    this.drawGround(g, bjtX - 80, height - 30);
    this.drawVccSymbol(g, bjtX + 15, 30);
  }

  static drawNPNTransistor(g, x, y) {
    // Base line
    const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    baseLine.setAttribute('x1', x - 30);
    baseLine.setAttribute('y1', y);
    baseLine.setAttribute('x2', x - 10);
    baseLine.setAttribute('y2', y);
    baseLine.setAttribute('stroke', '#333');
    baseLine.setAttribute('stroke-width', '2');
    g.appendChild(baseLine);

    // Vertical line (base terminal)
    const baseTerminal = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    baseTerminal.setAttribute('x1', x - 10);
    baseTerminal.setAttribute('y1', y - 20);
    baseTerminal.setAttribute('x2', x - 10);
    baseTerminal.setAttribute('y2', y + 20);
    baseTerminal.setAttribute('stroke', '#333');
    baseTerminal.setAttribute('stroke-width', '3');
    g.appendChild(baseTerminal);

    // Collector line
    const collectorLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    collectorLine.setAttribute('x1', x - 10);
    collectorLine.setAttribute('y1', y - 20);
    collectorLine.setAttribute('x2', x + 15);
    collectorLine.setAttribute('y2', y - 35);
    collectorLine.setAttribute('stroke', '#333');
    collectorLine.setAttribute('stroke-width', '2');
    g.appendChild(collectorLine);

    // Emitter line
    const emitterLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    emitterLine.setAttribute('x1', x - 10);
    emitterLine.setAttribute('y1', y + 20);
    emitterLine.setAttribute('x2', x + 15);
    emitterLine.setAttribute('y2', y + 35);
    emitterLine.setAttribute('stroke', '#333');
    emitterLine.setAttribute('stroke-width', '2');
    g.appendChild(emitterLine);

    // Arrow for NPN
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    arrow.setAttribute('points', `${x + 10},${y + 30} ${x + 15},${y + 35} ${x + 5},${y + 35}`);
    arrow.setAttribute('fill', '#333');
    g.appendChild(arrow);
  }

  static drawResistor(g, x1, y1, x2, y2, label) {
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    // Create resistor zigzag pattern
    const zigzag = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const zigzagLength = 40;
    const startX = x1 + (length - zigzagLength) / 2 * Math.cos(angle);
    const startY = y1 + (length - zigzagLength) / 2 * Math.sin(angle);
    
    let pathData = `M ${x1} ${y1} L ${startX} ${startY} `;
    
    // Create zigzag
    for (let i = 0; i < 6; i++) {
      const segmentLength = zigzagLength / 6;
      const segmentX = startX + i * segmentLength * Math.cos(angle);
      const segmentY = startY + i * segmentLength * Math.sin(angle);
      const offset = (i % 2 === 0) ? 8 : -8;
      const offsetX = segmentX + offset * Math.cos(angle + Math.PI / 2);
      const offsetY = segmentY + offset * Math.sin(angle + Math.PI / 2);
      pathData += `L ${offsetX} ${offsetY} `;
    }
    
    const endX = startX + zigzagLength * Math.cos(angle);
    const endY = startY + zigzagLength * Math.sin(angle);
    pathData += `L ${endX} ${endY} L ${x2} ${y2}`;
    
    zigzag.setAttribute('d', pathData);
    zigzag.setAttribute('stroke', '#333');
    zigzag.setAttribute('stroke-width', '2');
    zigzag.setAttribute('fill', 'none');
    g.appendChild(zigzag);
    
    // Add label
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    this.addLabel(g, midX + 15, midY - 5, label, '#333');
  }

  static drawGround(g, x, y) {
    // Ground symbol
    const lines = [
      { x1: x, y1: y, x2: x, y2: y + 15 },
      { x1: x - 15, y1: y + 15, x2: x + 15, y2: y + 15 },
      { x1: x - 10, y1: y + 20, x2: x + 10, y2: y + 20 },
      { x1: x - 5, y1: y + 25, x2: x + 5, y2: y + 25 }
    ];
    
    lines.forEach(line => {
      const groundLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      groundLine.setAttribute('x1', line.x1);
      groundLine.setAttribute('y1', line.y1);
      groundLine.setAttribute('x2', line.x2);
      groundLine.setAttribute('y2', line.y2);
      groundLine.setAttribute('stroke', '#333');
      groundLine.setAttribute('stroke-width', '2');
      g.appendChild(groundLine);
    });
  }

  static drawVccSymbol(g, x, y) {
    // VCC symbol (circle with + sign)
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y - 15);
    circle.setAttribute('r', '8');
    circle.setAttribute('stroke', '#333');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('fill', 'white');
    g.appendChild(circle);
    
    // Plus sign
    const plus1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    plus1.setAttribute('x1', x - 4);
    plus1.setAttribute('y1', y - 15);
    plus1.setAttribute('x2', x + 4);
    plus1.setAttribute('y2', y - 15);
    plus1.setAttribute('stroke', '#333');
    plus1.setAttribute('stroke-width', '2');
    g.appendChild(plus1);
    
    const plus2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    plus2.setAttribute('x1', x);
    plus2.setAttribute('y1', y - 19);
    plus2.setAttribute('x2', x);
    plus2.setAttribute('y2', y - 11);
    plus2.setAttribute('stroke', '#333');
    plus2.setAttribute('stroke-width', '2');
    g.appendChild(plus2);
  }

  static addLabel(g, x, y, text, color) {
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.textContent = text;
    label.setAttribute('x', x);
    label.setAttribute('y', y);
    label.setAttribute('fill', color);
    label.setAttribute('font-size', '12');
    label.setAttribute('font-weight', 'bold');
    label.setAttribute('text-anchor', 'middle');
    g.appendChild(label);
  }

  static renderOpAmpSchematic(containerId, type = 'inverting') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const existingSvg = container.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    const width = 400;
    const height = 250;
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
    svg.appendChild(g);

    // Draw op-amp triangle
    const opAmpX = width / 2;
    const opAmpY = height / 2;
    const triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    triangle.setAttribute('points', `${opAmpX - 40},${opAmpY - 30} ${opAmpX - 40},${opAmpY + 30} ${opAmpX + 40},${opAmpY}`);
    triangle.setAttribute('stroke', '#333');
    triangle.setAttribute('stroke-width', '3');
    triangle.setAttribute('fill', 'white');
    g.appendChild(triangle);

    // Input symbols
    this.addLabel(g, opAmpX - 25, opAmpY - 15, '−', '#333');
    this.addLabel(g, opAmpX - 25, opAmpY + 20, '+', '#333');

    // Input and output lines
    const inputLines = [
      { x1: opAmpX - 80, y1: opAmpY - 18, x2: opAmpX - 40, y2: opAmpY - 18 },
      { x1: opAmpX - 80, y1: opAmpY + 18, x2: opAmpX - 40, y2: opAmpY + 18 },
      { x1: opAmpX + 40, y1: opAmpY, x2: opAmpX + 80, y2: opAmpY }
    ];

    inputLines.forEach(line => {
      const inputLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      inputLine.setAttribute('x1', line.x1);
      inputLine.setAttribute('y1', line.y1);
      inputLine.setAttribute('x2', line.x2);
      inputLine.setAttribute('y2', line.y2);
      inputLine.setAttribute('stroke', '#333');
      inputLine.setAttribute('stroke-width', '2');
      g.appendChild(inputLine);
    });

    if (type === 'inverting') {
      // Feedback resistor
      this.drawResistor(g, opAmpX - 80, opAmpY - 18, opAmpX - 80, opAmpY - 60, 'Rin');
      this.drawResistor(g, opAmpX - 80, opAmpY - 60, opAmpX + 80, opAmpY - 60, 'Rf');
      
      // Feedback line
      const feedbackLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      feedbackLine.setAttribute('x1', opAmpX + 80);
      feedbackLine.setAttribute('y1', opAmpY);
      feedbackLine.setAttribute('x2', opAmpX + 80);
      feedbackLine.setAttribute('y2', opAmpY - 60);
      feedbackLine.setAttribute('stroke', '#333');
      feedbackLine.setAttribute('stroke-width', '2');
      g.appendChild(feedbackLine);

      // Ground connection for non-inverting input
      const groundLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      groundLine.setAttribute('x1', opAmpX - 80);
      groundLine.setAttribute('y1', opAmpY + 18);
      groundLine.setAttribute('x2', opAmpX - 80);
      groundLine.setAttribute('y2', opAmpY + 50);
      groundLine.setAttribute('stroke', '#333');
      groundLine.setAttribute('stroke-width', '2');
      g.appendChild(groundLine);

      this.drawGround(g, opAmpX - 80, opAmpY + 50);
    }

    // Labels
    this.addLabel(g, opAmpX - 120, opAmpY - 18, 'Vin', '#333');
    this.addLabel(g, opAmpX + 120, opAmpY, 'Vout', '#333');

    container.appendChild(svg);
  }
}

/* ======== BJT SOLVER ======== */
const BjtSolver = (() => {
  const biasTypes = {
    voltageDivider: 'Voltage Divider',
    baseResistor: 'Base Resistor',
    collectorFeedback: 'Collector Feedback',
    emitterBias: 'Emitter Bias'
  };

  const schema = (type) => {
    const common = [
      { name: 'VCC', label: 'Supply Voltage VCC', unit: 'V', default: 12 },
      { name: 'RC', label: 'Collector Resistor RC', unit: 'kΩ', default: 2.2 },
      { name: 'Beta', label: 'β (hFE)', unit: '', default: 100 }
    ];
    
    switch (type) {
      case 'voltageDivider':
        return [
          ...common,
          { name: 'R1', label: 'Divider R1', unit: 'kΩ', default: 10 },
          { name: 'R2', label: 'Divider R2', unit: 'kΩ', default: 2.2 },
          { name: 'RE', label: 'Emitter Resistor RE', unit: 'kΩ', default: 1 }
        ];
      case 'baseResistor':
        return [
          ...common,
          { name: 'RB', label: 'Base Resistor RB', unit: 'kΩ', default: 470 },
          { name: 'RE', label: 'Emitter Resistor RE', unit: 'kΩ', default: 1 }
        ];
      case 'collectorFeedback':
        return [
          ...common,
          { name: 'RB', label: 'Base Resistor RB', unit: 'kΩ', default: 100 }
        ];
      case 'emitterBias':
        return [
          ...common,
          { name: 'RE', label: 'Emitter Resistor RE', unit: 'kΩ', default: 1 }
        ];
      default:
        return common;
    }
  };

  const solveVoltageDivider = (inputs) => {
    const { VCC, R1, R2, RC, RE, Beta } = inputs;
    const VTH = VCC * (R2 / (R1 + R2));
    const RTH = (R1 * R2) / (R1 + R2);
    const IC = (VTH - 0.7) / (RE + RTH / Beta);
    const VCE = VCC - IC * (RC + RE);
    const IcSat = VCC / (RC + RE);

    return {
      results: {
        IC: `${IC.toFixed(3)} mA`,
        VCE: `${VCE.toFixed(2)} V`,
        VTH: `${VTH.toFixed(2)} V`,
        RTH: `${RTH.toFixed(2)} kΩ`
      },
      steps: [
        `Calculate Thevenin voltage: VTH = VCC × R2/(R1+R2) = ${VCC} × ${R2}/(${R1}+${R2}) = ${VTH.toFixed(2)} V`,
        `Calculate Thevenin resistance: RTH = R1||R2 = (${R1}×${R2})/(${R1}+${R2}) = ${RTH.toFixed(2)} kΩ`,
        `Calculate collector current: IC = (VTH-0.7)/(RE+RTH/β) = (${VTH.toFixed(2)}-0.7)/(${RE}+${RTH.toFixed(2)}/${Beta}) = ${IC.toFixed(3)} mA`,
        `Calculate collector-emitter voltage: VCE = VCC - IC×(RC+RE) = ${VCC} - ${IC.toFixed(3)}×(${RC}+${RE}) = ${VCE.toFixed(2)} V`,
        `Operating point Q(${VCE.toFixed(2)} V, ${IC.toFixed(3)} mA) is in the active region`
      ],
      loadLine: {
        IcSat: IcSat,
        VceCutoff: VCC,
        qPoint: { IC, VCE }
      }
    };
  };

  const solveBaseResistor = (inputs) => {
    const { VCC, RB, RC, RE, Beta } = inputs;
    const IB = (VCC - 0.7) / (RB * 1000);
    const IC = Beta * IB * 1000;
    const VCE = VCC - IC * (RC + RE);
    const IcSat = VCC / (RC + RE);

    return {
      results: {
        IB: `${(IB * 1000).toFixed(3)} mA`,
        IC: `${IC.toFixed(3)} mA`,
        VCE: `${VCE.toFixed(2)} V`
      },
      steps: [
        `Calculate base current: IB = (VCC-0.7)/RB = (${VCC}-0.7)/${RB} = ${(IB * 1000).toFixed(3)} mA`,
        `Calculate collector current: IC = β×IB = ${Beta}×${(IB * 1000).toFixed(3)} = ${IC.toFixed(3)} mA`,
        `Calculate collector-emitter voltage: VCE = VCC - IC×(RC+RE) = ${VCC} - ${IC.toFixed(3)}×(${RC}+${RE}) = ${VCE.toFixed(2)} V`,
        `Operating point Q(${VCE.toFixed(2)} V, ${IC.toFixed(3)} mA) is in the active region`
      ],
      loadLine: {
        IcSat: IcSat,
        VceCutoff: VCC,
        qPoint: { IC, VCE }
      }
    };
  };

  const solve = (type, inputs) => {
    switch (type) {
      case 'voltageDivider':
        return solveVoltageDivider(inputs);
      case 'baseResistor':
        return solveBaseResistor(inputs);
      case 'collectorFeedback':
        return solveVoltageDivider(inputs);
      case 'emitterBias':
        return solveVoltageDivider(inputs);
      default:
        return solveVoltageDivider(inputs);
    }
  };

  return { biasTypes, schema, solve };
})();

/* ======== ENHANCED SVG RENDERER ======== */
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
