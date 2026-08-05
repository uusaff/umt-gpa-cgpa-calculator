import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus, Trash2, RotateCcw, Download,
  BookOpen, GraduationCap, Award, Calendar,
  Github, Activity, ArrowRight, CheckCircle2,
  AlertCircle, ChevronDown, X, TrendingUp
} from 'lucide-react';

/* ─── Grade Scale ─────────────────────────────────────────── */
const GRADE_SCALE = {
  'A': 4.00, 'A-': 3.70, 'B+': 3.30, 'B': 3.00, 'B-': 2.70,
  'C+': 2.30, 'C': 2.00, 'C-': 1.70, 'D+': 1.30, 'D': 1.00, 'F': 0.00
};

const getInitialSubject  = () => [{ id: Date.now(), name: '', credits: 3, grade: 'A' }];
const getInitialSemester = () => [{ id: Date.now(), name: 'Semester 1', gpa: '', credits: 15 }];

/* ─── Feedback ────────────────────────────────────────────── */
function getFeedback(score) {
  if (score < 2.0) return { text: 'Requires Attention', cls: 'status-low',   bar: 20  };
  if (score < 3.0) return { text: 'Steady Progress',    cls: 'status-mid',   bar: 50  };
  if (score < 3.5) return { text: 'Commendable',        cls: 'status-good',  bar: 70  };
  if (score < 3.9) return { text: 'Excellent Standing', cls: 'status-great', bar: 88  };
  return              { text: 'Exceptional Merit',   cls: 'status-excel', bar: 100 };
}

/* ─── Toast ───────────────────────────────────────────────── */
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast ${toast.type === 'error' ? 'toast--error' : ''}`}>
      {toast.type === 'error'
        ? <AlertCircle size={14} className="toast-icon-err" />
        : <CheckCircle2 size={14} className="toast-icon-ok" />}
      <span>{toast.message}</span>
    </div>
  );
}

/* ─── Background Canvas ───────────────────────────────────── */
function BackgroundCanvas() {
  return (
    <div className="bg-canvas" aria-hidden="true">
      <div className="bg-topo" />
      <div className="bg-dots" />
    </div>
  );
}

/* ─── Mobile Entry Card (replaces table rows on mobile) ─────── */
function EntryCard({ item, index, isGpa, onUpdate, onRemove, canRemove }) {
  return (
    <div className="entry-card">
      <div className="entry-card-header">
        <span className="entry-index">{String(index + 1).padStart(2, '0')}</span>
        {canRemove && (
          <button
            className="entry-delete-btn"
            onClick={() => onRemove(item.id)}
            aria-label="Remove entry"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <div className="entry-fields">
        {/* Name */}
        <div className="entry-field entry-field--name">
          <label className="entry-label">
            {isGpa ? 'Subject' : 'Term'}
          </label>
          <input
            type="text"
            className="field-input"
            value={item.name}
            placeholder={isGpa ? 'e.g. Data Structures' : 'e.g. Fall 2024'}
            onChange={e => onUpdate(item.id, 'name', e.target.value)}
          />
        </div>

        <div className="entry-row-bottom">
          {/* Grade / GPA */}
          <div className="entry-field entry-field--grade">
            <label className="entry-label">{isGpa ? 'Grade' : 'GPA'}</label>
            {isGpa ? (
              <div className="field-select-wrapper">
                <select
                  className="field-select"
                  value={item.grade}
                  onChange={e => onUpdate(item.id, 'grade', e.target.value)}
                >
                  {Object.keys(GRADE_SCALE).map(g => (
                    <option key={g} value={g}>{g} — {GRADE_SCALE[g].toFixed(2)}</option>
                  ))}
                </select>
              </div>
            ) : (
              <input
                type="number"
                className="field-input"
                step="0.01" min="0" max="4"
                placeholder="0.00"
                value={item.gpa}
                onChange={e => onUpdate(item.id, 'gpa', e.target.value)}
              />
            )}
          </div>

          {/* Credits */}
          <div className="entry-field entry-field--credits">
            <label className="entry-label">Credits</label>
            <div className="credit-stepper">
              <button
                className="stepper-btn"
                onClick={() => {
                  const v = Math.max(1, Number(item.credits) - 1);
                  onUpdate(item.id, 'credits', v);
                }}
                aria-label="Decrease credits"
              >−</button>
              <span className="stepper-val">{item.credits}</span>
              <button
                className="stepper-btn"
                onClick={() => {
                  const v = Math.min(6, Number(item.credits) + 1);
                  onUpdate(item.id, 'credits', v);
                }}
                aria-label="Increase credits"
              >+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Result Bottom Sheet ─────────────────────────────────── */
function ResultSheet({ show, onClose, score, label, feedback, totalCredits, scalePercent }) {
  const sheetRef = useRef(null);

  useEffect(() => {
    if (show && sheetRef.current) {
      sheetRef.current.scrollTop = 0;
    }
  }, [show]);

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      {/* Sheet */}
      <div className="result-sheet" ref={sheetRef} role="dialog" aria-modal="true" aria-label="GPA Result">
        <div className="sheet-handle" />

        <div className="sheet-body">
          {/* Score */}
          <p className="sheet-label">{label}</p>
          <div className="sheet-score">{score.toFixed(2)}</div>
          <p className="sheet-scale">out of 4.00</p>

          {/* Progress bar */}
          <div className="sheet-bar-track">
            <div
              className={`sheet-bar-fill ${feedback.cls}`}
              style={{ width: `${feedback.bar}%` }}
            />
          </div>

          {/* Status badge */}
          <div className={`sheet-status ${feedback.cls}`}>{feedback.text}</div>

          {/* Stats row */}
          <div className="sheet-stats">
            <div className="sheet-stat">
              <span className="sheet-stat-label">Total Credits</span>
              <span className="sheet-stat-value">{totalCredits}</span>
            </div>
            <div className="sheet-stat-divider" />
            <div className="sheet-stat">
              <span className="sheet-stat-label">Scale %</span>
              <span className="sheet-stat-value">{scalePercent}%</span>
            </div>
            <div className="sheet-stat-divider" />
            <div className="sheet-stat">
              <span className="sheet-stat-label">Grade</span>
              <span className="sheet-stat-value" style={{ color: 'var(--accent)' }}>
                {score >= 3.9 ? 'A+' : score >= 3.5 ? 'A' : score >= 3.0 ? 'B' : score >= 2.0 ? 'C' : 'D'}
              </span>
            </div>
          </div>

          {/* Close */}
          <button className="sheet-close-btn" onClick={onClose}>
            <X size={14} /> Close
          </button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [activeTab, setActiveTab]   = useState('gpa');
  const [showResult, setShowResult] = useState(false);
  const [toast, setToast]           = useState(null);

  const [subjects, setSubjects] = useState(() => {
    const s = localStorage.getItem('umt_gpa_subjects');
    const p = s ? JSON.parse(s) : null;
    return (p && p.length > 0) ? p : getInitialSubject();
  });

  const [semesters, setSemesters] = useState(() => {
    const s = localStorage.getItem('umt_cgpa_semesters');
    const p = s ? JSON.parse(s) : null;
    return (p && p.length > 0) ? p : getInitialSemester();
  });

  useEffect(() => { localStorage.setItem('umt_gpa_subjects',   JSON.stringify(subjects));  }, [subjects]);
  useEffect(() => { localStorage.setItem('umt_cgpa_semesters', JSON.stringify(semesters)); }, [semesters]);
  useEffect(() => { setShowResult(false); }, [activeTab]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── GPA Actions ──────────────────────────────────────── */
  const addSubject    = () => {
    if (subjects.length >= 10) return showToast('Max 10 subjects', 'error');
    setSubjects([...subjects, { id: Date.now(), name: '', credits: 3, grade: 'A' }]);
  };
  const updateSubject = (id, f, v) => setSubjects(subjects.map(s => s.id === id ? { ...s, [f]: v } : s));
  const removeSubject = (id) => {
    if (subjects.length <= 1) return showToast('At least 1 subject required', 'error');
    setSubjects(subjects.filter(s => s.id !== id));
  };

  /* ── CGPA Actions ─────────────────────────────────────── */
  const addSemester    = () => {
    if (semesters.length >= 10) return showToast('Max 10 semesters', 'error');
    setSemesters([...semesters, { id: Date.now(), name: `Semester ${semesters.length + 1}`, gpa: '', credits: 15 }]);
  };
  const updateSemester = (id, f, v) => setSemesters(semesters.map(s => s.id === id ? { ...s, [f]: v } : s));
  const removeSemester = (id) => {
    if (semesters.length <= 1) return showToast('At least 1 semester required', 'error');
    setSemesters(semesters.filter(s => s.id !== id));
  };

  /* ── Computed ─────────────────────────────────────────── */
  const gpaStats = useMemo(() => {
    let tc = 0, tq = 0;
    subjects.forEach(s => { const c = Number(s.credits)||0; tc += c; tq += (GRADE_SCALE[s.grade]||0)*c; });
    return { totalCredits: tc, gpa: tc > 0 ? tq/tc : 0 };
  }, [subjects]);

  const cgpaStats = useMemo(() => {
    let tc = 0, tq = 0;
    semesters.forEach(s => { const c = Number(s.credits)||0; const g = Number(s.gpa)||0; tc += c; tq += g*c; });
    return { totalCredits: tc, cgpa: tc > 0 ? tq/tc : 0 };
  }, [semesters]);

  const isGpa        = activeTab === 'gpa';
  const currentScore = isGpa ? gpaStats.gpa : cgpaStats.cgpa;
  const totalCredits = isGpa ? gpaStats.totalCredits : cgpaStats.totalCredits;
  const scalePercent = ((currentScore / 4) * 100).toFixed(1);
  const feedback     = getFeedback(currentScore);
  const items        = isGpa ? subjects : semesters;
  const count        = items.length;

  const resetData = () => {
    if (isGpa) setSubjects(getInitialSubject());
    else setSemesters(getInitialSemester());
    setShowResult(false);
    showToast('Registry cleared');
  };

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <>
      <BackgroundCanvas />
      <Toast toast={toast} />

      {/* Result Sheet (mobile) */}
      <ResultSheet
        show={showResult}
        onClose={() => setShowResult(false)}
        score={currentScore}
        label={isGpa ? 'Semester GPA' : 'Cumulative GPA'}
        feedback={feedback}
        totalCredits={totalCredits}
        scalePercent={scalePercent}
      />

      {/* ══ DESKTOP LAYOUT (≥1024px) ═══════════════════════ */}
      <div className="desktop-wrapper">
        <div className="page-wrapper">
          {/* Header */}
          <header className="site-header anim-fade-up">
            <div className="header-brand">
              <h1 className="header-title">UMT GPA / CGPA Calculator</h1>
              <p className="header-subtitle">Official (AI-Assisted) Grading System</p>
            </div>
            <a href="https://github.com/uusaff" target="_blank" rel="noopener noreferrer"
               className="header-user" aria-label="GitHub profile – UUSAFF">
              <span>UUSAFF</span>
              <Github size={15} />
            </a>
          </header>

          {/* Desktop Grid */}
          <div className="main-grid">
            {/* Calculator Card */}
            <div className="card anim-fade-up anim-delay-1" id="calculator-card">
              <div className="tabs" role="tablist">
                <button role="tab" aria-selected={isGpa} id="tab-gpa"
                  className={`tab-btn ${isGpa ? 'active' : ''}`} onClick={() => setActiveTab('gpa')}>
                  <BookOpen size={13} /> Semester GPA
                </button>
                <button role="tab" aria-selected={!isGpa} id="tab-cgpa"
                  className={`tab-btn ${!isGpa ? 'active' : ''}`} onClick={() => setActiveTab('cgpa')}>
                  <GraduationCap size={13} /> Cumulative GPA
                </button>
              </div>

              <div className="card-body">
                <div className="controls-row">
                  <div className="controls-left">
                    <button id="btn-add-entry" className="btn-secondary"
                      onClick={isGpa ? addSubject : addSemester}>
                      <Plus size={13} className="btn-icon-accent" />
                      Add {isGpa ? 'Entry' : 'Term'}
                    </button>
                    <span className="count-badge" aria-live="polite">{count}/10</span>
                  </div>
                  <div className="controls-right">
                    <button id="btn-reset" className="btn-ghost" onClick={resetData}>
                      <RotateCcw size={12} /> Reset
                    </button>
                    <button id="btn-export" className="btn-primary" onClick={() => window.print()}>
                      <Download size={12} /> Export
                    </button>
                  </div>
                </div>

                {/* Desktop table */}
                <div className="data-table-wrapper">
                  <table className="data-table" aria-label={isGpa ? 'Subject entries' : 'Semester entries'}>
                    <thead>
                      <tr>
                        <th style={{ width: '46%' }}>{isGpa ? 'Subject Name' : 'Term Designation'}</th>
                        <th style={{ width: '22%' }}>{isGpa ? 'Grade' : 'GPA'}</th>
                        <th style={{ width: '22%' }}>Credits</th>
                        <th style={{ width: '10%' }} className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id}>
                          <td style={{ paddingRight: '10px' }}>
                            <input type="text" className="field-input" value={item.name}
                              placeholder={isGpa ? 'e.g. Data Structures' : 'e.g. Fall 2024'}
                              onChange={e => isGpa
                                ? updateSubject(item.id, 'name', e.target.value)
                                : updateSemester(item.id, 'name', e.target.value)} />
                          </td>
                          <td style={{ paddingRight: '10px' }}>
                            {isGpa ? (
                              <div className="field-select-wrapper">
                                <select className="field-select" value={item.grade}
                                  onChange={e => updateSubject(item.id, 'grade', e.target.value)}>
                                  {Object.keys(GRADE_SCALE).map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                              </div>
                            ) : (
                              <input type="number" className="field-input" step="0.01" min="0" max="4"
                                placeholder="0.00" value={item.gpa}
                                onChange={e => updateSemester(item.id, 'gpa', e.target.value)} />
                            )}
                          </td>
                          <td style={{ paddingRight: '10px' }}>
                            <input type="number" className="field-input" min="1" max="6" value={item.credits}
                              onChange={e => {
                                const v = Math.max(1, Number(e.target.value));
                                isGpa ? updateSubject(item.id, 'credits', v) : updateSemester(item.id, 'credits', v);
                              }} />
                          </td>
                          <td className="text-center">
                            {count > 1 && (
                              <button className="btn-delete"
                                onClick={() => isGpa ? removeSubject(item.id) : removeSemester(item.id)}>
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="right-panel">
              {/* Card 1 */}
              <div className="side-card anim-fade-up anim-delay-2" id="calculate-card">
                {!showResult ? (
                  <div className="anim-reveal">
                    <div className="side-card-icon"><Award size={20} strokeWidth={1.5} /></div>
                    <h2 className="side-card-title">Ready?</h2>
                    <p className="side-card-desc">
                      Fill in your {isGpa ? 'subjects and grades' : 'semester GPAs'} and calculate.
                    </p>
                    <button id="btn-calculate" className="btn-primary btn-primary-full"
                      onClick={() => { setShowResult(true); showToast('Calculation complete'); }}>
                      Calculate
                    </button>
                  </div>
                ) : (
                  <div className="anim-reveal">
                    <p className="result-label">{isGpa ? 'Semester GPA' : 'Cumulative GPA'}</p>
                    <div className="result-score">{currentScore.toFixed(2)}</div>
                    <div className={`result-status ${feedback.cls}`}>{feedback.text}</div>
                    <div className="result-stats">
                      <div className="result-stat-box">
                        <div className="result-stat-label">Total Credits</div>
                        <div className="result-stat-value">{totalCredits}</div>
                      </div>
                      <div className="result-stat-box">
                        <div className="result-stat-label">Scale %</div>
                        <div className="result-stat-value">{scalePercent}%</div>
                      </div>
                    </div>
                    <hr className="result-divider" />
                    <button className="btn-ghost"
                      style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--border-dim)' }}
                      onClick={() => setShowResult(false)}>
                      Edit Data
                    </button>
                  </div>
                )}
              </div>

              {/* Card 2 */}
              <div className="side-card anim-fade-up anim-delay-3" id="exams-card">
                <div className="side-card-icon"><Calendar size={20} strokeWidth={1.5} /></div>
                <h3 className="side-card-title">Exams Approaching?</h3>
                <p className="side-card-desc">
                  Organize and track midterms and finals with the dedicated AI-assisted exam tracker.
                </p>
                <a href="https://usafs-tracker.vercel.app/" target="_blank" rel="noopener noreferrer"
                   className="side-card-link" id="link-exams-tracker">
                  <ArrowRight size={12} /> Load Exams Tracker
                </a>
              </div>

              {/* Card 3 */}
              <div className="side-card anim-fade-up anim-delay-4" id="habits-card">
                <div className="side-card-icon"><Activity size={20} strokeWidth={1.5} /></div>
                <h3 className="side-card-title">Optimize Behavior</h3>
                <p className="side-card-desc">
                  Track core objectives and maintain consistency with the habit-building module.
                </p>
                <a href="https://habit-tracker-nine-mu.vercel.app/" target="_blank" rel="noopener noreferrer"
                   className="side-card-link" id="link-habits-tracker">
                  <ArrowRight size={12} /> Load Habits Tracker
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MOBILE LAYOUT (<1024px) ════════════════════════ */}
      <div className="mobile-wrapper">

        {/* Fixed top bar */}
        <header className="mobile-header">
          <div className="mobile-header-left">
            <h1 className="mobile-title">UMT Calculator</h1>
            <p className="mobile-subtitle">GPA / CGPA</p>
          </div>
          <a href="https://github.com/uusaff" target="_blank" rel="noopener noreferrer"
             className="mobile-github-btn" aria-label="GitHub">
            <Github size={16} />
            <span>UUSAFF</span>
          </a>
        </header>

        {/* Scrollable content area */}
        <main className="mobile-main">

          {/* Live score ticker */}
          <div className="mobile-score-ticker">
            <div className="ticker-inner">
              <span className="ticker-label">{isGpa ? 'SEMESTER GPA' : 'CUMULATIVE GPA'}</span>
              <span className="ticker-score">{currentScore.toFixed(2)}</span>
              <span className={`ticker-status ${feedback.cls}`}>{feedback.text}</span>
            </div>
            <div className="ticker-bar-track">
              <div
                className={`ticker-bar-fill ${feedback.cls}`}
                style={{ width: `${feedback.bar}%` }}
              />
            </div>
          </div>

          {/* Entries list */}
          <section className="mobile-entries-section">
            <div className="mobile-entries-header">
              <span className="mobile-entries-count">{count} {isGpa ? 'subject' : 'semester'}{count !== 1 ? 's' : ''}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="mobile-icon-btn" onClick={resetData} aria-label="Reset">
                  <RotateCcw size={15} />
                </button>
                <button className="mobile-icon-btn" onClick={() => window.print()} aria-label="Export">
                  <Download size={15} />
                </button>
              </div>
            </div>

            {/* Entry cards */}
            <div className="mobile-entries-list">
              {items.map((item, idx) => (
                <EntryCard
                  key={item.id}
                  item={item}
                  index={idx}
                  isGpa={isGpa}
                  onUpdate={isGpa ? updateSubject : updateSemester}
                  onRemove={isGpa ? removeSubject : removeSemester}
                  canRemove={count > 1}
                />
              ))}
            </div>

            {/* Add entry button */}
            {count < 10 && (
              <button
                className="mobile-add-btn"
                onClick={isGpa ? addSubject : addSemester}
                aria-label={`Add ${isGpa ? 'subject' : 'semester'}`}
              >
                <Plus size={16} />
                Add {isGpa ? 'Subject' : 'Term'}
                <span className="mobile-add-count">{count}/10</span>
              </button>
            )}
          </section>

          {/* Quick links strip */}
          <section className="mobile-quick-links">
            <a href="https://usafs-tracker.vercel.app/" target="_blank" rel="noopener noreferrer"
               className="quick-link-card" id="mobile-link-exams">
              <div className="quick-link-icon"><Calendar size={18} strokeWidth={1.5} /></div>
              <div className="quick-link-content">
                <span className="quick-link-title">Exams Tracker</span>
                <span className="quick-link-sub">Track midterms & finals</span>
              </div>
              <ArrowRight size={14} className="quick-link-arrow" />
            </a>
            <a href="https://habit-tracker-nine-mu.vercel.app/" target="_blank" rel="noopener noreferrer"
               className="quick-link-card" id="mobile-link-habits">
              <div className="quick-link-icon"><Activity size={18} strokeWidth={1.5} /></div>
              <div className="quick-link-content">
                <span className="quick-link-title">Habits Tracker</span>
                <span className="quick-link-sub">Optimize your routine</span>
              </div>
              <ArrowRight size={14} className="quick-link-arrow" />
            </a>
          </section>

          {/* Bottom padding so FAB doesn't cover content */}
          <div style={{ height: '140px' }} />
        </main>

        {/* Bottom nav bar (tab switcher) */}
        <nav className="mobile-bottom-nav" aria-label="Calculator mode">
          <button
            className={`mobile-nav-btn ${isGpa ? 'active' : ''}`}
            id="mobile-tab-gpa"
            onClick={() => setActiveTab('gpa')}
            aria-selected={isGpa}
          >
            <BookOpen size={18} />
            <span>Semester</span>
          </button>

          {/* Center FAB: Calculate */}
          <button
            className="mobile-nav-fab"
            id="mobile-btn-calculate"
            onClick={() => { setShowResult(true); showToast('Calculation complete'); }}
            aria-label="Calculate GPA"
          >
            <TrendingUp size={20} />
          </button>

          <button
            className={`mobile-nav-btn ${!isGpa ? 'active' : ''}`}
            id="mobile-tab-cgpa"
            onClick={() => setActiveTab('cgpa')}
            aria-selected={!isGpa}
          >
            <GraduationCap size={18} />
            <span>Cumulative</span>
          </button>
        </nav>
      </div>
    </>
  );
}