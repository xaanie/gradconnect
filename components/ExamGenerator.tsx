import React, { useState } from 'react';
import { GradeLevel, Subject, Term, ExamInput, ExamPaper } from '../types';
import { generateEndTermExam } from '../services/geminiService';
import { generateExamPDF } from '../utils/pdfGenerator';
import LoadingSpinner from './LoadingSpinner';

const ExamGenerator: React.FC = () => {
  const [formData, setFormData] = useState<ExamInput>({
    schoolName: '',
    grade: GradeLevel.Grade7,
    subject: Subject.Math,
    term: Term.Term3,
    year: new Date().getFullYear().toString(),
    duration: '2 hours'
  });

  const [loading, setLoading] = useState(false);
  const [examPaper, setExamPaper] = useState<ExamPaper | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.schoolName) {
      setError("Please enter the School Name.");
      return;
    }
    setError(null);
    setLoading(true);
    setExamPaper(null);

    try {
      const result = await generateEndTermExam(formData);
      setExamPaper(result);
    } catch (err) {
      setError("Failed to generate exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get labels for preview
  const getPreviewLabels = () => {
    if (!examPaper) return null;
    const isIndigenous = examPaper.subject === Subject.Indigenous;

    if (isIndigenous) {
        return {
            title: examPaper.term.includes('3') ? "BVUNZO DZEKUPERA KWEGORE" : "BVUNZO DZEKUPERA KWETERMU",
            time: "NGUVA",
            instructionsHeader: "MIRAIRO KUVANYORI",
            instructions: [
                "Nyora zita rako negiredhi pabepa remhinduro.",
                "Pindura mibvunzo yose muChikamu A neChikamu B.",
                "Pindura mibvunzo muChikamu C sekurairwa kwazvakaitwa.",
                "Nyora zvakatsvinda uye zvinoraveka."
            ]
        };
    }
    return {
        title: "END OF TERM EXAMINATION",
        time: "TIME",
        instructionsHeader: "INSTRUCTIONS TO CANDIDATES",
        instructions: [
            "Write your name and grade on the answer sheet provided.",
            "Answer all questions in Section A and Section B.",
            "Answer questions from Section C as instructed.",
            "Handwriting must be neat and legible."
        ]
    };
  };

  const previewLabels = getPreviewLabels();

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block p-3 rounded-full bg-blue-900 text-white mb-4">
          <i className="fas fa-scroll text-3xl"></i>
        </div>
        <h2 className="text-3xl font-bold text-gray-800">End of Term Exam Creator</h2>
        <p className="text-gray-600 mt-2">Generate comprehensive exam papers with a formal cover page.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-4 h-fit sticky top-24">
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-900">
            <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">Exam Configuration</h3>
            
            <div className="space-y-5">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">School Name</label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  placeholder="e.g. Harare Primary School"
                  className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-900 focus:border-blue-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Grade</label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-900 focus:border-blue-900"
                  >
                    {Object.values(GradeLevel).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-900 focus:border-blue-900 text-sm"
                  >
                    {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Term</label>
                    <select
                        name="term"
                        value={formData.term}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-900 focus:border-blue-900"
                    >
                        {Object.values(Term).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Year</label>
                    <input
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-900 focus:border-blue-900"
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g. 1 hour 30 minutes"
                  className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-900 focus:border-blue-900"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all flex justify-center items-center ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-900 hover:bg-blue-800 hover:shadow-lg'}`}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Generating Exam...
                  </>
                ) : (
                  <>
                    <i className="fas fa-print mr-2"></i> Create Exam Paper
                  </>
                )}
              </button>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Preview Area */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-12 flex flex-col items-center justify-center min-h-[600px] border border-gray-100">
              <LoadingSpinner subject={formData.subject} />
              <p className="mt-4 text-gray-600 font-medium">Constructing End of Term Examination...</p>
              <p className="text-xs text-gray-400 mt-2">Integrating syllabus topics for {formData.term}...</p>
            </div>
          ) : examPaper && previewLabels ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
               {/* Action Header */}
               <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg"><i className="fas fa-check-circle text-green-400 mr-2"></i> Exam Paper Ready</h3>
                    <p className="text-xs text-gray-300">{examPaper.totalMarks} Marks • {examPaper.sections.length} Sections</p>
                </div>
                <button
                  onClick={() => generateExamPDF(examPaper)}
                  className="bg-blue-600 text-white text-sm px-6 py-2 rounded shadow hover:bg-blue-700 transition flex items-center font-bold"
                >
                  <i className="fas fa-file-pdf mr-2"></i> Download Official PDF
                </button>
              </div>
              
              {/* Paper Preview (Visual representation of the PDF) */}
              <div className="p-8 bg-gray-100 max-h-[800px] overflow-y-auto custom-scrollbar">
                  
                  {/* Visual Cover Page */}
                  <div className="bg-white border-2 border-black p-8 shadow-sm mb-8 mx-auto max-w-2xl h-[800px] relative">
                      <div className="border border-black absolute inset-2"></div>
                      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-6">
                           <h1 className="text-3xl font-serif font-bold uppercase tracking-wider">{examPaper.schoolName}</h1>
                           <div className="w-24 h-1 bg-black"></div>
                           <h2 className="text-xl font-bold uppercase">{previewLabels.title}</h2>
                           <h3 className="text-lg">{examPaper.term} {examPaper.year}</h3>
                           
                           <div className="py-4">
                               <p className="text-2xl font-bold uppercase">{examPaper.grade}</p>
                               <p className="text-xl font-bold uppercase mt-2">{examPaper.subject}</p>
                           </div>
                           
                           <p className="font-bold">{previewLabels.time}: {examPaper.duration}</p>

                           <div className="text-left w-3/4 mx-auto mt-8">
                               <p className="font-bold underline mb-2">{previewLabels.instructionsHeader}:</p>
                               <ul className="list-disc pl-5 text-sm space-y-2">
                                   {previewLabels.instructions.map((inst, i) => (
                                     <li key={i}>{inst}</li>
                                   ))}
                               </ul>
                           </div>
                      </div>
                  </div>

                  {/* Content Preview */}
                  <div className="bg-white p-8 shadow-sm mx-auto max-w-2xl">
                      {examPaper.sections.map((sec, idx) => (
                          <div key={idx} className="mb-8">
                              <h3 className="font-bold text-lg border-b border-gray-300 pb-2 mb-4 text-center">{sec.name} - {sec.sectionMarks} Marks</h3>
                              <p className="text-sm italic text-center text-gray-500 mb-6">{sec.guidance}</p>
                              <div className="space-y-4">
                                  {sec.questions.slice(0, 3).map((q, i) => (
                                      <div key={i} className="flex justify-between text-sm">
                                          <div className="w-10 font-bold">{q.id}.</div>
                                          <div className="flex-1">{q.question}</div>
                                          <div className="w-12 text-right font-bold text-gray-500">[{q.marks}]</div>
                                      </div>
                                  ))}
                                  <div className="text-center text-gray-400 italic text-xs mt-2">... {sec.questions.length - 3} more questions ...</div>
                              </div>
                          </div>
                      ))}
                  </div>

              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl h-full flex flex-col items-center justify-center p-12 text-gray-400 min-h-[500px]">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                 <i className="fas fa-scroll text-3xl opacity-30 text-blue-900"></i>
              </div>
              <p className="text-xl font-medium text-gray-500">No exam generated.</p>
              <p className="text-sm mt-2 max-w-xs text-center">Configure the school and term details on the left to generate a full exam paper.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamGenerator;
