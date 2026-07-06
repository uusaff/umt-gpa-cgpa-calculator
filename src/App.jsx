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
    if (score < 2.0) return { text: "Requires Attention", color: "text-[#D8C7B4]" };
    if (score < 3.0) return { text: "Steady Progress", color: "text-[#F6F1E8]" };
    if (score < 3.5) return { text: "Commendable", color: "text-[#F6F1E8]" };
    if (score < 3.9) return { text: "Excellent Standing", color: "text-[#F6F1E8]" };
    return { text: "Exceptional Merit", color: "text-[#F6F1E8] font-['Instrument_Serif',serif] italic tracking-wide" };
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

  // Updated Glass Box Style (50% opacity, Backdrop Blur, Hover Translate & Glow)
  const glassBoxStyle = "bg-[#2a1a0f]/50 backdrop-blur-md rounded-[18px] border border-[#4a2e1b] shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_0_30px_0px_rgba(164,108,58,0.5)] hover:border-[#7a4827] relative overflow-hidden";

  return (
    <div 
      className="min-h-screen font-['Inter',sans-serif] p-4 md:p-8 selection:bg-[#D8C7B4] selection:text-[#2E2218] bg-cover bg-center bg-fixed bg-no-repeat relative"
      style={{ backgroundImage: `url('/leather-bg.jpg')` }}
    >
      <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        
        {/* GitHub Link Top Right */}
        <a 
          href="https://github.com/uusaff" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="absolute top-0 right-0 mt-2 mr-2 md:mt-0 md:mr-0 flex items-center gap-2 text-[#D8C7B4] hover:text-[#F6F1E8] transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_0_12px_rgba(216,199,180,0.6)] z-50 group"
        >
          <span className="font-semibold text-sm hidden sm:block tracking-wider group-hover:text-[#F6F1E8]">@uusaff</span>
          <Github size={22} className="group-hover:text-[#F6F1E8]" />
        </a>

        {toast && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-[#3A2415] text-[#F6F1E8] px-5 py-3 rounded-[12px] shadow-[0_10px_25px_rgba(0,0,0,0.5)] border border-[#7A5230] animate-in slide-in-from-top-4 fade-in duration-300 print:hidden">
            {toast.type === 'error' ? <AlertCircle size={18} className="text-[#D8C7B4]" /> : <CheckCircle2 size={18} className="text-[#D8C7B4]" />}
            <span className="font-medium tracking-wide text-sm">{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12 flex flex-col items-center pt-8 drop-shadow-xl">
          <h1 className="text-4xl md:text-6xl text-[#F6F1E8] font-['Instrument_Serif',serif] tracking-tight mb-4 drop-shadow-md">
            UMT Academic Record
          </h1>
          <div className="h-px w-24 bg-[#D8C7B4] mb-4 opacity-70"></div>
          <p className="text-[#D8C7B4] uppercase tracking-widest text-xs font-bold drop-shadow-sm">
            Official Grading Criteria
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Data Entry */}
          <div className={`lg:col-span-2 ${glassBoxStyle}`}>
            
            {/* Tabs */}
            <div className="flex border-b border-[#4a2e1b] relative z-10 print:hidden bg-[#1a1009]/50">
              <button
                onClick={() => setActiveTab('gpa')}
                className={`flex-1 py-5 flex items-center justify-center gap-2 text-sm uppercase tracking-widest font-semibold transition-all duration-300 ${
                  activeTab === 'gpa' 
                    ? 'text-[#F6F1E8] border-b-2 border-[#A46C3A] bg-[#2a1a0f]/50' 
                    : 'text-[#7D6A58] hover:text-[#D8C7B4] hover:bg-[#2a1a0f]/30'
                }`}
              >
                <BookOpen size={16} /> Semester GPA
              </button>
              <button
                onClick={() => setActiveTab('cgpa')}
                className={`flex-1 py-5 flex items-center justify-center gap-2 text-sm uppercase tracking-widest font-semibold transition-all duration-300 ${
                  activeTab === 'cgpa' 
                    ? 'text-[#F6F1E8] border-b-2 border-[#A46C3A] bg-[#2a1a0f]/50' 
                    : 'text-[#7D6A58] hover:text-[#D8C7B4] hover:bg-[#2a1a0f]/30'
                }`}
              >
                <GraduationCap size={16} /> Cumulative GPA
              </button>
            </div>

            <div className="p-6 md:p-8 relative z-10">
              
              <div className="flex flex-wrap justify-between items-center mb-8 gap-4 print:hidden">
                <button
                  onClick={activeTab === 'gpa' ? addSubject : addSemester}
                  className="group flex items-center gap-2 bg-[#1a1009] hover:bg-[#3a2415] text-[#D8C7B4] hover:text-[#F6F1E8] px-5 py-2.5 rounded-[10px] text-sm font-semibold transition-all border border-[#4a2e1b]"
                >
                  <Plus size={16} className="text-[#A46C3A] group-hover:scale-110 transition-transform" /> 
                  Add {activeTab === 'gpa' ? 'Entry' : 'Term'}
                  <span className="text-[10px] font-bold text-[#7D6A58] bg-[#2a1a0f] px-2 py-0.5 rounded-full ml-2 border border-[#4a2e1b]">
                    {activeTab === 'gpa' ? subjects.length : semesters.length}/10
                  </span>
                </button>
                
                <div className="flex gap-3">
                  <button onClick={resetData} className="flex items-center gap-2 bg-transparent hover:bg-[#3a2415]/50 text-[#D8C7B4] px-4 py-2.5 rounded-[10px] text-sm font-semibold transition-colors border border-transparent hover:border-[#4a2e1b]">
                    <RotateCcw size={16} /> Reset
                  </button>
                  <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#5A3A22] hover:bg-[#8B5E3C] text-[#F6F1E8] px-5 py-2.5 rounded-[10px] text-sm font-semibold transition-colors border border-[#8B5E3C]">
                    <Download size={16} /> Export
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="pb-4 font-semibold text-[#7D6A58] uppercase tracking-wider text-xs border-b border-[#4a2e1b] w-1/2">
                        {activeTab === 'gpa' ? 'Subject Name' : 'Term Designation'}
                      </th>
                      <th className="pb-4 font-semibold text-[#7D6A58] uppercase tracking-wider text-xs border-b border-[#4a2e1b]">
                        {activeTab === 'gpa' ? 'Grade' : 'GPA'}
                      </th>
                      <th className="pb-4 font-semibold text-[#7D6A58] uppercase tracking-wider text-xs border-b border-[#4a2e1b]">
                        Credits
                      </th>
                      <th className="pb-4 font-semibold text-[#7D6A58] uppercase tracking-wider text-xs border-b border-[#4a2e1b] text-center print:hidden">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#4a2e1b]/50">
                    {(activeTab === 'gpa' ? subjects : semesters).map((item) => (
                      <tr key={item.id} className="group transition-colors">
                        <td className="py-4 pr-3">
                          <input
                            type="text"
                            placeholder={activeTab === 'gpa' ? "Enter subject..." : "e.g. Fall 2023"}
                            value={item.name}
                            onChange={(e) => activeTab === 'gpa' 
                              ? updateSubject(item.id, 'name', e.target.value) 
                              : updateSemester(item.id, 'name', e.target.value)}
                            className="w-full bg-[#1a1009] border border-[#3a2415] rounded-[8px] px-4 py-2.5 text-sm text-[#F6F1E8] placeholder-[#7D6A58] focus:border-[#A46C3A] outline-none transition-all print:border-none print:bg-transparent"
                          />
                        </td>
                        <td className="py-4 px-3">
                          {activeTab === 'gpa' ? (
                            <select
                              value={item.grade}
                              onChange={(e) => updateSubject(item.id, 'grade', e.target.value)}
                              className="w-full bg-[#1a1009] border border-[#3a2415] rounded-[8px] px-3 py-2.5 text-sm text-[#F6F1E8] outline-none focus:border-[#A46C3A] transition-all print:appearance-auto"
                            >
                              {Object.keys(GRADE_SCALE).map(grade => (
                                <option key={grade} value={grade}>{grade}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="number"
                              step="0.01" min="0" max="4"
                              placeholder="0.00"
                              value={item.gpa}
                              onChange={(e) => updateSemester(item.id, 'gpa', e.target.value)}
                              className="w-full bg-[#1a1009] border border-[#3a2415] rounded-[8px] px-3 py-2.5 text-sm text-[#F6F1E8] placeholder-[#7D6A58] outline-none focus:border-[#A46C3A] transition-all"
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
                            className="w-full bg-[#1a1009] border border-[#3a2415] rounded-[8px] px-3 py-2.5 text-sm text-[#F6F1E8] outline-none focus:border-[#A46C3A] transition-all"
                          />
                        </td>
                        <td className="py-4 pl-3 text-center print:hidden">
                          {((activeTab === 'gpa' ? subjects : semesters).length > 1) && (
                            <button 
                              onClick={() => activeTab === 'gpa' ? removeSubject(item.id) : removeSemester(item.id)} 
                              className="text-[#7D6A58] hover:text-[#ff6b6b] transition-colors p-2 rounded-full hover:bg-[#1a1009]"
                            >
                              <Trash2 size={16} />
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

          {/* Right Column: Stacked Widgets */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Widget 1: Results */}
            <div className={glassBoxStyle + " p-6"}>
              <div className="absolute inset-2 border border-dashed border-[#A46C3A]/30 rounded-[12px] pointer-events-none"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-center min-h-[300px]">
                {!showResult ? (
                  <div className="text-center py-4 px-2 print:hidden animate-in fade-in duration-500">
                    <Award size={36} className="mx-auto mb-6 text-[#A46C3A]" strokeWidth={1.5} />
                    <h2 className="text-2xl font-['Instrument_Serif',serif] mb-3 text-[#F6F1E8]">Registry Ready</h2>
                    <p className="text-[#D8C7B4] text-sm mb-8 leading-relaxed font-light">
                      Verify your entries and compile your academic standing.
                    </p>
                    
                    <button 
                      onClick={() => {
                        setShowResult(true);
                        showToast("Record Calculated");
                      }}
                      className="w-full py-3.5 rounded-[10px] bg-[#5A3A22] hover:bg-[#432A18] text-[#F6F1E8] font-semibold text-sm uppercase tracking-widest transition-all shadow-[0_8px_20px_rgba(0,0,0,0.4)] border border-[#8B5E3C]"
                    >
                      Compile Record
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 py-4">
                    <div className="text-center border-b border-[#A46C3A]/30 pb-6">
                      <h2 className="text-[#D8C7B4] text-xs uppercase tracking-widest font-semibold mb-2 drop-shadow-sm">
                        {activeTab === 'gpa' ? 'Term GPA' : 'Cumulative GPA'}
                      </h2>
                      <div className="text-6xl font-['Instrument_Serif',serif] text-[#F6F1E8] tracking-tight drop-shadow-lg">
                        {activeTab === 'gpa' ? gpaStats.gpa.toFixed(2) : cgpaStats.cgpa.toFixed(2)}
                      </div>
                    </div>

                    <div className="bg-[#1a1009]/60 rounded-[12px] p-4 text-center border border-[#3a2415] shadow-inner">
                      <p className="text-[15px] font-medium text-[#F6F1E8]">
                        {feedback.text}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3">
                        <div className="text-[#D8C7B4] text-[10px] uppercase tracking-widest mb-1">Total Credits</div>
                        <div className="text-2xl font-['Instrument_Serif',serif] drop-shadow-sm text-[#F6F1E8]">
                          {activeTab === 'gpa' ? gpaStats.totalCredits : cgpaStats.totalCredits}
                        </div>
                      </div>
                      <div className="text-center p-3">
                        <div className="text-[#D8C7B4] text-[10px] uppercase tracking-widest mb-1">Scale %</div>
                        <div className="text-2xl font-['Instrument_Serif',serif] drop-shadow-sm text-[#F6F1E8]">
                          {activeTab === 'gpa' 
                            ? ((gpaStats.gpa / 4) * 100).toFixed(1) 
                            : ((cgpaStats.cgpa / 4) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setShowResult(false)}
                      className="w-full mt-4 py-3 rounded-[10px] bg-transparent hover:bg-[#8B5E3C]/20 text-[#D8C7B4] hover:text-[#F6F1E8] font-medium text-sm transition-colors border border-[#8B5E3C]/30 shadow-sm print:hidden"
                    >
                      Amend Entries
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Widget 2: Exam Tracker Link */}
            <div className={glassBoxStyle + " p-6 group"}>
              <div className="absolute inset-2 border border-dashed border-[#A46C3A]/30 rounded-[12px] pointer-events-none transition-colors duration-500 group-hover:border-[#A46C3A]/60"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-center min-h-[220px] text-center">
                <Calendar size={32} className="mx-auto mb-4 text-[#A46C3A] group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                
                <h3 className="text-2xl font-['Instrument_Serif',serif] mb-2 text-[#F6F1E8]">Exams Approaching?</h3>
                
                <p className="text-[#D8C7B4] text-xs mb-6 leading-relaxed font-light px-2">
                  Stay ahead of your syllabus. Seamlessly organize and track your midterms and finals with my dedicated exam helper.
                </p>
                
                <a 
                  href="https://usafs-tracker.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-[10px] bg-transparent hover:bg-[#5A3A22] text-[#D8C7B4] hover:text-[#F6F1E8] font-semibold text-xs uppercase tracking-widest transition-all border border-[#8B5E3C]/50 hover:border-[#8B5E3C] shadow-sm flex items-center justify-center gap-2"
                >
                  Open Exam Tracker <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Widget 3: Habit Tracker Link */}
            <div className={glassBoxStyle + " p-6 group"}>
              <div className="absolute inset-2 border border-dashed border-[#A46C3A]/30 rounded-[12px] pointer-events-none transition-colors duration-500 group-hover:border-[#A46C3A]/60"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-center min-h-[220px] text-center">
                <Activity size={32} className="mx-auto mb-4 text-[#A46C3A] group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                
                <h3 className="text-2xl font-['Instrument_Serif',serif] mb-2 text-[#F6F1E8]">Build Better Habits</h3>
                
                <p className="text-[#D8C7B4] text-xs mb-6 leading-relaxed font-light px-2">
                  Transform your daily routine. Track your personal goals and maintain consistency with my custom habit tracker.
                </p>
                
                <a 
                  href="https://habit-tracker-nine-mu.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-[10px] bg-transparent hover:bg-[#5A3A22] text-[#D8C7B4] hover:text-[#F6F1E8] font-semibold text-xs uppercase tracking-widest transition-all border border-[#8B5E3C]/50 hover:border-[#8B5E3C] shadow-sm flex items-center justify-center gap-2"
                >
                  Try Habit Tracker <ExternalLink size={14} />
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}