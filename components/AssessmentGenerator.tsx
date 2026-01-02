import React, { useState } from 'react';
import { GradeLevel, Subject, AssessmentInput, AssessmentType, Assessment } from '../types';
import { generateAssessment } from '../services/geminiService';
import { generateAssessmentPDF } from '../utils/pdfGenerator';
import LoadingSpinner from './LoadingSpinner';

const AssessmentGenerator: React.FC = () => {
  const [formData, setFormData] = useState<AssessmentInput>({
    grade: GradeLevel.Grade3,
    subject: Subject.Math,
    topic: '',
    type: AssessmentType.MultipleChoice,
    count: 10
  });

  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.topic) {
      setError("Please enter a topic.");
      return;
    }
    setError(null);
    setLoading(true);
    setAssessment(null);
    setShowAnswers(false);

    try {
      const result = await generateAssessment(formData);
      setAssessment(result);
    } catch (err) {
      setError("Failed to generate assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block p-3 rounded-full bg-indigo-100 text-indigo-600 mb-4">
          <i className="fas fa-file-alt text-3xl"></i>
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Assessment Generator</h2>
        <p className="text-gray-600 mt-2">Create professional tests, quizzes, and marking guides instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-4 h-fit sticky top-24">
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-indigo-600">
            <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">Test Details</h3>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Grade</label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Topic</label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="e.g. Fractions, Soil Types"
                  className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Question Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {Object.values(AssessmentType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
              </div>

              {/* Hide Question Count for Composition as it's fixed/irrelevant */}
              {formData.type !== AssessmentType.Composition && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Number of Questions</label>
                    <select
                      name="count"
                      value={formData.count}
                      onChange={(e) => setFormData(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                      className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={15}>15 Questions</option>
                      <option value={20}>20 Questions</option>
                    </select>
                  </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all flex justify-center items-center ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'}`}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Drafting Test...
                  </>
                ) : (
                  <>
                    <i className="fas fa-pencil-alt mr-2"></i> Generate Test
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
            <div className="bg-white rounded-xl shadow-md p-12 flex flex-col items-center justify-center min-h-[500px] border border-gray-100">
              <LoadingSpinner subject={formData.subject} />
              <p className="mt-4 text-gray-400 text-sm">Setting questions and marking guide...</p>
            </div>
          ) : assessment ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
               {/* Preview Header */}
               <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg"><i className="fas fa-check-circle text-green-400 mr-2"></i> Assessment Ready</h3>
                    <p className="text-xs text-gray-300">{assessment.totalMarks} Marks Total</p>
                </div>
                <div className="flex space-x-3">
                    <button
                      onClick={() => setShowAnswers(!showAnswers)}
                      className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded transition"
                    >
                      {showAnswers ? 'Hide Answers' : 'Show Answers'}
                    </button>
                    <button
                      onClick={() => generateAssessmentPDF(assessment)}
                      className="bg-red-600 text-white text-sm px-4 py-2 rounded shadow hover:bg-red-700 transition flex items-center font-bold"
                    >
                      <i className="fas fa-file-pdf mr-2"></i> Download PDF
                    </button>
                </div>
              </div>
              
              {/* Question List */}
              <div className="p-8 bg-white max-h-[800px] overflow-y-auto custom-scrollbar">
                  <div className="text-center mb-8 border-b-2 border-double border-gray-300 pb-4">
                      <h2 className="text-2xl font-bold text-gray-900 uppercase">{assessment.title}</h2>
                      <p className="text-gray-600">{formData.grade} • {formData.subject}</p>
                  </div>

                  {assessment.passage && (
                    <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                       <h4 className="font-bold text-gray-800 mb-3 border-b pb-2">READING PASSAGE</h4>
                       <p className="text-gray-700 leading-relaxed font-serif text-lg whitespace-pre-line">
                         {assessment.passage}
                       </p>
                    </div>
                  )}

                  <div className="space-y-6">
                      {assessment.questions.map((q, idx) => (
                          <div key={idx} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                              <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-bold text-gray-800 text-lg flex">
                                      <span className="mr-2 text-indigo-600">{idx + 1}.</span> 
                                      {q.question}
                                  </h4>
                                  <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                      {q.marks} Marks
                                  </span>
                              </div>
                              
                              {q.type === 'mcq' && q.options && (
                                  <div className="ml-6 space-y-1 mb-3">
                                      {q.options.map((opt, i) => (
                                          <div key={i} className="text-gray-700">{opt}</div>
                                      ))}
                                  </div>
                              )}
                              
                              {q.type === 'structured' && !showAnswers && (
                                  <div className="ml-6 mt-2 h-16 border-b border-gray-300 border-dashed w-full max-w-xl"></div>
                              )}
                              
                              {q.type === 'composition' && !showAnswers && (
                                  <div className="ml-6 mt-2 text-xs text-gray-400 italic">
                                      (Student to choose one topic and write on provided lined paper)
                                  </div>
                              )}

                              {showAnswers && (
                                  <div className="ml-6 mt-3 p-3 bg-green-50 border-l-4 border-green-500 text-green-800 text-sm">
                                      <span className="font-bold">Answer/Guide:</span> {q.answer}
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl h-full flex flex-col items-center justify-center p-12 text-gray-400 min-h-[500px]">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                 <i className="fas fa-file-alt text-3xl opacity-30"></i>
              </div>
              <p className="text-xl font-medium text-gray-500">No assessment generated.</p>
              <p className="text-sm mt-2 max-w-xs text-center">Configure the test on the left to generate questions and a marking guide.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentGenerator;
