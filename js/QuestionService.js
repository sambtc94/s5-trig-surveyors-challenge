export class QuestionService {
  constructor() {
    this.questionTypes = [
      'HEIGHT_FROM_ADJ_ANGLE',
      'DIST_FROM_OPP_ANGLE',
      'ANGLE_FROM_SIDES',
      'HYP_FROM_OPP_ANGLE',
      'HYP_FROM_ADJ_ANGLE',
      'HEIGHT_FROM_HYP_ANGLE',
      'DIST_FROM_HYP_ANGLE',
      'DRAW_AND_LABEL'
    ];

    this.triples = [
      [3, 4, 5],
      [5, 12, 13],
      [8, 15, 17],
      [7, 24, 25],
      [9, 40, 41]
    ];

    this.nextQuestionIndex = this.randInt(0, this.questionTypes.length - 1);
  }

  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  roundTo1dp(value) {
    return Math.round(value * 10) / 10;
  }

  nextQuestionType() {
    const type = this.questionTypes[this.nextQuestionIndex];
    this.nextQuestionIndex = (this.nextQuestionIndex + 1) % this.questionTypes.length;
    return type;
  }

  createQuestion() {
    const sceneType = Math.random() < 0.5 ? 'ELEVATION' : 'DEPRESSION';
    const type = this.nextQuestionType();

    const underlyingTypes = this.questionTypes.filter((t) => t !== 'DRAW_AND_LABEL');
    const isDrawAndLabel = type === 'DRAW_AND_LABEL';
    const mathType = isDrawAndLabel
      ? underlyingTypes[this.randInt(0, underlyingTypes.length - 1)]
      : type;

    const [a, b, c] = this.triples[this.randInt(0, this.triples.length - 1)];
    const scale = this.randInt(4, 10);
    const swapLegs = Math.random() < 0.5;
    const adjacent = (swapLegs ? b : a) * scale;
    const opposite = (swapLegs ? a : b) * scale;
    const hypotenuse = c * scale;
    const theta = this.roundTo1dp(Math.atan(opposite / adjacent) * 180 / Math.PI);

    let answer;
    let unknown;
    let ratio;
    let solveText = '';
    let prompt = '';

    if (mathType === 'HEIGHT_FROM_ADJ_ANGLE') {
      answer = opposite;
      unknown = 'opposite';
      ratio = 'tan';
      solveText = `${adjacent} × tan(${theta}°) = ${answer} m`;
      prompt = sceneType === 'ELEVATION'
        ? `A surveyor is ${adjacent} m from a tower and measures an angle of elevation of ${theta}°. Find the tower height.`
        : `From a lookout point, a surveyor measures an angle of depression of ${theta}° to a target. The horizontal distance is ${adjacent} m. Find the vertical drop.`;
    } else if (mathType === 'DIST_FROM_OPP_ANGLE') {
      answer = adjacent;
      unknown = 'adjacent';
      ratio = 'tan';
      solveText = `${opposite} ÷ tan(${theta}°) = ${answer} m`;
      prompt = sceneType === 'ELEVATION'
        ? `A surveyor measures an angle of elevation of ${theta}° to the top of a structure. The structure is ${opposite} m high. How far is the surveyor from the base?`
        : `A lookout station is ${opposite} m above sea level. A boat is seen at an angle of depression of ${theta}°. How far is the boat horizontally from the station?`;
    } else if (mathType === 'ANGLE_FROM_SIDES') {
      answer = theta;
      unknown = 'angle';
      ratio = 'tan';
      solveText = `tan⁻¹(${opposite} ÷ ${adjacent}) = ${answer.toFixed(1)}°`;
      prompt = sceneType === 'ELEVATION'
        ? `A surveyor is ${adjacent} m from a building and the top is ${opposite} m above eye level. Find the angle of elevation.`
        : `From a cliff lookout, the target is ${adjacent} m away horizontally and ${opposite} m below. Find the angle of depression.`;
    } else if (mathType === 'HYP_FROM_OPP_ANGLE') {
      answer = hypotenuse;
      unknown = 'hypotenuse';
      ratio = 'sin';
      solveText = `${opposite} ÷ sin(${theta}°) = ${answer} m`;
      prompt = sceneType === 'ELEVATION'
        ? `A surveyor measures an angle of elevation of ${theta}° and knows the height difference is ${opposite} m. Find the line-of-sight distance.`
        : `A lookout measures an angle of depression of ${theta}° to a point ${opposite} m below. Find the line-of-sight distance.`;
    } else if (mathType === 'HYP_FROM_ADJ_ANGLE') {
      answer = hypotenuse;
      unknown = 'hypotenuse';
      ratio = 'cos';
      solveText = `${adjacent} ÷ cos(${theta}°) = ${answer} m`;
      prompt = sceneType === 'ELEVATION'
        ? `A surveyor stands ${adjacent} m from a tower and measures an angle of elevation of ${theta}°. Find the line-of-sight distance to the top.`
        : `A lookout sees a target at an angle of depression of ${theta}° with a horizontal distance of ${adjacent} m. Find the line-of-sight distance.`;
    } else if (mathType === 'HEIGHT_FROM_HYP_ANGLE') {
      answer = opposite;
      unknown = 'opposite';
      ratio = 'sin';
      solveText = `${hypotenuse} × sin(${theta}°) = ${answer} m`;
      prompt = sceneType === 'ELEVATION'
        ? `A surveyor measures an angle of elevation of ${theta}° and a line-of-sight distance of ${hypotenuse} m. Find the height difference.`
        : `A lookout has a line of sight of ${hypotenuse} m to a target at an angle of depression of ${theta}°. Find the vertical drop.`;
    } else {
      answer = adjacent;
      unknown = 'adjacent';
      ratio = 'cos';
      solveText = `${hypotenuse} × cos(${theta}°) = ${answer} m`;
      prompt = sceneType === 'ELEVATION'
        ? `A surveyor measures an angle of elevation of ${theta}° and a line-of-sight distance of ${hypotenuse} m. Find the horizontal distance to the base.`
        : `A lookout has a line-of-sight distance of ${hypotenuse} m to a target at an angle of depression of ${theta}°. Find the horizontal distance.`;
    }

    return {
      sceneType,
      adjacent,
      opposite,
      hypotenuse,
      theta,
      type,
      mathType,
      ratio,
      unknown,
      solveText,
      prompt,
      answer,
      attempts: 0
    };
  }

  getTypeLabel(type) {
    if (type === 'DRAW_AND_LABEL') return 'Draw & Label';
    if (type === 'HEIGHT_FROM_ADJ_ANGLE' || type === 'HEIGHT_FROM_HYP_ANGLE') return 'Find Height';
    if (type === 'DIST_FROM_OPP_ANGLE' || type === 'DIST_FROM_HYP_ANGLE') return 'Find Distance';
    if (type === 'ANGLE_FROM_SIDES') return 'Find Angle';
    return 'Find Line-of-Sight';
  }

  getQuestionPrompt(q) {
    if (q.type === 'DRAW_AND_LABEL') {
      return `📐 Draw a diagram: ${q.prompt}`;
    }
    return q.prompt;
  }

  workedSolution(q) {
    const valueText = q.unknown === 'angle' ? `${q.answer.toFixed(1)}°` : `${q.answer} m`;
    return [
      `Step 1: Use <strong>${q.ratio}</strong> for this relationship.`,
      `Step 2: Compute: ${q.solveText}`,
      `<strong>Answer: ${valueText}</strong>`
    ].join('<br>');
  }

  getShownLabels(q) {
    const t = q.mathType || q.type;
    return {
      angle: t !== 'ANGLE_FROM_SIDES',
      adj: t === 'HEIGHT_FROM_ADJ_ANGLE' || t === 'HYP_FROM_ADJ_ANGLE' || t === 'ANGLE_FROM_SIDES',
      opp: t === 'DIST_FROM_OPP_ANGLE' || t === 'HYP_FROM_OPP_ANGLE' || t === 'ANGLE_FROM_SIDES',
      hyp: t === 'HEIGHT_FROM_HYP_ANGLE' || t === 'DIST_FROM_HYP_ANGLE'
    };
  }

  workedSolutionDrawAndLabel(q) {
    const shown = this.getShownLabels(q);
    const lines = ['<strong>Correct labels for your diagram:</strong>'];
    if (shown.angle) lines.push(`θ (angle) = ${q.theta}°`);
    if (shown.adj) lines.push(`Adjacent (horizontal) = ${q.adjacent} m`);
    if (shown.opp) lines.push(`Opposite (vertical) = ${q.opposite} m`);
    if (shown.hyp) lines.push(`Hypotenuse (line-of-sight) = ${q.hypotenuse} m`);
    lines.push(`Unknown (${q.unknown}) → marked with "?"`);
    lines.push(`<br>Then solve: ${q.solveText}`);
    return lines.join('<br>');
  }
}
