import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, RotateCcw, Download, BookOpen, GraduationCap, CheckCircle2, AlertCircle, Award, Calendar, ExternalLink, Github, Activity } from 'lucide-react';

const GRADE_SCALE = {
  'A': 4.00, 'A-': 3.70, 'B+': 3.30, 'B': 3.00, 'B-': 2.70,
  'C+': 2.30, 'C': 2.00, 'C-': 1.70, 'D+': 1.30, 'D': 1.00, 'F': 0.00
};

const getInitialSubject = () => [{ id: Date.now(), name: '', credits: 3, grade: 'A' }];
const getInitialSemester = () => [{ id: Date.now(), name: 'Semester 1', gpa: '', credits: 15 }];

export default function App() {
  const [activeTab, setActiveTab] = useState('gpa');
  const [showResult, setShowResult] = useState(false);
  
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('umt_gpa_subjects');
    const parsed = saved ? JSON.parse(saved) : null;
    return (parsed && parsed.length > 0) ? parsed : getInitialSubject();
  });
  
  const [semesters, setSemesters] = useState(() => {
    const saved = localStorage.getItem('umt_cgpa_semesters');
    const parsed = saved ? JSON.parse(saved) : null;
    return (parsed && parsed.length > 0) ? parsed : getInitialSemester();
  });
  
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('umt_gpa_subjects', JSON.stringify(subjects));
    localStorage.setItem('umt_cgpa_semesters', JSON.stringify(semesters));
    setShowResult(false);
  }, [subjects, semesters, activeTab]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getFeedbackMessage = (score) => {
    if (score < 2.0) return { text: "Requires Attention", color: "text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]" };
    if (score < 3.0) return { text: "Steady Progress", color: "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" };
    if (score < 3.5) return { text: "Commendable", color: "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" };
    if (score < 3.9) return { text: "Excellent Standing", color: "text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" };
    return { text: "Exceptional Merit", color: "text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 font-bold italic tracking-wide drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]" };
  };

  const addSubject = () => {
    if (subjects.length >= 10) return showToast('Maximum 10 subjects allowed', 'error');
    setSubjects([...subjects, { id: Date.now(), name: '', credits: 3, grade: 'A' }]);
  };

  const updateSubject = (id, field, value) => {
    setSubjects(subjects.map(sub => sub.id === id ? { ...sub, [field]: value } : sub));
  };

  const removeSubject = (id) => {
    if (subjects.length <= 1) return showToast('At least 1 subject is required', 'error');
    setSubjects(subjects.filter(sub => sub.id !== id));
  };

  const gpaStats = useMemo(() => {
    let totalCredits = 0;
    let totalQualityPoints = 0;
    subjects.forEach(sub => {
      const credits = Number(sub.credits) || 0;
      const points = (GRADE_SCALE[sub.grade] || 0) * credits;
      totalCredits += credits;
      totalQualityPoints += points;
    });
    return { totalCredits, totalQualityPoints, gpa: totalCredits > 0 ? (totalQualityPoints / totalCredits) : 0 };
  }, [subjects]);

  const addSemester = () => {
    if (semesters.length >= 10) return showToast('Maximum 10 semesters allowed', 'error');
    setSemesters([...semesters, { id: Date.now(), name: `Semester ${semesters.length + 1}`, gpa: '', credits: 15 }]);
  };

  const updateSemester = (id, field, value) => {
    setSemesters(semesters.map(sem => sem.id === id ? { ...sem, [field]: value } : sem));
  };

  const removeSemester = (id) => {
    if (semesters.length <= 1) return showToast('At least 1 semester is required', 'error');
    setSemesters(semesters.filter(sem => sem.id !== id));
  };

  const cgpaStats = useMemo(() => {
    let totalCredits = 0;
    let totalQualityPoints = 0;
    semesters.forEach(sem => {
      const credits = Number(sem.credits) || 0;
      const gpa = Number(sem.gpa) || 0;
      totalCredits += credits;
      totalQualityPoints += (gpa * credits);
    });
    return { totalCredits, cgpa: totalCredits > 0 ? (totalQualityPoints / totalCredits) : 0 };
  }, [semesters]);

  const resetData = () => {
    if (activeTab === 'gpa') setSubjects(getInitialSubject());
    else setSemesters(getInitialSemester());
    setShowResult(false);
    showToast('Registry cleared');
  };

  const currentScore = activeTab === 'gpa' ? gpaStats.gpa : cgpaStats.cgpa;
  const feedback = getFeedbackMessage(currentScore);

  // Futuristic Glassmorphism Style
  const glassBoxStyle = "bg-slate-900/40 backdrop-blur-2xl rounded-[18px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(99,102,241,0.2)] hover:border-indigo-500/30 relative overflow-hidden";

  return (
    <div className="min-h-screen font-sans p-4 md:p-8 selection:bg-cyan-500/30 selection:text-cyan-100 relative overflow-hidden">
      
      {/* 1. Blurred Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-fixed blur-[10px] scale-110"
        style={{ backgroundImage: "url('/3550405.jpg')" }}
      ></div>
      
      {/* 2. Dark Overlay to ensure glass UI pops and remains readable */}
      <div className="absolute inset-0 z-0 bg-[#060913]/75"></div>

      {/* 3. Original Ambient Glows (Moved to z-0 so they blend nicely) */}
      <div className="absolute z-0 top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-700/30 blur-[140px] pointer-events-none"></div>
      <div className="absolute z-0 bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/30 blur-[140px] pointer-events-none"></div>
      <div className="absolute z-0 top-[30%] left-[40%] w-[30%] h-[30%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        
        <a 
          href="https://github.com/uusaff" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="absolute top-0 right-0 mt-2 mr-2 md:mt-0 md:mr-0 flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] z-50 group"
        >
          <span className="font-semibold text-sm hidden sm:block tracking-widest uppercase group-hover:text-cyan-400 transition-colors">uusaff</span>
          <Github size={22} className="group-hover:text-cyan-400 transition-colors" />
        </a>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-slate-800/80 backdrop-blur-xl text-white px-5 py-3 rounded-[12px] shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 animate-in slide-in-from-top-4 fade-in duration-300 print:hidden">
            {toast.type === 'error' ? (
              <AlertCircle size={18} className="text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
            ) : (
              <CheckCircle2 size={18} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            )}
            <span className="font-medium tracking-wide text-sm">{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12 flex flex-col items-center pt-8">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 drop-shadow-[0_0_25px_rgba(56,189,248,0.3)]">
            UMT GPA / CGPA Calculator
          </h1>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mb-5"></div>
          <p className="text-cyan-400/80 uppercase tracking-[0.3em] text-xs font-bold drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
            Official (AI-Assisted) Grading System
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          <div className={`lg:col-span-2 ${glassBoxStyle}`}>
            
            {/* Tabs */}
            <div className="flex border-b border-white/5 relative z-10 print:hidden bg-slate-900/40">
              <button
                onClick={() => setActiveTab('gpa')}
                className={`flex-1 py-5 flex items-center justify-center gap-2 text-sm uppercase tracking-widest font-bold transition-all duration-300 ${
                  activeTab === 'gpa' 
                    ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/40 shadow-[inset_0_-2px_15px_rgba(34,211,238,0.15)]' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/20'
                }`}
              >
                <BookOpen size={16} className={activeTab === 'gpa' ? "drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" : ""} /> Semester GPA
              </button>
              <button
                onClick={() => setActiveTab('cgpa')}
                className={`flex-1 py-5 flex items-center justify-center gap-2 text-sm uppercase tracking-widest font-bold transition-all duration-300 ${
                  activeTab === 'cgpa' 
                    ? 'text-purple-400 border-b-2 border-purple-400 bg-slate-800/40 shadow-[inset_0_-2px_15px_rgba(192,132,252,0.15)]' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/20'
                }`}
              >
                <GraduationCap size={16} className={activeTab === 'cgpa' ? "drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" : ""} /> Cumulative GPA
              </button>
            </div>

            <div className="p-6 md:p-8 relative z-10">
              
              <div className="flex flex-wrap justify-between items-center mb-8 gap-4 print:hidden">
                <button
                  onClick={activeTab === 'gpa' ? addSubject : addSemester}
                  className="group flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/60 text-slate-300 hover:text-white px-5 py-2.5 rounded-[12px] text-sm font-semibold transition-all border border-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] backdrop-blur-md"
                >
                  <Plus size={16} className="text-cyan-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all" /> 
                  Add {activeTab === 'gpa' ? 'Entry' : 'Term'}
                  <span className="text-[10px] font-bold text-cyan-300 bg-slate-900/80 px-2 py-0.5 rounded-full ml-2 border border-cyan-500/30">
                    {activeTab === 'gpa' ? subjects.length : semesters.length}/10
                  </span>
                </button>
                
                <div className="flex gap-3">
                  <button onClick={resetData} className="flex items-center gap-2 bg-transparent hover:bg-pink-500/10 text-slate-400 hover:text-pink-400 px-4 py-2.5 rounded-[12px] text-sm font-semibold transition-all border border-transparent hover:border-pink-500/40 hover:shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                    <RotateCcw size={16} /> Reset
                  </button>
                  <button onClick={() => window.print()} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-[12px] text-sm font-semibold transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] border border-purple-400/30">
                    <Download size={16} /> Export
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="pb-4 font-bold text-slate-500 uppercase tracking-widest text-xs border-b border-white/10 w-1/2">
                        {activeTab === 'gpa' ? 'Subject Name' : 'Term Designation'}
                      </th>
                      <th className="pb-4 font-bold text-slate-500 uppercase tracking-widest text-xs border-b border-white/10">
                        {activeTab === 'gpa' ? 'Grade' : 'GPA'}
                      </th>
                      <th className="pb-4 font-bold text-slate-500 uppercase tracking-widest text-xs border-b border-white/10">
                        Credits
                      </th>
                      <th className="pb-4 font-bold text-slate-500 uppercase tracking-widest text-xs border-b border-white/10 text-center print:hidden">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(activeTab === 'gpa' ? subjects : semesters).map((item) => (
                      <tr key={item.id} className="group transition-colors hover:bg-white/[0.02]">
                        <td className="py-4 pr-3">
                          <input
                            type="text"
                            placeholder={activeTab === 'gpa' ? "Enter subject..." : "e.g. Fall 2023"}
                            value={item.name}
                            onChange={(e) => activeTab === 'gpa' 
                              ? updateSubject(item.id, 'name', e.target.value) 
                              : updateSemester(item.id, 'name', e.target.value)}
                            className="w-full bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-[10px] px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] outline-none transition-all print:border-none print:bg-transparent"
                          />
                        </td>
                        <td className="py-4 px-3">
                          {activeTab === 'gpa' ? (
                            <select
                              value={item.grade}
                              onChange={(e) => updateSubject(item.id, 'grade', e.target.value)}
                              className="w-full bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-[10px] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all print:appearance-auto cursor-pointer"
                            >
                              {Object.keys(GRADE_SCALE).map(grade => (
                                <option key={grade} value={grade} className="bg-slate-900">{grade}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="number"
                              step="0.01" min="0" max="4"
                              placeholder="0.00"
                              value={item.gpa}
                              onChange={(e) => updateSemester(item.id, 'gpa', e.target.value)}
                              className="w-full bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-[10px] px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all"
                            />
                          )}
                        </td>
                        <td className="py-4 px-3">
                          <input
                            type="number"
                            min="1" max="6"
                            value={item.credits}
                            onChange={(e) => activeTab === 'gpa' 
                              ? updateSubject(item.id, 'credits', Math.max(1, e.target.value))
                              : updateSemester(item.id, 'credits', Math.max(1, e.target.value))}
                            className="w-full bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-[10px] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all"
                          />
                        </td>
                        <td className="py-4 pl-3 text-center print:hidden">
                          {((activeTab === 'gpa' ? subjects : semesters).length > 1) && (
                            <button 
                              onClick={() => activeTab === 'gpa' ? removeSubject(item.id) : removeSemester(item.id)} 
                              className="text-slate-600 hover:text-pink-400 transition-all p-2 rounded-[8px] hover:bg-pink-500/10 hover:shadow-[0_0_15px_rgba(236,72,153,0.2)] hover:border hover:border-pink-500/30 border border-transparent"
                            >
                              <Trash2 size={18} />
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


          <div className="lg:col-span-1 flex flex-col gap-6">
            

            <div className={`${glassBoxStyle} p-6 group`}>
              <div className="absolute inset-2 border border-dashed border-white/10 rounded-[12px] pointer-events-none transition-colors duration-500 group-hover:border-cyan-500/30"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-center min-h-[300px]">
                {!showResult ? (
                  <div className="text-center py-4 px-2 print:hidden animate-in fade-in duration-500">
                    <div className="inline-block p-4 rounded-full bg-cyan-500/10 mb-6 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                      <Award size={40} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight mb-3 text-white">READY ?</h2>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">
                      Enter your details. Ready when you are !!
                    </p>
                    
                    <button 
                      onClick={() => {
                        setShowResult(true);
                        showToast("System compiled successfully");
                      }}
                      className="w-full py-3.5 rounded-[12px] bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_35px_rgba(34,211,238,0.5)]"
                    >
                      Calculate 
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 py-4">
                    <div className="text-center border-b border-white/10 pb-6 relative">
                      <h2 className="text-cyan-400/80 text-xs uppercase tracking-[0.2em] font-bold mb-2">
                        {activeTab === 'gpa' ? 'Term Status' : 'Cumulative Status'}
                      </h2>
                      <div className="text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-blue-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                        {activeTab === 'gpa' ? gpaStats.gpa.toFixed(2) : cgpaStats.cgpa.toFixed(2)}
                      </div>
                    </div>

                    <div className="bg-slate-900/60 backdrop-blur-md rounded-[12px] p-4 text-center border border-white/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]">
                      <p className={`text-base font-semibold ${feedback.color}`}>
                        {feedback.text}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-slate-800/30 rounded-[12px] border border-white/5 hover:border-white/10 transition-colors">
                        <div className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">Total Credits</div>
                        <div className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                          {activeTab === 'gpa' ? gpaStats.totalCredits : cgpaStats.totalCredits}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-slate-800/30 rounded-[12px] border border-white/5 hover:border-white/10 transition-colors">
                        <div className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1">Scale %</div>
                        <div className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                          {activeTab === 'gpa' 
                            ? ((gpaStats.gpa / 4) * 100).toFixed(1) 
                            : ((cgpaStats.cgpa / 4) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setShowResult(false)}
                      className="w-full mt-4 py-3 rounded-[12px] bg-transparent hover:bg-white/5 text-slate-400 hover:text-white font-semibold tracking-wide text-sm transition-all border border-white/10 hover:border-white/20 print:hidden"
                    >
                      Edit the data ?
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Widget 2: Exam Tracker Link */}
            <div className={`${glassBoxStyle} p-6 group hover:border-indigo-500/50`}>
              <div className="absolute inset-2 border border-dashed border-white/5 rounded-[12px] pointer-events-none transition-colors duration-500 group-hover:border-indigo-500/30"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-center min-h-[220px] text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors duration-500">
                  <Calendar size={28} className="text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)] group-hover:scale-110 transition-transform duration-500" strokeWidth={2} />
                </div>
                
                <h3 className="text-xl font-extrabold tracking-tight mb-2 text-white group-hover:text-indigo-100 transition-colors">Exams Approaching?</h3>
                
                <p className="text-slate-400 text-xs mb-6 leading-relaxed font-medium px-2">
                  Maintain operational supremacy. Organize and track midterms and finals with the dedicated AI tracker.
                </p>
                
                <a 
                  href="https://usafs-tracker.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-[12px] bg-indigo-500/5 hover:bg-indigo-500/20 text-indigo-300 hover:text-white font-bold text-xs uppercase tracking-widest transition-all border border-indigo-500/30 hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2"
                >
                  Load Tracker <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Widget 3: Habit Tracker Link */}
            <div className={`${glassBoxStyle} p-6 group hover:border-pink-500/50`}>
              <div className="absolute inset-2 border border-dashed border-white/5 rounded-[12px] pointer-events-none transition-colors duration-500 group-hover:border-pink-500/30"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-center min-h-[220px] text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-pink-500/10 group-hover:bg-pink-500/20 transition-colors duration-500">
                  <Activity size={28} className="text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)] group-hover:scale-110 transition-transform duration-500" strokeWidth={2} />
                </div>
                
                <h3 className="text-xl font-extrabold tracking-tight mb-2 text-white group-hover:text-pink-100 transition-colors">Optimize Behavior</h3>
                
                <p className="text-slate-400 text-xs mb-6 leading-relaxed font-medium px-2">
                  Transform routine algorithms. Track core objectives and maintain consistency with the habit module.
                </p>
                
                <a 
                  href="https://habit-tracker-nine-mu.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-[12px] bg-pink-500/5 hover:bg-pink-500/20 text-pink-300 hover:text-white font-bold text-xs uppercase tracking-widest transition-all border border-pink-500/30 hover:border-pink-400 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] flex items-center justify-center gap-2"
                >
                  Load Habits <ExternalLink size={14} />
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}