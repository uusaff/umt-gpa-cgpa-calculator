import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, RotateCcw, Download, BookOpen, GraduationCap, CheckCircle2, AlertCircle, PartyPopper } from 'lucide-react';
import CosmicDust from './CosmicDust';

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
    if (score < 2.0) return { text: "Ask to work harder 📚", color: "text-red-400" };
    if (score < 3.0) return { text: "Lil work needed 🛠️", color: "text-orange-400" };
    if (score < 3.5) return { text: "Can be increased 💪", color: "text-yellow-400" };
    if (score < 3.9) return { text: "Nailed it! 🔥", color: "text-emerald-400" };
    return { text: "Hey king you dropped this 👑", color: "text-purple-400 font-bold tracking-wide" };
  };

  const addSubject = () => {
    if (subjects.length >= 10) return showToast('Maximum 10 subjects allowed!', 'error');
    setSubjects([...subjects, { id: Date.now(), name: '', credits: 3, grade: 'A' }]);
  };

  const updateSubject = (id, field, value) => {
    setSubjects(subjects.map(sub => sub.id === id ? { ...sub, [field]: value } : sub));
  };

  const removeSubject = (id) => {
    if (subjects.length <= 1) return showToast('At least 1 subject is required!', 'error');
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
    if (semesters.length >= 10) return showToast('Maximum 10 semesters allowed!', 'error');
    setSemesters([...semesters, { id: Date.now(), name: `Semester ${semesters.length + 1}`, gpa: '', credits: 15 }]);
  };

  const updateSemester = (id, field, value) => {
    setSemesters(semesters.map(sem => sem.id === id ? { ...sem, [field]: value } : sem));
  };

  const removeSemester = (id) => {
    if (semesters.length <= 1) return showToast('At least 1 semester is required!', 'error');
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
    showToast('Data has been reset');
  };

  const currentScore = activeTab === 'gpa' ? gpaStats.gpa : cgpaStats.cgpa;
  const feedback = getFeedbackMessage(currentScore);

  return (
    <>
      {/* 3D Cosmic Dust Background fixed perfectly behind the Application */}
      <CosmicDust />

      <div className={`min-h-screen relative p-4 md:p-8 font-sans text-slate-100 selection:bg-purple-500/30 overflow-hidden ${showResult ? 'bg-slate-950/70' : 'bg-transparent'} transition-colors duration-1000 pointer-events-none`}>
        
        {/* We re-enable pointer events for the UI overlay itself */}
        <div className="max-w-5xl mx-auto relative z-10 pointer-events-auto">
          
          {toast && (
            <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 backdrop-blur-md text-white px-4 py-3 rounded-lg shadow-xl animate-in slide-in-from-top-5 print:hidden ${toast.type === 'error' ? 'bg-red-500/90' : 'bg-emerald-500/90'}`}>
              {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
              <span className="font-medium">{toast.message}</span>
            </div>
          )}

          <div className="relative text-center mb-10 print:text-black print:mb-6 flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-300 print:text-black">
              UMT Academic Calculator
            </h1>
            <p className="text-slate-300 print:text-slate-700">Official UMT Grading Criteria Supported</p>
          </div>

          <div className={`bg-slate-900/40 backdrop-blur-xl border rounded-3xl shadow-2xl overflow-hidden transition-all duration-700 print:bg-white print:border-none print:shadow-none print:text-black ${showResult ? 'border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3)]' : 'border-white/10'}`}>
            
            <div className="flex border-b border-white/10 print:hidden">
              <button
                onClick={() => setActiveTab('gpa')}
                className={`flex-1 py-4 flex items-center justify-center gap-2 font-semibold transition-all ${
                  activeTab === 'gpa' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <BookOpen size={20} /> Semester GPA
              </button>
              <button
                onClick={() => setActiveTab('cgpa')}
                className={`flex-1 py-4 flex items-center justify-center gap-2 font-semibold transition-all ${
                  activeTab === 'cgpa' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <GraduationCap size={20} /> Cumulative GPA
              </button>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex flex-wrap justify-between items-center mb-8 gap-4 print:hidden">
                <button
                  onClick={activeTab === 'gpa' ? addSubject : addSemester}
                  className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20"
                >
                  <Plus size={18} /> Add {activeTab === 'gpa' ? 'Subject' : 'Semester'}
                  <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full ml-1">
                    {activeTab === 'gpa' ? subjects.length : semesters.length}/10
                  </span>
                </button>
                
                <div className="flex gap-3">
                  <button onClick={resetData} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl transition-colors border border-white/10">
                    <RotateCcw size={18} /> Reset
                  </button>
                  <button onClick={() => window.print()} className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-purple-500/20">
                    <Download size={18} /> Export PDF
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* GPA VIEW */}
                  {activeTab === 'gpa' && (
                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20 print:border-slate-300 print:bg-transparent">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-black/30 print:bg-slate-100 print:text-black">
                            <th className="p-4 font-semibold w-1/2">Subject Name</th>
                            <th className="p-4 font-semibold">Cr. Hours</th>
                            <th className="p-4 font-semibold">Grade</th>
                            <th className="p-4 font-semibold text-center print:hidden">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 print:divide-slate-200">
                          {subjects.map((sub) => (
                            <tr key={sub.id} className="group hover:bg-white/5 transition-colors print:text-black">
                              <td className="p-3">
                                <input
                                  type="text"
                                  placeholder="e.g. Programming"
                                  value={sub.name}
                                  onChange={(e) => updateSubject(sub.id, 'name', e.target.value)}
                                  className="w-full bg-transparent border-b border-transparent focus:border-indigo-400 outline-none px-2 py-1 transition-colors print:border-none"
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  min="1" max="6"
                                  value={sub.credits}
                                  onChange={(e) => updateSubject(sub.id, 'credits', Math.max(1, e.target.value))}
                                  className="w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 print:bg-transparent print:border-none"
                                />
                              </td>
                              <td className="p-3">
                                <select
                                  value={sub.grade}
                                  onChange={(e) => updateSubject(sub.id, 'grade', e.target.value)}
                                  className="w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none print:bg-transparent print:border-none print:appearance-auto"
                                >
                                  {Object.keys(GRADE_SCALE).map(grade => (
                                    <option key={grade} value={grade}>{grade}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-3 text-center print:hidden">
                                {subjects.length > 1 && (
                                  <button onClick={() => removeSubject(sub.id)} className="text-slate-400 hover:text-red-400 transition-colors p-2">
                                    <Trash2 size={18} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* CGPA VIEW */}
                  {activeTab === 'cgpa' && (
                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20 print:border-slate-300 print:bg-transparent">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-black/30 print:bg-slate-100 print:text-black">
                            <th className="p-4 font-semibold w-2/5">Semester Name</th>
                            <th className="p-4 font-semibold">GPA</th>
                            <th className="p-4 font-semibold">Cr. Hours</th>
                            <th className="p-4 font-semibold text-center print:hidden">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 print:divide-slate-200">
                          {semesters.map((sem) => (
                            <tr key={sem.id} className="group hover:bg-white/5 transition-colors print:text-black">
                              <td className="p-3">
                                <input
                                  type="text"
                                  placeholder="e.g. Semester 1"
                                  value={sem.name}
                                  onChange={(e) => updateSemester(sem.id, 'name', e.target.value)}
                                  className="w-full bg-transparent border-b border-transparent focus:border-indigo-400 outline-none px-2 py-1 transition-colors print:border-none"
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  step="0.01" min="0" max="4"
                                  placeholder="0.00"
                                  value={sem.gpa}
                                  onChange={(e) => updateSemester(sem.id, 'gpa', e.target.value)}
                                  className="w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 print:bg-transparent print:border-none"
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  min="1"
                                  value={sem.credits}
                                  onChange={(e) => updateSemester(sem.id, 'credits', e.target.value)}
                                  className="w-full bg-slate-800/80 border border-white/10 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 print:bg-transparent print:border-none"
                                />
                              </td>
                              <td className="p-3 text-center print:hidden">
                                {semesters.length > 1 && (
                                  <button onClick={() => removeSemester(sem.id)} className="text-slate-400 hover:text-red-400 transition-colors p-2">
                                    <Trash2 size={18} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-1">
                  <div className={`bg-slate-800/40 border border-white/10 rounded-3xl p-1 transition-all duration-700 ${showResult ? 'shadow-[0_0_40px_rgba(99,102,241,0.3)]' : 'shadow-2xl'} print:bg-none print:shadow-none print:border-none print:p-0`}>
                    <div className="bg-slate-900/80 backdrop-blur-md rounded-[22px] p-6 h-full print:bg-transparent print:border print:border-slate-300 flex flex-col justify-center">
                      
                      {!showResult ? (
                        <div className="text-center py-10 print:hidden">
                          <PartyPopper size={48} className="mx-auto mb-4 text-indigo-400 opacity-80" />
                          <h2 className="text-xl font-bold mb-2 text-white">Ready for your result?</h2>
                          <p className="text-slate-400 text-sm mb-6">Enter all your grades and hit the button below.</p>
                          
                          <button 
                            onClick={() => {
                              setShowResult(true);
                              showToast("Calculated Successfully!", "success");
                            }}
                            className="w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105 active:scale-95"
                          >
                            Calculate Result
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6 animate-in zoom-in-95 duration-500">
                          <h2 className="text-xl font-bold text-white print:text-black">Results Dashboard</h2>

                          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center animate-bounce">
                            <p className={`text-xl ${feedback.color}`}>
                              {feedback.text}
                            </p>
                          </div>

                          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 print:border-slate-200 print:bg-slate-50">
                            <div className="text-slate-400 text-sm font-medium mb-1 print:text-slate-600">
                              {activeTab === 'gpa' ? 'Total Semester GPA' : 'Cumulative GPA'}
                            </div>
                            <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 print:text-black">
                              {activeTab === 'gpa' ? gpaStats.gpa.toFixed(2) : cgpaStats.cgpa.toFixed(2)}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 print:border-slate-200 print:bg-slate-50 print:text-black">
                              <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 print:text-slate-600">Total Credits</div>
                              <div className="text-2xl font-bold">
                                {activeTab === 'gpa' ? gpaStats.totalCredits : cgpaStats.totalCredits}
                              </div>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 print:border-slate-200 print:bg-slate-50 print:text-black">
                              <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 print:text-slate-600">Percentage</div>
                              <div className="text-2xl font-bold">
                                {activeTab === 'gpa' 
                                  ? ((gpaStats.gpa / 4) * 100).toFixed(1) 
                                  : ((cgpaStats.cgpa / 4) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => setShowResult(false)}
                            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors print:hidden border border-white/10"
                          >
                            Edit Grades
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}