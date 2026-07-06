import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, RotateCcw, Download, BookOpen, GraduationCap, CheckCircle2, AlertCircle, Award } from 'lucide-react';

const GRADE_SCALE = {
  'A': 4.00, 'A-': 3.70, 'B+': 3.30, 'B': 3.00, 'B-': 2.70,
  'C+': 2.30, 'C': 2.00, 'C-': 1.70, 'D+': 1.30, 'D': 1.00, 'F': 0.00
};

const getInitialSubject = () => [{ id: Date.now(), name: '', credits: 3, grade: 'A' }];
const getInitialSemester = () => [{ id: Date.now(), name: 'Semester 1', gpa: '', credits: 15 }];

// Extremely lightweight SVG noise for matte leather/paper grain (No WebGL/GPU needed)
const grainTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")`;

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

  // Refined feedback colors matching the luxury palette
  const getFeedbackMessage = (score) => {
    if (score < 2.0) return { text: "Requires Attention", color: "text-[#7A5230]" };
    if (score < 3.0) return { text: "Steady Progress", color: "text-[#8B5E3C]" };
    if (score < 3.5) return { text: "Commendable", color: "text-[#5A3A22]" };
    if (score < 3.9) return { text: "Excellent Standing", color: "text-[#2E2218]" };
    return { text: "Exceptional Merit", color: "text-[#2E2218] font-['Instrument_Serif',serif] italic tracking-wide" };
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

  return (
    // Base Canvas: Warm Cream (#F6F1E8), sans-serif for UI clarity, serif for headings
    <div 
      className="min-h-screen bg-[#F6F1E8] text-[#2E2218] font-['Inter',sans-serif] p-4 md:p-8 selection:bg-[#D8C7B4] selection:text-[#2E2218] transition-colors duration-500"
      style={{ backgroundImage: grainTexture }}
    >
      <div className="max-w-[1200px] mx-auto relative z-10">
        
        {/* Elegant Minimal Toast */}
        {toast && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-[#5A3A22] text-[#F6F1E8] px-5 py-3 rounded-[12px] shadow-lg shadow-[#5A3A22]/10 border border-[#7A5230] animate-in slide-in-from-top-4 fade-in duration-300 print:hidden">
            {toast.type === 'error' ? <AlertCircle size={18} className="text-[#D8C7B4]" /> : <CheckCircle2 size={18} className="text-[#D8C7B4]" />}
            <span className="font-medium tracking-wide text-sm">{toast.message}</span>
          </div>
        )}

        {/* Timeless Header */}
        <div className="text-center mb-12 flex flex-col items-center pt-8">
          <h1 className="text-4xl md:text-6xl text-[#2E2218] font-['Instrument_Serif',serif] tracking-tight mb-4">
            UMT Academic Record
          </h1>
          <div className="h-px w-24 bg-[#A46C3A] mb-4 opacity-50"></div>
          <p className="text-[#7D6A58] uppercase tracking-widest text-xs font-semibold">
            Official Grading Criteria
          </p>
        </div>

        {/* Main Interface Wrapper */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Data Entry (Secondary Background: #EEE5D8) */}
          <div className="lg:col-span-2 bg-[#EEE5D8] rounded-[18px] shadow-sm border border-[#D8C7B4] overflow-hidden relative">
            
            {/* Subtle inner border for paper depth */}
            <div className="absolute inset-1 border border-[#F6F1E8] rounded-[14px] pointer-events-none"></div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#D8C7B4] relative z-10 print:hidden bg-[#F6F1E8]/50">
              <button
                onClick={() => setActiveTab('gpa')}
                className={`flex-1 py-5 flex items-center justify-center gap-2 text-sm uppercase tracking-widest font-semibold transition-all duration-300 ${
                  activeTab === 'gpa' 
                    ? 'text-[#2E2218] border-b-2 border-[#5A3A22] bg-[#EEE5D8]' 
                    : 'text-[#7D6A58] hover:text-[#5A3A22] hover:bg-[#EEE5D8]/50'
                }`}
              >
                <BookOpen size={16} /> Semester GPA
              </button>
              <button
                onClick={() => setActiveTab('cgpa')}
                className={`flex-1 py-5 flex items-center justify-center gap-2 text-sm uppercase tracking-widest font-semibold transition-all duration-300 ${
                  activeTab === 'cgpa' 
                    ? 'text-[#2E2218] border-b-2 border-[#5A3A22] bg-[#EEE5D8]' 
                    : 'text-[#7D6A58] hover:text-[#5A3A22] hover:bg-[#EEE5D8]/50'
                }`}
              >
                <GraduationCap size={16} /> Cumulative GPA
              </button>
            </div>

            <div className="p-6 md:p-8 relative z-10">
              
              {/* Controls */}
              <div className="flex flex-wrap justify-between items-center mb-8 gap-4 print:hidden">
                <button
                  onClick={activeTab === 'gpa' ? addSubject : addSemester}
                  className="group flex items-center gap-2 bg-[#F6F1E8] hover:bg-[#ffffff] text-[#2E2218] px-5 py-2.5 rounded-[10px] text-sm font-semibold transition-all shadow-sm border border-[#D8C7B4]"
                >
                  <Plus size={16} className="text-[#A46C3A] group-hover:scale-110 transition-transform" /> 
                  Add {activeTab === 'gpa' ? 'Entry' : 'Term'}
                  <span className="text-[10px] font-bold text-[#7D6A58] bg-[#EEE5D8] px-2 py-0.5 rounded-full ml-2">
                    {activeTab === 'gpa' ? subjects.length : semesters.length}/10
                  </span>
                </button>
                
                <div className="flex gap-3">
                  <button onClick={resetData} className="flex items-center gap-2 bg-transparent hover:bg-[#D8C7B4]/30 text-[#5A3A22] px-4 py-2.5 rounded-[10px] text-sm font-semibold transition-colors border border-transparent hover:border-[#D8C7B4]">
                    <RotateCcw size={16} /> Reset
                  </button>
                  <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#5A3A22] hover:bg-[#8B5E3C] text-[#F6F1E8] px-5 py-2.5 rounded-[10px] text-sm font-semibold transition-colors shadow-sm">
                    <Download size={16} /> Export
                  </button>
                </div>
              </div>

              {/* Data Tables */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="pb-4 font-semibold text-[#7D6A58] uppercase tracking-wider text-xs border-b border-[#D8C7B4] w-1/2">
                        {activeTab === 'gpa' ? 'Subject Name' : 'Term Designation'}
                      </th>
                      <th className="pb-4 font-semibold text-[#7D6A58] uppercase tracking-wider text-xs border-b border-[#D8C7B4]">
                        {activeTab === 'gpa' ? 'Grade' : 'GPA'}
                      </th>
                      <th className="pb-4 font-semibold text-[#7D6A58] uppercase tracking-wider text-xs border-b border-[#D8C7B4]">
                        Credits
                      </th>
                      <th className="pb-4 font-semibold text-[#7D6A58] uppercase tracking-wider text-xs border-b border-[#D8C7B4] text-center print:hidden">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8C7B4]/50">
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
                            className="w-full bg-transparent border-b border-transparent focus:border-[#A46C3A] outline-none py-1 text-[#2E2218] placeholder-[#A46C3A]/40 transition-colors font-medium text-sm print:border-none"
                          />
                        </td>
                        <td className="py-4 px-3">
                          {activeTab === 'gpa' ? (
                            <select
                              value={item.grade}
                              onChange={(e) => updateSubject(item.id, 'grade', e.target.value)}
                              className="w-full bg-[#F6F1E8] border border-[#D8C7B4] rounded-[8px] px-3 py-2 text-sm text-[#2E2218] font-medium outline-none focus:ring-2 focus:ring-[#D8C7B4] focus:border-[#A46C3A] transition-all print:appearance-auto"
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
                              className="w-full bg-[#F6F1E8] border border-[#D8C7B4] rounded-[8px] px-3 py-2 text-sm text-[#2E2218] font-medium outline-none focus:ring-2 focus:ring-[#D8C7B4] focus:border-[#A46C3A] transition-all"
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
                            className="w-full bg-[#F6F1E8] border border-[#D8C7B4] rounded-[8px] px-3 py-2 text-sm text-[#2E2218] font-medium outline-none focus:ring-2 focus:ring-[#D8C7B4] focus:border-[#A46C3A] transition-all"
                          />
                        </td>
                        <td className="py-4 pl-3 text-center print:hidden">
                          {((activeTab === 'gpa' ? subjects : semesters).length > 1) && (
                            <button 
                              onClick={() => activeTab === 'gpa' ? removeSubject(item.id) : removeSemester(item.id)} 
                              className="text-[#D8C7B4] hover:text-[#7A5230] transition-colors p-2 rounded-full hover:bg-[#F6F1E8]"
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

          {/* Right Column: Results Dashboard (Leather Tag Card) */}
          <div className="lg:col-span-1">
            <div 
              className="bg-[#7A5230] text-[#F6F1E8] rounded-[18px] p-6 shadow-xl relative overflow-hidden transition-all duration-500"
              style={{ backgroundImage: grainTexture }}
            >
              {/* Leather Stitched Border Effect */}
              <div className="absolute inset-2 border border-dashed border-[#A46C3A]/60 rounded-[12px] pointer-events-none"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-center min-h-[320px]">
                {!showResult ? (
                  <div className="text-center py-8 px-4 print:hidden animate-in fade-in duration-500">
                    <Award size={36} className="mx-auto mb-6 text-[#D8C7B4]" strokeWidth={1.5} />
                    <h2 className="text-2xl font-['Instrument_Serif',serif] mb-3 text-[#F6F1E8]">Registry Ready</h2>
                    <p className="text-[#D8C7B4] text-sm mb-8 leading-relaxed font-light">
                      Verify your entries and compile your academic standing.
                    </p>
                    
                    <button 
                      onClick={() => {
                        setShowResult(true);
                        showToast("Record Calculated");
                      }}
                      className="w-full py-3.5 rounded-[10px] bg-[#5A3A22] hover:bg-[#432A18] text-[#F6F1E8] font-semibold text-sm uppercase tracking-widest transition-all border border-[#8B5E3C] shadow-md"
                    >
                      Compile Record
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 py-4">
                    <div className="text-center border-b border-[#A46C3A]/40 pb-6">
                      <h2 className="text-[#D8C7B4] text-xs uppercase tracking-widest font-semibold mb-2">
                        {activeTab === 'gpa' ? 'Term GPA' : 'Cumulative GPA'}
                      </h2>
                      <div className="text-6xl font-['Instrument_Serif',serif] text-[#F6F1E8] tracking-tight">
                        {activeTab === 'gpa' ? gpaStats.gpa.toFixed(2) : cgpaStats.cgpa.toFixed(2)}
                      </div>
                    </div>

                    <div className="bg-[#5A3A22]/50 rounded-[12px] p-4 text-center border border-[#8B5E3C]/30 backdrop-blur-sm">
                      <p className={`text-[15px] font-medium ${feedback.color.replace('text-[#', 'text-[#F6F1E8]') /* override for dark bg readability */}`}>
                        {feedback.text}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3">
                        <div className="text-[#D8C7B4] text-[10px] uppercase tracking-widest mb-1">Total Credits</div>
                        <div className="text-2xl font-['Instrument_Serif',serif]">
                          {activeTab === 'gpa' ? gpaStats.totalCredits : cgpaStats.totalCredits}
                        </div>
                      </div>
                      <div className="text-center p-3">
                        <div className="text-[#D8C7B4] text-[10px] uppercase tracking-widest mb-1">Scale %</div>
                        <div className="text-2xl font-['Instrument_Serif',serif]">
                          {activeTab === 'gpa' 
                            ? ((gpaStats.gpa / 4) * 100).toFixed(1) 
                            : ((cgpaStats.cgpa / 4) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setShowResult(false)}
                      className="w-full mt-4 py-3 rounded-[10px] bg-transparent hover:bg-[#8B5E3C]/20 text-[#D8C7B4] hover:text-[#F6F1E8] font-medium text-sm transition-colors border border-[#8B5E3C]/50 print:hidden"
                    >
                      Amend Entries
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}