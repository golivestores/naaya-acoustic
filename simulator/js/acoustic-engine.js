/* =============================================
   NAAYA Acoustic Engine — v1 (Sabine-based)
   Public API:
     calculate(inputs) -> report
   This module is the ONLY part that will be replaced
   when the proprietary engine is ready. Keep this contract stable.
   ============================================= */

/* INPUT SHAPE
{
  projectName: 'Hall A',
  functionId: 'auditorium',
  dimensions: { length: 20, width: 15, height: 8 },   // meters
  materials: {
    ceiling:  'mineral-wool',
    walls:    'fabric-wrapped',
    floor:    'nylon-carpet',
    furniture:'auditorium-seating'
  },
  furnitureCoverage: 0.3   // 0-1, fraction of floor area covered by seating
}
*/

/* REPORT SHAPE
{
  volume, totalSurface,
  rt60ByBand:    { 125: 2.8, 250: 1.9, ... },
  rt60Avg:       2.1,    // mid-freq (500+1k)/2
  rt60Target:    0.8,
  rt60TargetRange: [0.6, 0.8],
  overFactor:    2.6,    // current / target
  alphaAvg:      0.18,
  defects: [ {code, label, severity} ],
  status:        'over' | 'under' | 'balanced'
}
*/

function calculate(inputs) {
  const { dimensions, materials, functionId, furnitureCoverage = 0.3 } = inputs;
  const L = +dimensions.length, W = +dimensions.width, H = +dimensions.height;
  const V = L * W * H;

  const A_floor   = L * W;
  const A_ceiling = L * W;
  const A_walls   = 2 * (L * H + W * H);
  const A_furniture = A_floor * furnitureCoverage;

  const matMap = Object.fromEntries(MATERIALS.map(m => [m.id, m]));
  const mCeil  = matMap[materials.ceiling]  || matMap['concrete'];
  const mWall  = matMap[materials.walls]    || matMap['concrete'];
  const mFloor = matMap[materials.floor]    || matMap['concrete'];
  const mFurn  = materials.furniture ? matMap[materials.furniture] : null;

  /* Sabine: RT60 = 0.161 * V / Σ(S_i * α_i)
     Compute per band. */
  const rt60ByBand = {};
  let totalAlphaWeighted = 0;
  const A_total = A_ceiling + A_walls + A_floor;

  FREQUENCY_BANDS.forEach(f => {
    const A_abs =
      A_ceiling * mCeil.alpha[f] +
      A_walls   * mWall.alpha[f] +
      A_floor   * mFloor.alpha[f] +
      (mFurn ? A_furniture * mFurn.alpha[f] : 0);
    rt60ByBand[f] = +(0.161 * V / Math.max(A_abs, 0.01)).toFixed(2);
    totalAlphaWeighted += A_abs;
  });

  const rt60Avg = +((rt60ByBand[500] + rt60ByBand[1000]) / 2).toFixed(2);
  const alphaAvg = +(totalAlphaWeighted / FREQUENCY_BANDS.length / A_total).toFixed(3);

  const fn = SPACE_FUNCTIONS.find(s => s.id === functionId) || SPACE_FUNCTIONS[1];
  const rt60Target = +fn.rtTarget(V).toFixed(2);
  const overFactor = +(rt60Avg / rt60Target).toFixed(2);

  /* Defect diagnostics */
  const defects = [];
  if (overFactor > 1.5) {
    defects.push({ code: 'reverb-excess', label: 'Excessive reverberation', severity: 'high',
      detail: `Mid-frequency RT60 is ${overFactor}× the recommended target. Speech and music clarity will be severely compromised.` });
  }
  if (rt60ByBand[125] / rt60ByBand[1000] > 1.4) {
    defects.push({ code: 'low-freq-boom', label: 'Low-frequency boom', severity: 'medium',
      detail: `Bass frequencies decay ${((rt60ByBand[125] / rt60ByBand[1000] - 1) * 100).toFixed(0)}% slower than mids — muddy, boomy sound.` });
  }
  if (rt60ByBand[1000] > 1.0 && ['conference','office','school'].includes(functionId)) {
    defects.push({ code: 'speech-risk', label: 'Speech intelligibility risk', severity: 'high',
      detail: 'STI is likely below 0.5. Listeners will struggle to follow spoken content without strain.' });
  }
  if (alphaAvg < 0.30) {
    defects.push({ code: 'flutter-echo', label: 'Flutter echo risk', severity: 'medium',
      detail: 'Parallel hard surfaces with low absorption create rapid repeating reflections — audible "ringing" between walls.' });
  }
  if (alphaAvg < 0.15) {
    defects.push({ code: 'insufficient-absorption', label: 'Insufficient total absorption', severity: 'high',
      detail: `Average absorption coefficient is only ${alphaAvg.toFixed(2)} — far below the 0.25–0.40 range recommended for this space type.` });
  }

  const status = defects.length === 0 ? 'balanced'
               : overFactor < 0.8 ? 'under'
               : 'over';

  return {
    volume: +V.toFixed(1),
    totalSurface: +A_total.toFixed(1),
    surfaceBreakdown: { ceiling: A_ceiling, walls: A_walls, floor: A_floor, furniture: A_furniture },
    rt60ByBand,
    rt60Avg,
    rt60Target,
    rt60TargetRange: fn.rtRange,
    overFactor,
    alphaAvg,
    defects,
    status,
    functionName: fn.name
  };
}
