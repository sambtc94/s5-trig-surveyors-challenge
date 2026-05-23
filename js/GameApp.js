import { QuestionService } from './QuestionService.js';
import { SceneRenderer } from './SceneRenderer.js';

export class GameApp {
  constructor() {
    this.questionTypeBadge = document.getElementById('questionTypeBadge');
    this.sceneTypeBadge = document.getElementById('sceneTypeBadge');
    this.ratioBadge = document.getElementById('ratioBadge');
    this.questionsBadge = document.getElementById('questionsBadge');
    this.firstTryBadge = document.getElementById('firstTryBadge');
    this.streakBadge = document.getElementById('streakBadge');
    this.pointsBadge = document.getElementById('pointsBadge');
    this.questionPrompt = document.getElementById('questionPrompt');
    this.answerInput = document.getElementById('answerInput');
    this.checkBtn = document.getElementById('checkBtn');
    this.feedback = document.getElementById('feedback');
    this.nextBtn = document.getElementById('nextBtn');
    this.tryAgainBtn = document.getElementById('tryAgainBtn');
    this.depressionNote = document.getElementById('depressionNote');
    this.drawLabelSection = document.getElementById('drawLabelSection');
    this.drawInstruction = document.getElementById('drawInstruction');
    this.controls = document.querySelector('.controls');

    this.labelAngle = document.getElementById('labelAngle');
    this.labelOpp = document.getElementById('labelOpp');
    this.labelAdj = document.getElementById('labelAdj');
    this.labelHyp = document.getElementById('labelHyp');

    this.questionService = new QuestionService();
    const canvas = document.getElementById('sceneCanvas');
    this.renderer = new SceneRenderer(canvas, this.questionService);

    this.state = {
      questionsAnswered: 0,
      correctFirstAttempt: 0,
      currentStreak: 0,
      points: 0,
      currentQuestion: null
    };
  }

  updateBadges() {
    const q = this.state.currentQuestion;
    this.questionTypeBadge.textContent = `Question Type: ${this.questionService.getTypeLabel(q.type)}`;
    this.sceneTypeBadge.textContent = `Scene: ${q.sceneType === 'ELEVATION' ? 'Elevation' : 'Depression'}`;
    this.ratioBadge.textContent = `Trig Ratio: ${q.ratio}`;
    this.questionsBadge.textContent = `Questions: ${this.state.questionsAnswered}`;
    this.firstTryBadge.textContent = `First Try Correct: ${this.state.correctFirstAttempt}`;
    this.streakBadge.textContent = `Streak: ${this.state.currentStreak}`;
    this.pointsBadge.textContent = `Points: ${this.state.points}`;
    this.questionPrompt.textContent = this.questionService.getQuestionPrompt(q);
  }

  resetRoundUI() {
    this.feedback.style.display = 'none';
    this.feedback.innerHTML = '';
    this.nextBtn.style.display = 'none';
    this.tryAgainBtn.style.display = 'none';
    this.depressionNote.style.display = 'none';
    this.answerInput.value = '';

    const isDrawAndLabel = this.state.currentQuestion && this.state.currentQuestion.type === 'DRAW_AND_LABEL';
    this.drawLabelSection.style.display = isDrawAndLabel ? 'block' : 'none';
    this.controls.style.display = isDrawAndLabel ? 'none' : 'grid';
    this.checkBtn.textContent = isDrawAndLabel ? 'Check Labels' : 'Check Answer';

    if (isDrawAndLabel) {
      this.labelAngle.value = '';
      this.labelOpp.value = '';
      this.labelAdj.value = '';
      this.labelHyp.value = '';
      this.drawInstruction.textContent = 'Click to place 3 corners of your right-angle triangle on the canvas above';
    }
  }

  render() {
    this.updateBadges();
    this.renderer.drawScene(this.state.currentQuestion);
    this.resetRoundUI();
  }

  isAnswerCorrect(userAnswer, expected, type) {
    if (type === 'ANGLE_FROM_SIDES') {
      return Math.abs(userAnswer - expected) <= 0.2;
    }
    return Math.abs(userAnswer - expected) <= 0.5;
  }

  showFeedback(correct, extraMessage = '') {
    const q = this.state.currentQuestion;
    const answerText = q.unknown === 'angle' ? `${q.answer.toFixed(1)}°` : `${q.answer} m`;
    this.feedback.style.display = 'block';

    if (correct) {
      this.feedback.innerHTML = `<div class="success">✔ Well done!</div>
          <div>Your answer is correct.</div>
          <div><strong>Answer:</strong> ${answerText}${extraMessage ? `<br>${extraMessage}` : ''}</div>`;
      this.nextBtn.style.display = 'inline-block';
      this.tryAgainBtn.style.display = 'none';
    } else {
      this.feedback.innerHTML = `<div class="error">✖ Not quite.</div>
          <div>Full worked solution:</div>
          <div>${this.questionService.workedSolution(q)}</div>`;
      this.nextBtn.style.display = 'inline-block';
      this.tryAgainBtn.style.display = 'inline-block';
    }

    if (q.sceneType === 'DEPRESSION') {
      this.depressionNote.style.display = 'block';
    }

    this.updateBadges();
  }

  handleMathCheck() {
    const q = this.state.currentQuestion;
    const value = parseFloat(this.answerInput.value);

    if (Number.isNaN(value)) {
      this.showFeedback(false, 'Please enter a number.');
      return;
    }

    const correct = this.isAnswerCorrect(value, q.answer, q.type);

    if (q.attempts === 0) {
      this.state.questionsAnswered += 1;
      if (correct) {
        this.state.correctFirstAttempt += 1;
      }
    }
    q.attempts += 1;

    if (correct) {
      this.state.points += q.attempts === 1 ? 10 : 5;
      this.state.currentStreak += 1;
      this.showFeedback(true);
    } else {
      this.state.points = Math.max(0, this.state.points - 2);
      this.state.currentStreak = 0;
      this.showFeedback(false);
    }
  }

  parseDrawField(value) {
    return value.trim().replace(/[°m\s]/g, '').toLowerCase();
  }

  checkDrawAndLabel() {
    const q = this.state.currentQuestion;
    const shown = this.questionService.getShownLabels(q);

    const rawAngle = this.parseDrawField(this.labelAngle.value);
    const rawOpp = this.parseDrawField(this.labelOpp.value);
    const rawAdj = this.parseDrawField(this.labelAdj.value);
    const rawHyp = this.parseDrawField(this.labelHyp.value);

    const checkGiven = (raw, expected) => {
      const num = parseFloat(raw);
      return !Number.isNaN(num) && Math.abs(num - expected) <= 0.5;
    };

    const checkUnknown = (raw) => raw === '?';

    const errors = [];
    if (shown.angle) {
      if (!checkGiven(rawAngle, q.theta)) errors.push(`Angle should be ${q.theta}°`);
    } else if (!checkUnknown(rawAngle)) {
      errors.push('Unknown angle should be labeled "?"');
    }

    if (shown.adj) {
      if (!checkGiven(rawAdj, q.adjacent)) errors.push(`Adjacent side should be ${q.adjacent} m`);
    } else if (q.unknown === 'adjacent' && !checkUnknown(rawAdj)) {
      errors.push('Unknown adjacent side should be labeled "?"');
    }

    if (shown.opp) {
      if (!checkGiven(rawOpp, q.opposite)) errors.push(`Opposite side should be ${q.opposite} m`);
    } else if (q.unknown === 'opposite' && !checkUnknown(rawOpp)) {
      errors.push('Unknown opposite side should be labeled "?"');
    }

    if (shown.hyp) {
      if (!checkGiven(rawHyp, q.hypotenuse)) errors.push(`Hypotenuse should be ${q.hypotenuse} m`);
    } else if (q.unknown === 'hypotenuse' && !checkUnknown(rawHyp)) {
      errors.push('Unknown hypotenuse should be labeled "?"');
    }

    const correct = errors.length === 0;

    if (q.attempts === 0) {
      this.state.questionsAnswered += 1;
      if (correct) this.state.correctFirstAttempt += 1;
    }
    q.attempts += 1;

    this.feedback.style.display = 'block';
    if (correct) {
      this.state.points += q.attempts === 1 ? 10 : 5;
      this.state.currentStreak += 1;
      this.feedback.innerHTML = `<div class="success">✔ Well done! Your diagram labels are correct.</div>
          <div>${this.questionService.workedSolutionDrawAndLabel(q)}</div>`;
      this.nextBtn.style.display = 'inline-block';
      this.tryAgainBtn.style.display = 'none';
    } else {
      this.state.points = Math.max(0, this.state.points - 2);
      this.state.currentStreak = 0;
      this.feedback.innerHTML = `<div class="error">✖ Not quite. Check your labels:</div>
          <div>${errors.map((e) => `• ${e}`).join('<br>')}</div>
          <div style="margin-top:6px;">${this.questionService.workedSolutionDrawAndLabel(q)}</div>`;
      this.nextBtn.style.display = 'inline-block';
      this.tryAgainBtn.style.display = 'inline-block';
    }
    this.updateBadges();
  }

  handleCheck() {
    const q = this.state.currentQuestion;
    if (q.type === 'DRAW_AND_LABEL') {
      this.checkDrawAndLabel();
      return;
    }
    this.handleMathCheck();
  }

  createAndRenderQuestion() {
    this.state.currentQuestion = this.questionService.createQuestion();
    this.renderer.resetDrawState();
    this.render();
  }

  bindEvents() {
    this.checkBtn.addEventListener('click', () => this.handleCheck());

    this.tryAgainBtn.addEventListener('click', () => {
      this.feedback.style.display = 'none';
      this.tryAgainBtn.style.display = 'none';
      this.nextBtn.style.display = 'none';
      if (this.state.currentQuestion && this.state.currentQuestion.type !== 'DRAW_AND_LABEL') {
        this.answerInput.focus();
      }
    });

    this.nextBtn.addEventListener('click', () => {
      this.createAndRenderQuestion();
    });

    this.renderer.canvas.addEventListener('click', (event) => {
      const changed = this.renderer.handleCanvasClick(event, this.state.currentQuestion);
      if (!changed) return;

      if (this.renderer.drawState.phase === 'done') {
        this.drawInstruction.textContent = '✔ Triangle drawn! Fill in the labels below, then click Check Labels.';
      }
      this.renderer.drawScene(this.state.currentQuestion);
    });
  }

  start() {
    this.bindEvents();
    this.createAndRenderQuestion();
  }
}
