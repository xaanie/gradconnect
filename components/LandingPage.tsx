import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      {/* Hero Section */}
      <header className="bg-zim-green text-white relative overflow-hidden">
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="container mx-auto px-6 py-24 relative z-10 flex flex-col items-center text-center">
          <div className="mb-8 p-4 bg-white/10 rounded-full backdrop-blur-sm animate-bounce-slow">
             <i className="fas fa-book-open text-6xl text-zim-yellow"></i>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
            ZimEd <span className="text-zim-yellow">Planner</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-3xl leading-relaxed">
            The ultimate automated Scheme of Work generator for Zimbabwean Primary Educators. 
            Fully aligned with the <strong>Heritage Based Curriculum (2024-2030)</strong>.
          </p>
          <button
            onClick={onGetStarted}
            className="group bg-zim-yellow text-zim-black font-bold py-4 px-12 rounded-full text-xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:bg-yellow-400 hover:shadow-2xl flex items-center"
          >
            Start Planning Now 
            <i className="fas fa-arrow-right ml-3 group-hover:translate-x-1 transition-transform"></i>
          </button>
          <p className="mt-6 text-sm text-gray-300 opacity-80">
            Supports Grades 3-7 • Generates PDF • 100% Free Tool
          </p>
        </div>
        
        {/* Abstract curve at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#f9fafb" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Why Choose ZimEd Planner?</h2>
          <div className="h-1 w-24 bg-zim-red mx-auto rounded"></div>
          <p className="text-gray-600 mt-6 text-lg max-w-2xl mx-auto">
            We understand the workload of Zimbabwean teachers. Our tool is designed to automate the administrative burden so you can focus on teaching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-zim-red group">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-100 transition-colors">
              <i className="fas fa-magic text-2xl text-zim-red"></i>
            </div>
            <h3 className="text-lg font-bold mb-3 text-center">AI Generation</h3>
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              Instantly generate detailed weekly schemes with objectives and activities.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-zim-green group">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-100 transition-colors">
              <i className="fas fa-graduation-cap text-2xl text-zim-green"></i>
            </div>
            <h3 className="text-lg font-bold mb-3 text-center">MoPSE Aligned</h3>
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              Strictly adheres to the Heritage Based Curriculum for Grades 3-7.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-purple-600 group">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-100 transition-colors">
              <i className="fas fa-clone text-2xl text-purple-600"></i>
            </div>
            <h3 className="text-lg font-bold mb-3 text-center">Flashcards</h3>
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              Create instant study aids and flashcards for any topic to boost learning.
            </p>
          </div>

           {/* Feature 4 (New) */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-indigo-600 group">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-100 transition-colors">
              <i className="fas fa-file-alt text-2xl text-indigo-600"></i>
            </div>
            <h3 className="text-lg font-bold mb-3 text-center">Assessments</h3>
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              Generate topical tests, quizzes, and marking guides with one click.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works / Stats */}
      <section className="bg-gray-800 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Streamline Your Planning</h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Stop spending weekends writing schemes by hand. ZimEd Planner uses advanced AI to consult the syllabus and generate comprehensive plans in seconds.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <i className="fas fa-check-circle text-zim-yellow mr-3 text-xl"></i>
                  <span>Includes Cross-Cutting Themes (ICT, Disaster Risk, etc.)</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check-circle text-zim-yellow mr-3 text-xl"></i>
                  <span>Detailed "Lesson 1 to Lesson 7" breakdown</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check-circle text-zim-yellow mr-3 text-xl"></i>
                  <span>New: Flashcards & Assessments</span>
                </li>
              </ul>
              <button onClick={onGetStarted} className="mt-8 text-zim-yellow hover:text-white font-semibold flex items-center transition-colors">
                Get Started <i className="fas fa-angle-right ml-2"></i>
              </button>
            </div>
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-6 text-center border-b border-white/10 pb-4">Supported Subjects</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 p-3 rounded flex items-center"><i className="fas fa-calculator text-zim-yellow mr-2"></i> Mathematics</div>
                    <div className="bg-gray-700/50 p-3 rounded flex items-center"><i className="fas fa-language text-zim-yellow mr-2"></i> English</div>
                    <div className="bg-gray-700/50 p-3 rounded flex items-center"><i className="fas fa-flask text-zim-yellow mr-2"></i> Science & Tech</div>
                    <div className="bg-gray-700/50 p-3 rounded flex items-center"><i className="fas fa-globe-africa text-zim-yellow mr-2"></i> Heritage Studies</div>
                    <div className="bg-gray-700/50 p-3 rounded flex items-center"><i className="fas fa-comments text-zim-yellow mr-2"></i> Indigenous Lang</div>
                    <div className="bg-gray-700/50 p-3 rounded flex items-center"><i className="fas fa-running text-zim-yellow mr-2"></i> PE & Arts</div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 mt-auto border-t border-gray-800">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
             <i className="fas fa-book-open text-zim-yellow"></i>
             <span className="font-bold text-lg">ZimEd Planner</span>
          </div>
          <p className="mb-6 text-gray-500 text-sm">
            Built with <i className="fas fa-heart text-zim-red mx-1"></i> for Zimbabwean Educators.
          </p>
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} ZimEd Planner. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
