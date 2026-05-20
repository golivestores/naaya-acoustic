/* =============================================
   NAAYA Room Acoustic Simulator — Live controller
   Left stage updates in real time as user fills right panel.
   ============================================= */

const state = {
  projectName: '',
  functionId: '',
  dimensions: { length: '', width: '', height: '' },
  materials: { ceiling: 'concrete', wall: 'concrete', floor: 'concrete', furniture: null },
  furnitureCoverage: 0.3,
  report: null
};

document.addEventListener('DOMContentLoaded', () => {
  renderFunctionList();
  renderMaterialLists();
  bindInputs();
  bindCTA();
  fadeInVideo();
  recompute();
});

function fadeInVideo() {
  const v = document.getElementById('stageVideo');
  if (!v) return;
  v.addEventListener('loadeddata', () => v.classList.add('is-ready'));
  if (v.readyState >= 2) v.classList.add('is-ready');
}

/* ── Function list (radio-style rows) ── */
function renderFunctionList() {
  const list = document.getElementById('funcList');
  list.innerHTML = SPACE_FUNCTIONS.map(f => `
    <button class="opt-card" data-fn="${f.id}">
      <span class="opt-card-marker"></span>
      <span class="opt-card-body">
        <span class="opt-card-name">${f.name}</span>
        <span class="opt-card-meta">Target RT ${f.rtRange[0]}–${f.rtRange[1]}s</span>
      </span>
    </button>
  `).join('');
  list.querySelectorAll('.opt-card').forEach(btn => {
    btn.addEventListener('click', () => {
      list.querySelectorAll('.opt-card').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      state.functionId = btn.dataset.fn;
      swapStageVideo(btn.dataset.fn);
      recompute();
    });
  });
}

/* ── Swap stage video on function change ── */
function swapStageVideo(fnId) {
  const fn = SPACE_FUNCTIONS.find(s => s.id === fnId);
  if (!fn || !fn.video) return;
  const video = document.getElementById('stageVideo');
  if (!video) return;
  const source = video.querySelector('source');
  video.classList.remove('is-ready');
  setTimeout(() => {
    source.src = '../' + fn.video;
    video.load();
    video.play().catch(() => {});
    video.addEventListener('loadeddata', () => video.classList.add('is-ready'), { once: true });
  }, 250);
}

/* ── Material lists per surface ── */
function renderMaterialLists() {
  document.querySelectorAll('.opt-list[data-surface]').forEach(list => {
    const surface = list.dataset.surface;
    const options = MATERIALS.filter(m => m.surfaces.includes(surface));
    list.innerHTML = options.map(m => `
      <button class="opt-card" data-mat="${m.id}" data-surface="${surface}">
        <span class="opt-card-marker"></span>
        <span class="opt-card-body">
          <span class="opt-card-name">${m.name}</span>
          <span class="opt-card-meta">${m.category}</span>
        </span>
      </button>
    `).join('');

    const stateKey = surface;
    const currentId = state.materials[stateKey];
    if (currentId) {
      const def = list.querySelector(`[data-mat="${currentId}"]`);
      if (def) def.classList.add('is-active');
    }

    list.querySelectorAll('.opt-card').forEach(btn => {
      btn.addEventListener('click', () => {
        list.querySelectorAll('.opt-card').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        state.materials[stateKey] = btn.dataset.mat;
        recompute();
      });
    });
  });
}

/* ── Bind text/number inputs ── */
function bindInputs() {
  document.getElementById('projectName').addEventListener('input', e => {
    state.projectName = e.target.value.trim();
    document.getElementById('stageProject').textContent = state.projectName || 'Untitled project';
    recompute();
  });
  ['length','width','height'].forEach(key => {
    document.getElementById('dim-' + key).addEventListener('input', e => {
      state.dimensions[key] = e.target.value;
      recompute();
    });
  });
}

/* ── Recompute & repaint everything ── */
function recompute() {
  const { length: L, width: W, height: H } = state.dimensions;
  const dimsOk = +L > 0 && +W > 0 && +H > 0;
  const ready = dimsOk && state.functionId;

  // Areas in right panel
  if (dimsOk) {
    const A_floor = +L * +W;
    const A_walls = 2 * (+L * +H + +W * +H);
    const A_furn = A_floor * state.furnitureCoverage;
    setText('area-ceiling', `${A_floor.toFixed(1)} m²`);
    setText('area-walls',   `${A_walls.toFixed(1)} m²`);
    setText('area-floor',   `${A_floor.toFixed(1)} m²`);
    setText('area-furniture', `${A_furn.toFixed(1)} m² · 30% floor`);
  } else {
    ['area-ceiling','area-walls','area-floor','area-furniture'].forEach(id => setText(id, '—'));
  }

  // Stage volume
  setText('liveVolume', dimsOk ? (+L * +W * +H).toFixed(0) : '—');

  // Stage function label
  const fn = SPACE_FUNCTIONS.find(s => s.id === state.functionId);
  setText('stageFunction', fn ? fn.name : 'Select a space function →');

  // If not ready, clear report
  if (!ready) {
    state.report = null;
    paintStageEmpty();
    document.getElementById('reportSection').classList.remove('is-ready');
    document.getElementById('ctaContact').disabled = true;
    setText('footerRt', '—');
    return;
  }

  // Calculate
  const r = calculate({
    projectName: state.projectName || 'Untitled',
    functionId: state.functionId,
    dimensions: state.dimensions,
    materials: {
      ceiling: state.materials.ceiling,
      walls: state.materials.wall,
      floor: state.materials.floor,
      furniture: state.materials.furniture
    },
    furnitureCoverage: state.furnitureCoverage
  });
  state.report = r;

  paintStage(r);
  paintReport(r);
  document.getElementById('reportSection').classList.add('is-ready');
  document.getElementById('ctaContact').disabled = false;
  setText('footerRt', r.rt60Avg.toFixed(2));
}

/* ── Stage paint ── */
function paintStageEmpty() {
  setText('liveRt', '—');
  setText('liveTarget', '—');
  const tag = document.getElementById('liveStatus');
  tag.textContent = ''; tag.className = 'readout-tag';
  document.getElementById('stageDot').className = 'stage-status-dot';
  setText('stageStatusText', 'Awaiting input');
  // Empty bars
  document.getElementById('stageBars').innerHTML = FREQUENCY_BANDS.map(f => `
    <div class="sbar"><div class="sbar-fill" style="height:4%"></div><div class="sbar-label">${f >= 1000 ? f/1000 + 'k' : f}</div></div>
  `).join('');
  paintStageDefects([]);
}

/* Map defect codes → CSS class on #stageDefects to activate the relevant viz */
const DEFECT_VIZ_MAP = {
  'reverb-excess': 'show-reverb'
};
function paintStageDefects(defects) {
  const el = document.getElementById('stageDefects');
  if (!el) return;
  // Clear all show-* classes
  el.className = 'stage-defects';
  defects.forEach(d => {
    const cls = DEFECT_VIZ_MAP[d.code];
    if (cls) el.classList.add(cls);
  });
}

function paintStage(r) {
  setText('liveRt', r.rt60Avg.toFixed(2));
  setText('liveTarget', r.rt60Target.toFixed(2));

  const tag = document.getElementById('liveStatus');
  const dot = document.getElementById('stageDot');
  if (r.status === 'balanced') {
    tag.textContent = 'Within range';        tag.className = 'readout-tag is-ok';
    dot.className = 'stage-status-dot is-active';
    setText('stageStatusText', 'Acoustically balanced');
  } else if (r.overFactor > 1.5) {
    tag.textContent = `+${((r.overFactor - 1) * 100).toFixed(0)}% reverb`;
    tag.className = 'readout-tag is-danger';
    dot.className = 'stage-status-dot is-danger';
    setText('stageStatusText', `${r.defects.length} issues detected`);
  } else if (r.overFactor > 1.2) {
    tag.textContent = 'Slightly high';
    tag.className = 'readout-tag is-warn';
    dot.className = 'stage-status-dot is-danger';
    setText('stageStatusText', `${r.defects.length} issues detected`);
  } else if (r.overFactor < 0.8) {
    tag.textContent = 'Below target';
    tag.className = 'readout-tag is-warn';
    dot.className = 'stage-status-dot is-danger';
    setText('stageStatusText', `${r.defects.length} issues detected`);
  } else {
    tag.textContent = 'Near target';
    tag.className = 'readout-tag is-ok';
    dot.className = 'stage-status-dot is-active';
    setText('stageStatusText', 'Close to target');
  }

  // Defect overlays on video
  paintStageDefects(r.defects);

  // Frequency mini-bars
  const max = Math.max(...Object.values(r.rt60ByBand), r.rt60Target * 1.2);
  document.getElementById('stageBars').innerHTML = FREQUENCY_BANDS.map(f => {
    const v = r.rt60ByBand[f];
    const h = (v / max) * 100;
    const over = v > r.rt60Target * 1.2;
    return `
      <div class="sbar">
        <div class="sbar-fill ${over ? 'over' : ''}" style="height:${h}%"></div>
        <div class="sbar-label">${f >= 1000 ? f/1000 + 'k' : f}</div>
      </div>`;
  }).join('');
}

/* ── Report paint (right panel section 05) ── */
function paintReport(r) {
  setText('report-status',
    r.status === 'balanced' ? 'Balanced' :
    r.status === 'over'     ? 'Over-reverberant' :
                              'Under-reverberant');

  document.getElementById('reportSummary').innerHTML = `
    <div class="report-kpi">
      <div class="report-kpi-label">Current RT60</div>
      <div class="report-kpi-value">${r.rt60Avg.toFixed(2)}<span class="unit">s</span></div>
    </div>
    <div class="report-kpi">
      <div class="report-kpi-label">Target RT60</div>
      <div class="report-kpi-value">${r.rt60Target.toFixed(2)}<span class="unit">s</span></div>
    </div>
    <div class="report-kpi">
      <div class="report-kpi-label">Deviation</div>
      <div class="report-kpi-value">${r.overFactor.toFixed(2)}<span class="unit">×</span></div>
    </div>
    <div class="report-kpi">
      <div class="report-kpi-label">Avg absorption α</div>
      <div class="report-kpi-value">${r.alphaAvg.toFixed(2)}</div>
    </div>
  `;

  const list = document.getElementById('reportDefects');
  if (r.defects.length === 0) {
    list.innerHTML = '<div class="defect-empty">No major acoustic issues detected. Consultant review recommended to validate.</div>';
  } else {
    list.innerHTML = r.defects.map(d => `
      <div class="defect-item">
        <div class="defect-head">
          <span class="defect-severity ${d.severity}">${d.severity}</span>
          <span class="defect-title">${d.label}</span>
        </div>
        <div class="defect-detail">${d.detail}</div>
      </div>
    `).join('');
  }
}

/* ── CTA + Contact modal ── */
function bindCTA() {
  document.getElementById('ctaContact').addEventListener('click', openModal);
  document.querySelectorAll('#contactModal [data-close]').forEach(el =>
    el.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !document.getElementById('contactModal').hidden) closeModal();
  });
  document.getElementById('contactForm').addEventListener('submit', handleSubmit);
}

function openModal() {
  if (!state.report) return;
  const r = state.report;
  // Render summary inside modal
  document.getElementById('modalSummary').innerHTML = `
    <div class="modal-summary-row">
      <div class="modal-summary-label">Project</div>
      <div class="modal-summary-value">${state.projectName || 'Untitled'}</div>
    </div>
    <div class="modal-summary-row">
      <div class="modal-summary-label">Function</div>
      <div class="modal-summary-value">${r.functionName}</div>
    </div>
    <div class="modal-summary-row">
      <div class="modal-summary-label">Current RT60</div>
      <div class="modal-summary-value ${r.overFactor > 1.2 ? 'is-danger' : ''}">${r.rt60Avg.toFixed(2)} s</div>
    </div>
    <div class="modal-summary-row">
      <div class="modal-summary-label">Issues detected</div>
      <div class="modal-summary-value">${r.defects.length}</div>
    </div>
  `;
  // Reset form state
  document.getElementById('modalForm').hidden = false;
  document.getElementById('modalThanks').hidden = true;
  document.getElementById('contactForm').reset();
  document.getElementById('errEmail').textContent = '';
  document.getElementById('errPhone').textContent = '';
  document.getElementById('contactModal').hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('cEmail').focus(), 50);
}

function closeModal() {
  document.getElementById('contactModal').hidden = true;
  document.body.style.overflow = '';
}

function handleSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('cEmail').value.trim();
  const phone = document.getElementById('cPhone').value.trim();
  const errEmail = document.getElementById('errEmail');
  const errPhone = document.getElementById('errPhone');
  errEmail.textContent = ''; errPhone.textContent = '';
  let ok = true;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errEmail.textContent = 'Please enter a valid email address.'; ok = false; }
  if (!/^[+\d][\d\s\-()]{6,}$/.test(phone)) { errPhone.textContent = 'Please enter a valid phone number.'; ok = false; }
  if (!ok) return;

  // Log submission payload (later: POST to CRM endpoint)
  const payload = {
    contact: { email, phone },
    project: state.projectName,
    inputs: { functionId: state.functionId, dimensions: state.dimensions, materials: state.materials },
    report: state.report,
    submittedAt: new Date().toISOString()
  };
  console.log('[Simulator] Contact submission:', payload);

  // Swap to thank-you state
  document.getElementById('tProject').textContent = state.projectName || 'Untitled';
  document.getElementById('tFunction').textContent = state.report.functionName;
  document.getElementById('tEmail').textContent = email;
  document.getElementById('modalForm').hidden = true;
  document.getElementById('modalThanks').hidden = false;
}

function setText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}
