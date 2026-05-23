export class SceneRenderer {
  constructor(canvas, questionService) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.questionService = questionService;
    this.drawState = {
      points: [],
      rightAngleIdx: -1,
      phase: 'placing'
    };
  }

  resetDrawState() {
    this.drawState.points = [];
    this.drawState.rightAngleIdx = -1;
    this.drawState.phase = 'placing';
  }

  drawArc(cx, cy, start, end, radius) {
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, start, end);
    this.ctx.stroke();
  }

  drawTextWithHalo(text, x, y, color) {
    this.ctx.save();
    this.ctx.font = 'bold 18px Arial';
    const padX = 6;
    const width = this.ctx.measureText(text).width + padX * 2;
    this.ctx.fillStyle = 'rgba(255,255,255,0.92)';
    this.ctx.fillRect(x - padX, y - 16, width, 22);
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  drawSurveyorSprite(footX, footY, scale = 1, facing = 'right') {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(footX, footY);
    ctx.scale(facing === 'left' ? -1 : 1, 1);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.20)';
    ctx.beginPath();
    ctx.ellipse(0, 2 * scale, 14 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1f2937';
    ctx.fillRect(-8 * scale, -12 * scale, 5 * scale, 12 * scale);
    ctx.fillRect(3 * scale, -12 * scale, 5 * scale, 12 * scale);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-10 * scale, -1 * scale, 8 * scale, 3 * scale);
    ctx.fillRect(2 * scale, -1 * scale, 8 * scale, 3 * scale);

    const jacketGrad = ctx.createLinearGradient(0, -24 * scale, 0, -10 * scale);
    jacketGrad.addColorStop(0, '#0f4c81');
    jacketGrad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = jacketGrad;
    ctx.fillRect(-10 * scale, -26 * scale, 20 * scale, 16 * scale);

    ctx.fillStyle = '#facc15';
    ctx.fillRect(-3 * scale, -25 * scale, 6 * scale, 14 * scale);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-3 * scale, -20 * scale, 6 * scale, 1.8 * scale);

    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(-16 * scale, -24 * scale, 7 * scale, 4 * scale);
    ctx.fillRect(9 * scale, -23 * scale, 8 * scale, 4 * scale);

    ctx.fillStyle = '#f1c27d';
    ctx.beginPath();
    ctx.arc(0, -32 * scale, 6.5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, -35 * scale, 7.2 * scale, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-7 * scale, -35 * scale, 14 * scale, 2.2 * scale);

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-2 * scale, -32 * scale, 0.8 * scale, 0, Math.PI * 2);
    ctx.arc(2 * scale, -32 * scale, 0.8 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.6 * scale;
    ctx.beginPath();
    ctx.moveTo(16 * scale, -18 * scale);
    ctx.lineTo(14 * scale, 0);
    ctx.moveTo(16 * scale, -18 * scale);
    ctx.lineTo(19 * scale, 0);
    ctx.moveTo(16 * scale, -18 * scale);
    ctx.lineTo(12 * scale, 0);
    ctx.stroke();

    const scopeGrad = ctx.createLinearGradient(9 * scale, -24 * scale, 20 * scale, -20 * scale);
    scopeGrad.addColorStop(0, '#334155');
    scopeGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = scopeGrad;
    ctx.fillRect(8 * scale, -24 * scale, 12 * scale, 4.5 * scale);

    ctx.strokeStyle = '#0b1220';
    ctx.lineWidth = 1.2 * scale;
    ctx.strokeRect(8.4 * scale, -23.6 * scale, 11.2 * scale, 3.7 * scale);
    ctx.restore();
  }

  drawTargetSprite(x, y, scale = 1) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 8 * scale, 22 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    const floatGrad = ctx.createLinearGradient(0, -6 * scale, 0, 10 * scale);
    floatGrad.addColorStop(0, '#fb923c');
    floatGrad.addColorStop(1, '#ea580c');
    ctx.fillStyle = floatGrad;
    ctx.beginPath();
    ctx.ellipse(0, 4 * scale, 20 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(0, -20 * scale);
    ctx.lineTo(0, 2 * scale);
    ctx.stroke();

    const flagGrad = ctx.createLinearGradient(0, -20 * scale, 16 * scale, -12 * scale);
    flagGrad.addColorStop(0, '#2563eb');
    flagGrad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = flagGrad;
    ctx.beginPath();
    ctx.moveTo(0, -20 * scale);
    ctx.lineTo(16 * scale, -16 * scale);
    ctx.lineTo(0, -12 * scale);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(0, -2 * scale, 6 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.arc(0, -2 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 1.3 * scale;
    ctx.beginPath();
    ctx.ellipse(0, 4 * scale, 20 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  normalize(dx, dy, len) {
    const mag = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: (dx / mag) * len, y: (dy / mag) * len };
  }

  drawDrawingCanvas() {
    const ctx = this.ctx;
    const pts = this.drawState.points;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const gridStep = 40;
    for (let x = 0; x <= this.canvas.width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= this.canvas.height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }

    if (pts.length >= 2) {
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 3;
      for (let i = 0; i < pts.length - 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
        ctx.stroke();
      }
      if (pts.length === 3) {
        ctx.beginPath();
        ctx.moveTo(pts[2].x, pts[2].y);
        ctx.lineTo(pts[0].x, pts[0].y);
        ctx.stroke();
      }
    }

    if (this.drawState.rightAngleIdx >= 0) {
      const p = pts[this.drawState.rightAngleIdx];
      const prev = pts[(this.drawState.rightAngleIdx + 2) % 3];
      const next = pts[(this.drawState.rightAngleIdx + 1) % 3];
      const size = 18;
      const vPrev = this.normalize(prev.x - p.x, prev.y - p.y, size);
      const vNext = this.normalize(next.x - p.x, next.y - p.y, size);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x + vPrev.x, p.y + vPrev.y);
      ctx.lineTo(p.x + vPrev.x + vNext.x, p.y + vPrev.y + vNext.y);
      ctx.lineTo(p.x + vNext.x, p.y + vNext.y);
      ctx.stroke();
    }

    pts.forEach((p, i) => {
      ctx.fillStyle = i === this.drawState.rightAngleIdx ? '#15803d' : '#2563eb';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    let instruction = '';
    if (this.drawState.phase === 'placing') {
      instruction = pts.length === 0
        ? 'Click to place corner 1 (surveyor position)'
        : pts.length === 1
          ? 'Click to place corner 2'
          : 'Click to place corner 3 — close your triangle';
    } else if (this.drawState.phase === 'marking') {
      instruction = 'Click near a corner to mark the right angle (∟)';
    } else {
      instruction = '✔ Triangle drawn! Fill in the labels below, then click Check Labels.';
    }

    ctx.save();
    ctx.font = 'bold 15px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    const tw = ctx.measureText(instruction).width + 20;
    ctx.fillRect((this.canvas.width - tw) / 2, 10, tw, 28);
    ctx.fillStyle = '#0f3e67';
    ctx.textAlign = 'center';
    ctx.fillText(instruction, this.canvas.width / 2, 29);
    ctx.restore();
  }

  drawScene(question) {
    if (question.type === 'DRAW_AND_LABEL') {
      this.drawDrawingCanvas();
      return;
    }

    const shown = this.questionService.getShownLabels(question);
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#0f172a';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px Arial';

    const leftX = 80;
    const rightX = 470;
    const groundY = 280;

    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#dbeafe');
    sky.addColorStop(1, '#f0f9ff');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.canvas.width, groundY);
    ctx.fillStyle = '#d1fae5';
    ctx.fillRect(0, groundY, this.canvas.width, this.canvas.height - groundY);

    ctx.beginPath();
    ctx.moveTo(20, groundY);
    ctx.lineTo(580, groundY);
    ctx.strokeStyle = '#14532d';
    ctx.stroke();

    if (question.sceneType === 'ELEVATION') {
      const observer = { x: leftX, y: groundY };
      const top = { x: rightX, y: 110 };

      this.drawSurveyorSprite(observer.x - 2, observer.y + 2, 1, 'right');

      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(observer.x, observer.y);
      ctx.lineTo(rightX, observer.y);
      ctx.strokeStyle = '#64748b';
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(rightX, groundY);
      ctx.lineTo(rightX, top.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(observer.x, observer.y);
      ctx.lineTo(top.x, top.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(rightX - 20, groundY);
      ctx.lineTo(rightX - 20, groundY - 20);
      ctx.lineTo(rightX, groundY - 20);
      ctx.stroke();

      this.drawArc(observer.x, observer.y, -0.45, 0, 28);
      if (shown.adj) ctx.fillText(`${question.adjacent} m`, (observer.x + rightX) / 2 - 30, observer.y + 24);
      if (shown.opp) ctx.fillText(`${question.opposite} m`, rightX + 12, (groundY + top.y) / 2);
      if (shown.angle) this.drawTextWithHalo(`${question.theta}°`, observer.x + 42, observer.y - 34, '#1d4ed8');
      if (shown.hyp) this.drawTextWithHalo(`${question.hypotenuse} m`, (observer.x + top.x) / 2 - 24, (observer.y + top.y) / 2 - 8, '#1d4ed8');
    } else {
      const observer = { x: leftX, y: 95 };
      const target = { x: rightX, y: groundY };
      const buildingTopY = observer.y + 18;

      ctx.beginPath();
      ctx.moveTo(40, groundY);
      ctx.lineTo(130, groundY);
      ctx.lineTo(130, buildingTopY);
      ctx.lineTo(40, buildingTopY);
      ctx.closePath();
      ctx.fillStyle = '#cbd5e1';
      ctx.fill();

      this.drawSurveyorSprite(observer.x, buildingTopY, 0.95, 'right');

      ctx.strokeStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(observer.x, observer.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();

      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(observer.x, observer.y);
      ctx.lineTo(target.x, observer.y);
      ctx.strokeStyle = '#64748b';
      ctx.stroke();
      ctx.setLineDash([]);

      this.drawTargetSprite(target.x, target.y, 1);
      this.drawArc(observer.x, observer.y, 0, 0.45, 28);
      this.drawArc(target.x, target.y, -Math.PI + 0.12, -Math.PI + 0.55, 22);

      ctx.fillStyle = '#1d4ed8';
      if (shown.adj) ctx.fillText(`${question.adjacent} m`, (observer.x + target.x) / 2 - 30, groundY + 24);
      if (shown.opp) ctx.fillText(`${question.opposite} m`, observer.x - 62, (observer.y + groundY) / 2);
      if (shown.angle) this.drawTextWithHalo(`${question.theta}°`, observer.x + 44, observer.y + 40, '#1d4ed8');
      if (shown.hyp) this.drawTextWithHalo(`${question.hypotenuse} m`, (observer.x + target.x) / 2 - 20, (observer.y + target.y) / 2 + 8, '#1d4ed8');
    }
  }

  handleCanvasClick(event, currentQuestion) {
    if (!currentQuestion || currentQuestion.type !== 'DRAW_AND_LABEL') return false;
    if (this.drawState.phase === 'done') return false;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    if (this.drawState.phase === 'placing') {
      this.drawState.points.push({ x, y });
      if (this.drawState.points.length === 3) {
        this.drawState.phase = 'marking';
      }
    } else if (this.drawState.phase === 'marking') {
      let minDist = Infinity;
      let minIdx = 0;
      this.drawState.points.forEach((p, i) => {
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < minDist) {
          minDist = d;
          minIdx = i;
        }
      });
      this.drawState.rightAngleIdx = minIdx;
      this.drawState.phase = 'done';
    }

    return true;
  }
}
