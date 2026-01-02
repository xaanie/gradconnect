import React, { useState } from 'react';
import { GradeLevel, Term, Subject, UserInput, SchemeOfWork } from './types';
import { generateSubjectScheme } from './services/geminiService';
import { generatePDF } from './utils/pdfGenerator';
import LoadingSpinner from './components/LoadingSpinner';
import LandingPage from './components/LandingPage';
import LessonPlanner from './components/LessonPlanner';
import FlashcardMaker from './components/FlashcardMaker';
import AssessmentGenerator from './components/AssessmentGenerator';
import ExamGenerator from './components/ExamGenerator';
import LibraryManager from './components/LibraryManager';

type ViewState = 'landing' | 'schemes' | 'lessons' | 'flashcards' | 'assessment' | 'exams' | 'library';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  
  // Scheme Generator State
  const [formData, setFormData] = useState<UserInput>({
    teacherName: '',
    grade: GradeLevel.Grade3,
    term: Term.Term1,
    year: new Date().getFullYear().toString(),
    startDate: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [currentGeneratingSubject, setCurrentGeneratingSubject] = useState<string | null>(null);
  const [generatedSchemes, setGeneratedSchemes] = useState<SchemeOfWork[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateSchemes = async () => {
    if (!formData.teacherName) {
      setError("Please enter your name.");
      return;
    }
    setError(null);
    setLoading(true);
    setGeneratedSchemes([]);

    const subjectsToGenerate = [
      Subject.Math,
      Subject.English,
      Subject.Science,
      Subject.Social,
      Subject.Indigenous,
      Subject.PE_Arts
    ];

    const results: SchemeOfWork[] = [];

    try {
      for (const subject of subjectsToGenerate) {
        setCurrentGeneratingSubject(subject);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const scheme = await generateSubjectScheme(formData, subject);
        results.push(scheme);
        setGeneratedSchemes(prev => [...prev, scheme]);
      }
      
      setCurrentGeneratingSubject(null);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError("An error occurred. Please try again or check your connection.");
      setLoading(false);
      setCurrentGeneratingSubject(null);
    }
  };

  const handleDownloadSchemes = () => {
    if (generatedSchemes.length > 0) {
      generatePDF(generatedSchemes);
    }
  };

  if (currentView === 'landing') {
    return <LandingPage onGetStarted={() => setCurrentView('schemes')} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-zim-green text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity mb-4 md:mb-0" 
            onClick={() => setCurrentView('landing')}
            title="Back to Home"
          >
            <i className="fas fa-book-open text-3xl text-zim-yellow"></i>
            <div>
              <h1 className="text-2xl font-bold leading-none">ZimEd Planner</h1>
              <p className="text-xs text-gray-200 uppercase tracking-wider">Heritage Based Tool</p>
            </div>
          </div>
          <div className="flex space-x-2 md:space-x-4 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
             <button 
              onClick={() => setCurrentView('schemes')} 
              className={`text-sm py-2 px-3 md:px-4 rounded transition-colors whitespace-nowrap ${currentView === 'schemes' ? 'bg-white text-zim-green font-bold shadow' : 'bg-green-800 hover:bg-green-700 text-white'}`}
            >
              <i className="fas fa-layer-group mr-2"></i> Schemes
            </button>
            <button 
              onClick={() => setCurrentView('lessons')} 
              className={`text-sm py-2 px-3 md:px-4 rounded transition-colors whitespace-nowrap ${currentView === 'lessons' ? 'bg-white text-zim-green font-bold shadow' : 'bg-green-800 hover:bg-green-700 text-white'}`}
            >
              <i className="fas fa-chalkboard-teacher mr-2"></i> Plans
            </button>
            <button 
              onClick={() => setCurrentView('flashcards')} 
              className={`text-sm py-2 px-3 md:px-4 rounded transition-colors whitespace-nowrap ${currentView === 'flashcards' ? 'bg-white text-zim-green font-bold shadow' : 'bg-green-800 hover:bg-green-700 text-white'}`}
            >
              <i className="fas fa-clone mr-2"></i> Flashcards
            </button>
             <button 
              onClick={() => setCurrentView('assessment')} 
              className={`text-sm py-2 px-3 md:px-4 rounded transition-colors whitespace-nowrap ${currentView === 'assessment' ? 'bg-white text-zim-green font-bold shadow' : 'bg-green-800 hover:bg-green-700 text-white'}`}
            >
              <i className="fas fa-file-alt mr-2"></i> Tests
            </button>
            <button 
              onClick={() => setCurrentView('exams')} 
              className={`text-sm py-2 px-3 md:px-4 rounded transition-colors whitespace-nowrap ${currentView === 'exams' ? 'bg-white text-zim-green font-bold shadow' : 'bg-green-800 hover:bg-green-700 text-white'}`}
            >
              <i className="fas fa-scroll mr-2"></i> Exam Paper
            </button>
            <button 
              onClick={() => setCurrentView('library')} 
              className={`text-sm py-2 px-3 md:px-4 rounded transition-colors whitespace-nowrap ${currentView === 'library' ? 'bg-white text-zim-green font-bold shadow' : 'bg-green-800 hover:bg-green-700 text-white'}`}
            >
              <i className="fas fa-book-reader mr-2"></i> Library
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        
        {/* VIEW: LIBRARY (New) */}
        {currentView === 'library' && (
          <LibraryManager />
        )}

        {/* VIEW: EXAM GENERATOR */}
        {currentView === 'exams' && (
          <ExamGenerator />
        )}

        {/* VIEW: ASSESSMENT GENERATOR */}
        {currentView === 'assessment' && (
          <AssessmentGenerator />
        )}

        {/* VIEW: FLASHCARD MAKER */}
        {currentView === 'flashcards' && (
          <FlashcardMaker />
        )}
        
        {/* VIEW: LESSON PLANNER */}
        {currentView === 'lessons' && (
          <LessonPlanner initialTeacherName={formData.teacherName} />
        )}

        {/* VIEW: SCHEME GENERATOR */}
        {currentView === 'schemes' && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Scheme Generator</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Configure details below to generate a comprehensive 12-week Scheme-Cum-Plan.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto mb-8 border-t-4 border-zim-red">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teacher's Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-user text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      name="teacherName"
                      value={formData.teacherName}
                      onChange={handleInputChange}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-zim-green focus:ring focus:ring-zim-green focus:ring-opacity-50 border p-2"
                      placeholder="e.g. Mr. Mutero"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-zim-green focus:ring focus:ring-zim-green focus:ring-opacity-50 border p-2"
                  >
                    {Object.values(GradeLevel).map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                  <select
                    name="term"
                    value={formData.term}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-zim-green focus:ring focus:ring-zim-green focus:ring-opacity-50 border p-2"
                  >
                    {Object.values(Term).map(term => (
                      <option key={term} value={term}>{term}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-zim-green focus:ring focus:ring-zim-green focus:ring-opacity-50 border p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Term Start Date (Week 1)</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-zim-green focus:ring focus:ring-zim-green focus:ring-opacity-50 border p-2"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                {!loading ? (
                  <button
                    onClick={handleGenerateSchemes}
                    className="bg-zim-green hover:bg-green-800 text-white font-bold py-3 px-10 rounded-full shadow-lg transform transition hover:scale-105 flex items-center text-lg"
                  >
                    <i className="fas fa-magic mr-3"></i> Generate Schemes
                  </button>
                ) : (
                  <button disabled className="bg-gray-400 text-white font-bold py-3 px-10 rounded-full cursor-not-allowed flex items-center">
                    <i className="fas fa-cog fa-spin mr-3"></i> Generating...
                  </button>
                )}
              </div>
              
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-center flex items-center justify-center">
                  <i className="fas fa-exclamation-circle mr-2"></i> {error}
                </div>
              )}
            </div>

            {loading && (
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto text-center border border-gray-100">
                <LoadingSpinner subject={currentGeneratingSubject || ''} />
                <div className="mt-6 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-zim-green h-3 rounded-full transition-all duration-500 relative" 
                    style={{ width: `${(generatedSchemes.length / 6) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                    <span>Start</span>
                    <span>{generatedSchemes.length} / 6 Subjects Completed</span>
                    <span>Finish</span>
                </div>
              </div>
            )}

            {!loading && generatedSchemes.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-6xl mx-auto border-t-4 border-zim-yellow animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-6 border-b border-gray-100">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Generated Schemes Ready</h3>
                    <p className="text-gray-500 text-sm">Review the subjects below or download the PDF.</p>
                  </div>
                  <button
                    onClick={handleDownloadSchemes}
                    className="mt-4 md:mt-0 bg-zim-red hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-md flex items-center transition-transform hover:scale-105"
                  >
                    <i className="fas fa-file-pdf mr-2 text-xl"></i> Download All as PDF
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {generatedSchemes.map((scheme, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition bg-gray-50/50 hover:bg-white hover:border-zim-green group">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-zim-green text-white flex items-center justify-center font-bold mr-3 shadow-sm group-hover:scale-110 transition-transform">
                          {scheme.subject.charAt(0)}
                        </div>
                        <h4 className="font-bold text-lg text-gray-800 leading-tight">{scheme.subject}</h4>
                      </div>
                      <div className="space-y-2 mb-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preview Topics:</p>
                          <ul className="text-sm text-gray-600 list-disc pl-4 h-20 overflow-y-auto custom-scrollbar">
                            {scheme.entries.slice(0, 3).map((e, i) => (
                              <li key={i} className="line-clamp-1">{e.topic}</li>
                            ))}
                            <li className="text-gray-400 italic">...and more</li>
                          </ul>
                      </div>
                      <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                          <span><i className="fas fa-calendar-alt mr-1"></i> {scheme.entries.length} Weeks</span>
                          <span className="text-zim-green font-medium"><i className="fas fa-check mr-1"></i> Ready</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2 font-medium">Built for Zimbabwean Educators</p>
          <p className="text-sm text-gray-400">Aligned with Heritage Based Curriculum standards.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
