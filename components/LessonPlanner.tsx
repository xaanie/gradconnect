import React, { useState } from 'react';
import { GradeLevel, Subject, LessonInput, LessonPlan } from '../types';
import { generateSingleLessonPlan } from '../services/geminiService';
import { generateLessonPDF } from '../utils/pdfGenerator';
import LoadingSpinner from './LoadingSpinner';

interface LessonPlannerProps {
  initialTeacherName: string;
}

const LessonPlanner: React.FC<LessonPlannerProps> = ({ initialTeacherName }) => {
  const initialFormState: LessonInput = {
    teacherName: initialTeacherName,
    grade: GradeLevel.Grade3,
    subject: Subject.Math,
    topic: '',
    context: '',
    date: new Date().toISOString().split('T')[0],
    duration: 30
  };

  const [formData, setFormData] = useState<LessonInput>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData({ ...initialFormState, teacherName: formData.teacherName });
    setGeneratedPlan(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!formData.topic || !formData.teacherName) {
      setError("Please fill in the Topic and Teacher Name.");
      return;
    }
    setError(null);
    setLoading(true);
    setGeneratedPlan(null);

    try {
      const plan = await generateSingleLessonPlan(formData);
      setGeneratedPlan(plan);
    } catch (err) {
      setError("Failed to generate lesson plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="text-center">
        <div className="inline-block p-3 rounded-full bg-blue-100 text-blue-600 mb-4">
          <i className="fas fa-chalkboard-teacher text-3xl"></i>
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Daily Lesson Planner</h2>
        <p className="text-gray-600 mt-2">Create a single, syllabus-aligned lesson plan separate from your weekly scheme.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-600 h-fit sticky top-24">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
             <h3 className="text-lg font-bold text-gray-800">Plan Details</h3>
             <button onClick={handleClear} className="text-xs text-gray-500 hover:text-red-500 underline">Clear Form</button>
          </div>
          
          <div className="space-y-5">
             {/* Teacher Name */}
             <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Teacher</label>
              <input
                type="text"
                name="teacherName"
                value={formData.teacherName}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Subject & Grade */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Grade</label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Topic</label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                placeholder="e.g. Long Division"
                className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Date & Duration */}
             <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Duration (min)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Context */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Context / Focus (Optional)</label>
              <textarea
                name="context"
                value={formData.context}
                onChange={handleInputChange}
                rows={3}
                placeholder="Specific focus? e.g. Remedial work for slow learners, or practical field work."
                className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all flex justify-center items-center ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Thinking...
                </>
              ) : (
                <>
                  <i className="fas fa-wand-magic-sparkles mr-2"></i> Create Lesson Plan
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

        {/* Right Column: Preview */}
        <div className="lg:col-span-8">
          {loading ? (
             <div className="bg-white rounded-xl shadow-md p-12 flex flex-col items-center justify-center min-h-[500px] border border-gray-100">
                <LoadingSpinner subject={formData.subject} />
                <p className="mt-4 text-gray-400 text-sm">Drafting Introduction, Steps 1-3, and Conclusion...</p>
             </div>
          ) : generatedPlan ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
              <div className="bg-gray-800 text-white p-4 flex justify-between items-center sticky top-0 z-10">
                <div>
                    <h3 className="font-bold text-lg"><i className="fas fa-check-circle text-green-400 mr-2"></i> Plan Ready</h3>
                </div>
                <button
                  onClick={() => generateLessonPDF(generatedPlan)}
                  className="bg-red-600 text-white text-sm px-5 py-2 rounded shadow hover:bg-red-700 transition flex items-center font-bold"
                >
                  <i className="fas fa-file-pdf mr-2"></i> Download PDF
                </button>
              </div>
              
              <div className="p-8 font-serif text-gray-900 leading-relaxed max-h-[800px] overflow-y-auto custom-scrollbar bg-white">
                {/* Visual Representation of the PDF */}
                <div className="border border-gray-300 p-8 shadow-sm max-w-3xl mx-auto bg-white">
                    <div className="text-center pb-4 mb-6">
                       <h2 className="text-xl font-bold uppercase tracking-wider">Detailed Lesson Plan</h2>
                    </div>

                    <table className="w-full text-sm border-collapse border border-black mb-6 font-sans">
                        <tbody>
                            <tr>
                                <td className="border border-black p-2 font-bold bg-gray-50">DATE</td>
                                <td className="border border-black p-2">{generatedPlan.date}</td>
                                <td className="border border-black p-2 font-bold bg-gray-50">TIME</td>
                                <td className="border border-black p-2">{generatedPlan.duration} mins</td>
                            </tr>
                             <tr>
                                <td className="border border-black p-2 font-bold bg-gray-50">GRADE</td>
                                <td className="border border-black p-2">{generatedPlan.grade}</td>
                                <td className="border border-black p-2 font-bold bg-gray-50">SUBJECT</td>
                                <td className="border border-black p-2">{generatedPlan.subject}</td>
                            </tr>
                             <tr>
                                <td className="border border-black p-2 font-bold bg-gray-50">TOPIC</td>
                                <td className="border border-black p-2">{generatedPlan.topic}</td>
                                <td className="border border-black p-2 font-bold bg-gray-50">TEACHER</td>
                                <td className="border border-black p-2">{generatedPlan.teacherName}</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-2 font-bold bg-gray-50">SUB-TOPIC</td>
                                <td className="border border-black p-2" colSpan={3}>{generatedPlan.subTopic}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="mb-4">
                        <h4 className="font-bold text-black uppercase text-xs mb-1">OBJECTIVES:</h4>
                        <p className="text-sm mb-1">By the end of the lesson, learners should be able to:</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            {generatedPlan.objectives?.map((obj, i) => <li key={i}>{obj.replace(/^[•\-\*]\s*/, '')}</li>)}
                        </ul>
                    </div>

                    <div className="mb-4">
                        <h4 className="font-bold text-black uppercase text-xs mb-1">SOM / MEDIA / MATERIALS:</h4>
                        <p className="text-sm">{generatedPlan.materials?.join(', ')}</p>
                    </div>

                    <div className="mb-4">
                        <h4 className="font-bold text-black uppercase text-xs mb-1">ASSUMED KNOWLEDGE:</h4>
                        <p className="text-sm">{generatedPlan.assumedKnowledge}</p>
                    </div>

                    <div className="mb-6">
                    <h4 className="font-bold text-black uppercase text-xs mb-2">LESSON DEVELOPMENT:</h4>
                    <table className="w-full text-xs border-collapse border border-black table-fixed">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-black p-1 text-left w-20">Stage</th>
                                <th className="border border-black p-1 text-left w-12">Time</th>
                                <th className="border border-black p-1 text-left">Teacher's Activity</th>
                                <th className="border border-black p-1 text-left">Learner's Activity</th>
                                <th className="border border-black p-1 text-left">Methods/ Comp.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {generatedPlan.lessonSteps?.map((step, idx) => (
                            <tr key={idx}>
                                <td className="border border-black p-2 font-bold align-top break-words">{step.stage}</td>
                                <td className="border border-black p-2 align-top">{step.time}</td>
                                <td className="border border-black p-2 align-top">{step.teacherActivity}</td>
                                <td className="border border-black p-2 align-top">{step.learnerActivity}</td>
                                <td className="border border-black p-2 align-top">{step.methods}</td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                    
                    <div className="mt-8">
                        <h4 className="font-bold text-black uppercase text-xs mb-1">EVALUATION:</h4>
                        <div className="h-20 border border-black bg-white"></div>
                    </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl h-full flex flex-col items-center justify-center p-12 text-gray-400 min-h-[500px]">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                 <i className="fas fa-edit text-3xl opacity-30"></i>
              </div>
              <p className="text-xl font-medium text-gray-500">No plan generated yet.</p>
              <p className="text-sm mt-2 max-w-xs text-center">Fill out the form on the left to create a customized lesson plan for any topic.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPlanner;
