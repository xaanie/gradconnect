import React, { useState } from 'react';
import { GradeLevel, Subject, FlashcardInput, FlashcardSet } from '../types';
import { generateFlashcards } from '../services/geminiService';
import { generateFlashcardsPDF } from '../utils/pdfGenerator';
import LoadingSpinner from './LoadingSpinner';

const FlashcardMaker: React.FC = () => {
  const [formData, setFormData] = useState<FlashcardInput>({
    grade: GradeLevel.Grade3,
    subject: Subject.Math,
    topic: '',
    count: 8
  });

  const [loading, setLoading] = useState(false);
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

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
    setFlashcardSet(null);
    setFlippedCards({});

    try {
      const result = await generateFlashcards(formData);
      setFlashcardSet(result);
    } catch (err) {
      setError("Failed to generate flashcards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFlip = (index: number) => {
    setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block p-3 rounded-full bg-purple-100 text-purple-600 mb-4">
          <i className="fas fa-layer-group text-3xl"></i>
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Flashcard Maker</h2>
        <p className="text-gray-600 mt-2">Create printable study aids for any topic in seconds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-4 h-fit sticky top-24">
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-purple-600">
            <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">Configuration</h3>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Grade</label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
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
                  placeholder="e.g. Multiplication Tables"
                  className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Number of Cards</label>
                <select
                  name="count"
                  value={formData.count}
                  onChange={(e) => setFormData(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                  className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value={4}>4 Cards</option>
                  <option value={8}>8 Cards</option>
                  <option value={12}>12 Cards</option>
                  <option value={16}>16 Cards</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all flex justify-center items-center ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg'}`}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Generating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic mr-2"></i> Generate Cards
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
              <p className="mt-4 text-gray-400 text-sm">Crafting Questions and Answers...</p>
            </div>
          ) : flashcardSet ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                 <div>
                    <h3 className="font-bold text-lg text-gray-800">{flashcardSet.cards.length} Cards Generated</h3>
                    <p className="text-sm text-gray-500">Click a card to flip it.</p>
                 </div>
                 <button
                  onClick={() => generateFlashcardsPDF(flashcardSet)}
                  className="bg-red-600 text-white text-sm px-6 py-3 rounded-lg shadow hover:bg-red-700 transition flex items-center font-bold"
                >
                  <i className="fas fa-file-pdf mr-2"></i> Download PDF
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {flashcardSet.cards.map((card, index) => (
                  <div 
                    key={index}
                    className="group perspective h-48 cursor-pointer"
                    onClick={() => toggleFlip(index)}
                  >
                    <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${flippedCards[index] ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d', transform: flippedCards[index] ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                      {/* Front Side */}
                      <div className="absolute w-full h-full bg-white rounded-xl shadow-md border-2 border-purple-100 p-6 flex flex-col items-center justify-center text-center backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                        <div className="absolute top-2 left-2 text-xs font-bold text-purple-400 uppercase tracking-widest">Question</div>
                        <p className="text-xl font-bold text-gray-800">{card.front}</p>
                        <div className="absolute bottom-2 text-gray-400 text-xs"><i className="fas fa-sync-alt"></i> Click to flip</div>
                      </div>

                      {/* Back Side */}
                      <div className="absolute w-full h-full bg-purple-600 rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center backface-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                        <div className="absolute top-2 left-2 text-xs font-bold text-purple-200 uppercase tracking-widest">Answer</div>
                        <p className="text-xl font-bold text-white">{card.back}</p>
                        <div className="absolute bottom-2 text-purple-300 text-xs"><i className="fas fa-sync-alt"></i> Click to flip</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl h-full flex flex-col items-center justify-center p-12 text-gray-400 min-h-[500px]">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                 <i className="fas fa-clone text-3xl opacity-30"></i>
              </div>
              <p className="text-xl font-medium text-gray-500">No flashcards yet.</p>
              <p className="text-sm mt-2 max-w-xs text-center">Enter a topic on the left to generate study aids instantly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardMaker;
