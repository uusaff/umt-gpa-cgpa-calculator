import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, Trash2, RotateCcw, Download,
  BookOpen, GraduationCap, Award, Calendar,
  Github, Activity, ArrowRight, CheckCircle2,
  AlertCircle, X, TrendingUp, Sun, Moon
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
  if (score < 2.0)  return { text: 'Requires Attention', cls: 'status-low',   bar: 20  };
  if (score < 3.0)  return { text: 'Steady Progress',    cls: 'status-mid',   bar: 50  };
  if (score < 3.35) return { text: 'Commendable',        cls: 'status-good',  bar: 70  };
  if (score < 3.9)  return { text: 'Excellent Standing', cls: 'status-great', bar: 88  };
  return               { text: 'Exceptional Merit',   cls: 'status-excel', bar: 100 };
}

/* ─── Disco Overlay ───────────────────────────────────────── */
function DiscoOverlay({ active }) {
  if (!active) return null;
  return (
    <div className="disco-overlay" aria-hidden="true">
      <div className="disco-flash d1" />
      <div className="disco-flash d2" />
      <div className="disco-flash d3" />
      <div className="disco-text">🎉 CGPA {'>'} 3.35 — EXCEPTIONAL! 🎉</div>
    </div>
  );
}

/* ─── Theme Toggle ────────────────────────────────────────── */
function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="theme-toggle-btn" onClick={onToggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
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

/* ═══════════════════════════════════════════════════════════
   MOBILE ENTRY CARD — compact two-row layout
   Row 1: #01  [    subject name input              ]
   Row 2: Grade [A▾]   Credit Hrs [1][2][3]   [🗑]
═══════════════════════════════════════════════════════════ */
function EntryCard({ item, index, isGpa, onUpdate, onRemove, canRemove, theme }) {
  const isLight = theme === 'light';
  
  const S = {
    card: {
      background: isLight ? '#ffffff' : '#151515',
      border: isLight ? '1px solid #dddddd' : '1px solid #2a2a2a',
      borderRadius: 16,
      padding: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      position: 'relative',
      zIndex: 10,
    },
    top: { display: 'flex', alignItems: 'center', gap: 10 },
    num: {
      fontFamily: 'monospace', fontSize: 11,
      color: '#e51d2a', background: isLight ? '#f5f5f5' : 'rgba(0,0,0,0.2)',
      padding: '4px 6px', borderRadius: 4
    },
    name: {
      flex: 1, background: 'transparent', border: 'none',
      borderBottom: isLight ? '1px solid #dddddd' : '1px solid #333',
      color: isLight ? '#111' : '#f0f0f0',
      fontSize: 14, padding: '4px 0', outline: 'none'
    },
    bottom: { display: 'flex', alignItems: 'flex-end', gap: 12 },
    field: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1 },
    lbl: { fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', color: '#666', textTransform: 'uppercase' },
    input: {
      background: isLight ? '#f5f5f5' : '#1a1a1a',
      border: isLight ? '1px solid #dddddd' : '1px solid #333',
      color: isLight ? '#111' : '#f0f0f0',
      borderRadius: 6, padding: 8, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box'
    },
    pills: { display: 'flex', gap: 4 },
    pill: (active) => ({
      flex: 1, background: active ? '#e51d2a' : (isLight ? '#f5f5f5' : '#1a1a1a'),
      border: active ? '1px solid #e51d2a' : (isLight ? '1px solid #ddd' : '1px solid #333'),
      color: active ? '#fff' : '#666',
      borderRadius: 6, padding: '6px 0', fontSize: 12, fontWeight: 600,
      cursor: 'pointer', textAlign: 'center'
    }),
    del: {
      width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'transparent', border: isLight ? '1px solid #ccc' : '1px solid #333',
      borderRadius: 6, color: '#666', cursor: 'pointer', flexShrink: 0
    }
  };

  return (
    <div style={S.card}>
      {/* Row 1: number badge + name input */}
      <div style={S.top}>
        <span style={S.num}>#{String(index + 1).padStart(2, '0')}</span>
        <input
          type="text"
          style={S.name}
          value={item.name}
          placeholder={isGpa ? 'Subject name...' : 'Term name...'}
          onChange={e => onUpdate(item.id, 'name', e.target.value)}
        />
      </div>

      {/* Row 2: grade | credit pills | delete */}
      <div style={S.bottom}>
        <div style={S.field}>
          <span style={S.lbl}>{isGpa ? 'Grade' : 'GPA'}</span>
          {isGpa ? (
            <select style={S.input} value={item.grade}
              onChange={e => onUpdate(item.id, 'grade', e.target.value)}>
              {Object.keys(GRADE_SCALE).map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          ) : (
            <input type="number" style={S.input}
              step="0.01" min="0" max="4" placeholder="0.00"
              value={item.gpa}
              onChange={e => onUpdate(item.id, 'gpa', e.target.value)} />
          )}
        </div>

        <div style={S.field}>
          <span style={S.lbl}>Credit Hrs</span>
          {isGpa ? (
            <div style={S.pills}>
              {[1, 2, 3].map(n => (
                <button key={n} type="button"
                  style={S.pill(Number(item.credits) === n)}
                  onClick={() => onUpdate(item.id, 'credits', n)}
                  aria-label={`${n} credit hour`}
                >{n}</button>
              ))}
            </div>
          ) : (
            <input type="number" style={S.input}
              min="1" placeholder="e.g. 15"
              value={item.credits}
              onChange={e => onUpdate(item.id, 'credits', Math.max(1, Number(e.target.value)))} />
          )}
        </div>

        {canRemove ? (
          <button type="button" style={S.del}
            onClick={() => onRemove(item.id)} aria-label="Delete subject">
            <X size={15} />
          </button>
        ) : (
          <div style={{ width: 34 }} />
        )}
      </div>
    </div>
  );
}

/* ─── Result Bottom Sheet (mobile) ───────────────────────── */
function ResultSheet({ show, onClose, score, label, feedback, totalCredits, scalePercent }) {
  if (!show) return null;
  const letterGrade = score >= 3.9 ? 'A+' : score >= 3.5 ? 'A' : score >= 3.0 ? 'B' : score >= 2.0 ? 'C' : 'D';
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="result-sheet" role="dialog" aria-modal="true">
        <div className="sheet-handle" />
        <div className="sheet-body">
          <p className="sheet-label">{label}</p>
          <div className="sheet-score">{score.toFixed(2)}</div>
          <p className="sheet-scale">out of 4.00</p>
          <div className="sheet-bar-track">
            <div className={`sheet-bar-fill ${feedback.cls}`} style={{ width: `${feedback.bar}%` }} />
          </div>
          <div className={`sheet-status ${feedback.cls}`}>{feedback.text}</div>
          <div className="sheet-stats">
            <div className="sheet-stat">
              <span className="sheet-stat-label">Credits</span>
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
              <span className="sheet-stat-value" style={{ color: 'var(--accent)' }}>{letterGrade}</span>
            </div>
          </div>
          <button className="sheet-close-btn" onClick={onClose}><X size={14} /> Close</button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [activeTab, setActiveTab]     = useState('gpa');
  const [showResult, setShowResult]   = useState(false);
  const [discoActive, setDiscoActive] = useState(false);
  const [theme, setTheme]             = useState(() => localStorage.getItem('umt_theme') || 'dark');
  const [toast, setToast]             = useState(null);

  const [subjects, setSubjects] = useState(() => {
    try { const p = JSON.parse(localStorage.getItem('umt_gpa_subjects')); return (p && p.length > 0) ? p : getInitialSubject(); }
    catch { return getInitialSubject(); }
  });

  const [semesters, setSemesters] = useState(() => {
    try { const p = JSON.parse(localStorage.getItem('umt_cgpa_semesters')); return (p && p.length > 0) ? p : getInitialSemester(); }
    catch { return getInitialSemester(); }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('umt_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), []);

  useEffect(() => { localStorage.setItem('umt_gpa_subjects',   JSON.stringify(subjects));  }, [subjects]);
  useEffect(() => { localStorage.setItem('umt_cgpa_semesters', JSON.stringify(semesters)); }, [semesters]);
  useEffect(() => { setShowResult(false); }, [activeTab]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addSubject    = () => { if (subjects.length >= 10) return showToast('Max 10 subjects', 'error'); setSubjects(p => [...p, { id: Date.now(), name: '', credits: 3, grade: 'A' }]); };
  const updateSubject = (id, f, v) => setSubjects(p => p.map(s => s.id === id ? { ...s, [f]: v } : s));
  const removeSubject = (id) => { if (subjects.length <= 1) return showToast('At least 1 subject required', 'error'); setSubjects(p => p.filter(s => s.id !== id)); };

  const addSemester    = () => { if (semesters.length >= 10) return showToast('Max 10 semesters', 'error'); setSemesters(p => [...p, { id: Date.now(), name: `Semester ${semesters.length + 1}`, gpa: '', credits: 15 }]); };
  const updateSemester = (id, f, v) => setSemesters(p => p.map(s => s.id === id ? { ...s, [f]: v } : s));
  const removeSemester = (id) => { if (semesters.length <= 1) return showToast('At least 1 semester required', 'error'); setSemesters(p => p.filter(s => s.id !== id)); };

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

  const handleCalculate = () => {
    setShowResult(true);
    showToast('Calculation complete');
    if (currentScore > 3.35) {
      setDiscoActive(true);
      setTimeout(() => setDiscoActive(false), 2200);
    }
  };

  /* ── inline style helpers ───────────────────────────────── */
  const S = {
    addBtn: {
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      width: 'calc(100% - 28px)', margin: '12px 14px 0', padding: '16px 20px',
      background: '#e51d2a', border: 'none', borderRadius: 12,
      color: '#ffffff', fontSize: 14, fontWeight: 700,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
      boxShadow: '0 4px 16px rgba(229,29,42,0.35)',
    },
    entryWrap: { position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: 10, margin: '12px 14px 0' },
    addBadge: {
      marginLeft: 'auto', fontSize: 10, fontWeight: 600,
      background: 'rgba(0,0,0,0.25)', padding: '3px 8px',
      borderRadius: 5, color: 'rgba(255,255,255,0.8)',
    },
    entryWrap: { display: 'flex', flexDirection: 'column', gap: 10, margin: '12px 14px 0' },
    rowHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
    rowLabel:  { fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#888888' },
    resetBtn:  { display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: 'transparent', border: '1px solid #555', borderRadius: 6, color: '#888888', fontSize: 11, cursor: 'pointer' },
  };

  return (
    <>
      <BackgroundCanvas />
      <Toast toast={toast} />
      <DiscoOverlay active={discoActive} />
      <ResultSheet show={showResult} onClose={() => setShowResult(false)}
        score={currentScore} label={isGpa ? 'Semester GPA' : 'Cumulative GPA'}
        feedback={feedback} totalCredits={totalCredits} scalePercent={scalePercent} />

      {/* ══ DESKTOP ══════════════════════════════════════════ */}
      <div className="desktop-wrapper">
        <div className="page-wrapper">
          <header className="site-header anim-fade-up">
            <div className="header-brand">
              <h1 className="header-title">UMT GPA / CGPA Calculator</h1>
              <p className="header-subtitle">Official (AI-Assisted) Grading System</p>
            </div>
            <div className="header-actions">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <a href="https://github.com/uusaff" target="_blank" rel="noopener noreferrer"
                 className="header-user" aria-label="GitHub – UUSAFF">
                <span>UUSAFF</span>
                <Github size={15} />
              </a>
            </div>
          </header>

          <div className="main-grid">
            <div className="card anim-fade-up anim-delay-1" id="calculator-card">
              <div className="tabs" role="tablist">
                <button role="tab" aria-selected={isGpa} id="tab-gpa"
                  className={`tab-btn ${isGpa ? 'active' : ''}`} onClick={() => setActiveTab('gpa')}>
                  <BookOpen size={14} /> Semester GPA
                </button>
                <button role="tab" aria-selected={!isGpa} id="tab-cgpa"
                  className={`tab-btn ${!isGpa ? 'active' : ''}`} onClick={() => setActiveTab('cgpa')}>
                  <GraduationCap size={14} /> Cumulative GPA
                </button>
              </div>

              <div className="card-body">
                <div className="controls-row">
                  <div className="controls-left">
                    <button id="btn-add-entry" className="btn-secondary"
                      onClick={isGpa ? addSubject : addSemester}>
                      <Plus size={14} className="btn-icon-accent" />
                      Add {isGpa ? 'Entry' : 'Term'}
                    </button>
                    <span className="count-badge" aria-live="polite">{count}/10</span>
                  </div>
                  <div className="controls-right">
                    <button id="btn-reset" className="btn-ghost" onClick={resetData}>
                      <RotateCcw size={13} /> Reset
                    </button>
                    <button id="btn-export" className="btn-primary" onClick={() => window.print()}>
                      <Download size={13} /> Export
                    </button>
                  </div>
                </div>

                <div className="data-table-wrapper">
                  <table className="data-table">
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
                          <td style={{ paddingRight: '12px' }}>
                            <input type="text" className="field-input" value={item.name}
                              placeholder={isGpa ? 'e.g. Data Structures' : 'e.g. Fall 2024'}
                              onChange={e => isGpa ? updateSubject(item.id, 'name', e.target.value) : updateSemester(item.id, 'name', e.target.value)} />
                          </td>
                          <td style={{ paddingRight: '12px' }}>
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
                          <td style={{ paddingRight: '12px' }}>
                            <input type="number" className="field-input" min="1" max={isGpa ? "3" : "100"} value={item.credits}
                              onChange={e => {
                                const maxVal = isGpa ? 3 : 100;
                                const v = Math.max(1, Math.min(maxVal, Number(e.target.value)));
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

            <div className="right-panel">
              <div className="side-card anim-fade-up anim-delay-2" id="calculate-card">
                {!showResult ? (
                  <div className="anim-reveal">
                    <div className="side-card-icon"><Award size={20} strokeWidth={1.5} /></div>
                    <h2 className="side-card-title">Ready?</h2>
                    <p className="side-card-desc">Fill in your {isGpa ? 'subjects and grades' : 'semester GPAs'} and hit calculate.</p>
                    <button id="btn-calculate" className="btn-primary btn-primary-full" onClick={handleCalculate}>
                      Calculate
                    </button>
                  </div>
                ) : (
                  <div className="anim-reveal">
                    <p className="result-label">{isGpa ? 'Semester GPA' : 'Cumulative GPA'}</p>
                    <div className="result-score">{currentScore.toFixed(2)}</div>
                    <div className="result-bar-track">
                      <div className={`result-bar-fill ${feedback.cls}`} style={{ width: `${feedback.bar}%` }} />
                    </div>
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
                    <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => setShowResult(false)}>Edit Data</button>
                  </div>
                )}
              </div>

              <div className="side-card anim-fade-up anim-delay-3" id="exams-card">
                <div className="side-card-icon"><Calendar size={20} strokeWidth={1.5} /></div>
                <h3 className="side-card-title">Exams Approaching?</h3>
                <p className="side-card-desc">Organize and track midterms and finals with the dedicated AI-assisted exam tracker.</p>
                <a href="https://usafs-tracker.vercel.app/" target="_blank" rel="noopener noreferrer"
                   className="btn-primary btn-primary-full" id="link-exams-tracker">
                  <ArrowRight size={13} /> Load Exams Tracker
                </a>
              </div>

              <div className="side-card anim-fade-up anim-delay-4" id="habits-card">
                <div className="side-card-icon"><Activity size={20} strokeWidth={1.5} /></div>
                <h3 className="side-card-title">Optimize Behavior</h3>
                <p className="side-card-desc">Track core objectives and maintain consistency with the habit-building module.</p>
                <a href="https://habit-tracker-nine-mu.vercel.app/" target="_blank" rel="noopener noreferrer"
                   className="btn-primary btn-primary-full" id="link-habits-tracker">
                  <ArrowRight size={13} /> Load Habits Tracker
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MOBILE ═══════════════════════════════════════════ */}
      <div className="mobile-wrapper">

        {/* Fixed header */}
        <header className="mobile-header">
          <div className="mobile-header-left">
            <h1 className="mobile-title">UMT Calculator</h1>
            <p className="mobile-subtitle">GPA / CGPA</p>
          </div>
          <div className="mobile-header-right">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <a href="https://github.com/uusaff" target="_blank" rel="noopener noreferrer"
               className="mobile-github-btn" aria-label="GitHub">
              <Github size={15} />
              <span>UUSAFF</span>
            </a>
          </div>
        </header>

        {/* Fixed add-subject bar — position:fixed, always visible */}
        <div className="mobile-add-bar">
          <button
            onClick={isGpa ? addSubject : addSemester}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '12px 16px', background: 'transparent', border: 'none',
              color: '#ffffff', fontSize: 14, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Plus size={18} color="#ffffff" strokeWidth={2.5} />
            Add {isGpa ? 'Subject' : 'Term'}
            <span style={{ fontSize: 11, background: 'rgba(0,0,0,0.25)', padding: '2px 8px', borderRadius: 4, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
              {count}/10
            </span>
          </button>
        </div>


        <main className="mobile-main">

          {/* ── Score ticker ── */}
          <div className="mobile-score-ticker">
            <div className="ticker-inner">
              <span className="ticker-label">{isGpa ? 'SEMESTER GPA' : 'CUMULATIVE GPA'}</span>
              <span className="ticker-score">{currentScore.toFixed(2)}</span>
              <span className={`ticker-status ${feedback.cls}`}>{feedback.text}</span>
            </div>
            <div className="ticker-bar-track">
              <div className={`ticker-bar-fill ${feedback.cls}`} style={{ width: `${feedback.bar}%` }} />
            </div>
          </div>

          {/* ── Entry cards ── */}
          <div style={S.entryWrap}>
            <div style={S.rowHeader}>
              <span style={S.rowLabel}>
                {count} {isGpa ? 'subject' : 'semester'}{count !== 1 ? 's' : ''}
              </span>
              <button onClick={resetData} style={S.resetBtn}>
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            {items.map((item, idx) => (
              <EntryCard key={item.id} item={item} index={idx} isGpa={isGpa}
                onUpdate={isGpa ? updateSubject : updateSemester}
                onRemove={isGpa ? removeSubject : removeSemester}
                canRemove={count > 1} theme={theme} />
            ))}
          </div>

          {/* ── Tracker links — below entries, scroll to see ── */}
          <section className="mobile-quick-links" style={{ marginTop: 32 }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#666', marginBottom: 10 }}>
              More Tools
            </p>
            <a href="https://usafs-tracker.vercel.app/" target="_blank" rel="noopener noreferrer"
               className="quick-link-card" id="mobile-link-exams">
              <div className="quick-link-icon"><Calendar size={18} strokeWidth={1.5} /></div>
              <div className="quick-link-content">
                <span className="quick-link-title">Exams Tracker</span>
                <span className="quick-link-sub">Track midterms &amp; finals</span>
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

          <div style={{ height: '150px' }} />
        </main>

        {/* Bottom nav */}
        <nav className="mobile-bottom-nav" aria-label="Calculator mode">
          <button className={`mobile-nav-btn ${isGpa ? 'active' : ''}`}
            id="mobile-tab-gpa" onClick={() => setActiveTab('gpa')} aria-selected={isGpa}>
            <BookOpen size={18} />
            <span>Semester</span>
          </button>

          <button className="mobile-nav-fab" id="mobile-btn-calculate"
            onClick={handleCalculate} aria-label="Calculate GPA">
            <TrendingUp size={20} />
          </button>

          <button className={`mobile-nav-btn ${!isGpa ? 'active' : ''}`}
            id="mobile-tab-cgpa" onClick={() => setActiveTab('cgpa')} aria-selected={!isGpa}>
            <GraduationCap size={18} />
            <span>Cumulative</span>
          </button>
        </nav>
      </div>
    </>
  );
}