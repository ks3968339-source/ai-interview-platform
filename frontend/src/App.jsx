import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  History, 
  Terminal, 
  ChevronLeft, 
  Loader2, 
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Database,
  Code,
  Users,
  Compass,
  MessageSquare
} from 'lucide-react';
import CategoryCard from './components/CategoryCard';
import CountdownTimer from './components/CountdownTimer';
import FeedbackModal from './components/FeedbackModal';
import PerformanceChart from './components/PerformanceChart';
import AuthOverlay from './components/AuthOverlay';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const CATEGORIES = [
  {
    title: "Database Management Systems",
    description: "Deep dive into SQL joins, database index designs (B-Trees), transaction ACID properties, and relational normalizations.",
    iconName: "Database",
    colorClass: "from-cyan-500 to-blue-600",
    difficultyRange: "Easy - Medium",
    questionCount: 4
  },
  {
    title: "Core Programming",
    description: "Evaluate your object-oriented principles, Liskov substitution, polymorphism, clean architectural layouts, and SOLID designs.",
    iconName: "Code",
    colorClass: "from-indigo-500 to-purple-600",
    difficultyRange: "Easy - Hard",
    questionCount: 3
  },
  {
    title: "Data Structures and Algorithms",
    description: "Challenge yourself with algorithmic problem-solving: binary searches, hash maps mechanics, linked lists, and time complexity reviews.",
    iconName: "Terminal",
    colorClass: "from-emerald-500 to-teal-600",
    difficultyRange: "Easy - Medium",
    questionCount: 3
  },
  {
    title: "Behavioral",
    description: "Practice soft skills using the STAR technique (Situation, Task, Action, Result). Answer questions on teamwork, mistake resolution, and ownership.",
    iconName: "Users",
    colorClass: "from-amber-500 to-rose-600",
    difficultyRange: "Medium",
    questionCount: 2
  }
];

export default function App() {
  // State variables
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [screen, setScreen] = useState('dashboard'); // dashboard | interview
  const [selectedCategory, setSelectedCategory] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswerText, setUserAnswerText] = useState('');
  
  // Feedback evaluation states
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState(null);
  const [activeQuestionText, setActiveQuestionText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize and load user profile + metrics
  useEffect(() => {
    fetchProfile(token);
  }, [token]);

  const fetchProfile = async (activeToken) => {
    try {
      setLoading(true);
      const headers = {};
      if (activeToken) {
        headers['Authorization'] = `Bearer ${activeToken}`;
      }

      // 1. Get authenticated user profile (or fallback to seed)
      const userRes = await fetch(`${API_BASE_URL}/users/profile`, { headers });
      if (!userRes.ok) throw new Error("Profile fetch failed");
      const userData = await userRes.json();
      setUser(userData);

      // 2. Fetch metrics and progress tracking
      const perfRes = await fetch(`${API_BASE_URL}/users/${userData.id}/performance`, { headers });
      const perfData = await perfRes.json();
      setPerformance(perfData);
    } catch (e) {
      console.error("❌ API Fetch Error during bootstrap:", e);
    } finally {
      setLoading(false);
    }
  };

  // Auth Overlay Success Handler
  const handleAuthSuccess = (userData, authToken) => {
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(userData);
  };

  // Log Out Routine
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setPerformance(null);
    setScreen('dashboard');
  };

  // Start interview workflow
  const handleSelectCategory = async (categoryName) => {
    try {
      setLoading(true);
      setSelectedCategory(categoryName);
      
      // Fetch questions filtered by category with auth headers
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const qRes = await fetch(`${API_BASE_URL}/questions?category=${encodeURIComponent(categoryName)}`, { headers });
      const qData = await qRes.json();
      
      setQuestions(qData);
      setCurrentQuestionIndex(0);
      setUserAnswerText('');
      setScreen('interview');
    } catch (e) {
      console.error("❌ Error fetching category questions:", e);
    } finally {
      setLoading(false);
    }
  };

  // Handle Response submission
  const handleSubmitAnswer = async () => {
    if (!userAnswerText.trim()) return;

    try {
      setIsEvaluating(true);
      const currentQuestion = questions[currentQuestionIndex];
      
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/answers`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: user.id,
          questionId: currentQuestion.id,
          userAnswerText: userAnswerText
        })
      });

      if (!response.ok) {
        throw new Error("Failed to submit response");
      }

      const answerData = await response.json();
      
      // Open feedback modal with generated AI evaluation details
      setActiveFeedback({
        score: answerData.aiScore,
        whatWasDoneWell: answerData.aiFeedback.whatWasDoneWell,
        actionableInsights: answerData.aiFeedback.actionableInsights,
        optimizedAnswer: answerData.aiFeedback.optimizedAnswer
      });
      setActiveQuestionText(currentQuestion.questionText);
      setIsModalOpen(true);

      // Refresh stats in background
      const headersRefresh = {};
      if (token) headersRefresh['Authorization'] = `Bearer ${token}`;

      const perfRes = await fetch(`${API_BASE_URL}/users/${user.id}/performance`, { headers: headersRefresh });
      const perfData = await perfRes.json();
      setPerformance(perfData);

    } catch (e) {
      console.error("❌ Submission Error:", e);
    } finally {
      setIsEvaluating(false);
    }
  };

  // When timer hits 0, auto-submit what user wrote
  const handleTimeUp = () => {
    if (userAnswerText.trim()) {
      handleSubmitAnswer();
    } else {
      // Return to dashboard if completely empty
      setScreen('dashboard');
      alert("⏰ Timer expired! No response was submitted.");
    }
  };

  // Review a past answer from the history list
  const handleReviewPastAnswer = (item) => {
    setActiveFeedback(item.feedback);
    setActiveQuestionText(item.questionText);
    setIsModalOpen(true);
  };

  // Words counting utility
  const getWordCount = (text) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  if (!token) {
    return <AuthOverlay onAuthSuccess={handleAuthSuccess} apiBaseUrl={API_BASE_URL} />;
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-[#060913] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Initializing Practice Arena...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthOverlay onAuthSuccess={handleAuthSuccess} apiBaseUrl={API_BASE_URL} />;
  }

  return (
    <div className="min-h-screen bg-[#060913] bg-radial-glow pb-16 relative">
      
      {/* Upper Navigation Bar */}
      <header className="border-b border-slate-900 bg-slate-950/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setScreen('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-1.5">
                TalentFlow <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold px-2 py-0.5 rounded-md">AI v1.5</span>
              </h1>
              <p className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">Interview Practice Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-300">{user.name}</span>
              <span className="text-xs text-slate-500">{user.email}</span>
            </div>
            <div className="w-10 h-10 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center text-sm font-bold text-indigo-400 shadow-inner">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <button 
              onClick={handleLogout}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 px-3.5 py-2 rounded-xl cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {screen === 'dashboard' ? (
          /* ==============================================================
             1. HOME DASHBOARD SUITE
             ============================================================== */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Hero Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-950/60 to-slate-900/30 p-8 rounded-3xl border border-slate-800/50">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                  Elevate Your Technical Interviews
                </h2>
                <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                  Select a category to practice curated industry questions. Submit your answer and receive deep, modular AI analysis on what you solved correctly and how to optimize it.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                  ⚡ Real-Time Feedback
                </span>
                <span className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  🎯 LLM Scored
                </span>
              </div>
            </div>

            {/* Performance Overview (Analytical grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats Card 1: Score Average */}
              <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between h-[280px]">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-400">Average AI Grade</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Target: 8.0+</span>
                </div>
                <div className="my-4 flex items-baseline gap-1 justify-center">
                  <span className="text-7xl font-extrabold tracking-tight text-white">{performance?.metrics.averageScore || 0}</span>
                  <span className="text-xl text-slate-500 font-semibold">/10</span>
                </div>
                <div className="w-full bg-slate-900/80 border border-slate-800/80 px-4 py-3 rounded-2xl flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Evaluations completed:</span>
                  <span className="text-slate-200 font-extrabold">{performance?.metrics.totalAnswered || 0}</span>
                </div>
              </div>

              {/* Stats Card 2: Performance Graph */}
              <div className="lg:col-span-2">
                <PerformanceChart history={performance?.history} />
              </div>
            </div>

            {/* Category selection row */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Compass className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl font-extrabold text-slate-100">Select Practice Subject</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {CATEGORIES.map((cat, idx) => (
                  <CategoryCard
                    key={idx}
                    title={cat.title}
                    description={cat.description}
                    iconName={cat.iconName}
                    colorClass={cat.colorClass}
                    difficultyRange={cat.difficultyRange}
                    questionCount={cat.questionCount}
                    onClick={() => handleSelectCategory(cat.title)}
                  />
                ))}
              </div>
            </div>

            {/* Historic logs & records */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Category-wise averages */}
              <div className="glass-panel p-6 rounded-3xl h-auto lg:h-[400px] flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-1">
                    <Terminal className="w-5 h-5 text-cyan-400" />
                    Subject Breakdown
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">Your average marks parsed per subject area</p>
                </div>
                
                <div className="space-y-4">
                  {Object.entries(performance?.metrics.categoryBreakdown || {}).map(([cat, avgScore]) => (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-400 truncate max-w-[200px]">{cat}</span>
                        <span className="text-slate-200">{avgScore}/10</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 border border-slate-800/80 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                          style={{ width: `${(avgScore / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-[10px] text-slate-500 font-medium text-center mt-6">
                  Complete questions in each area to update averages
                </div>
              </div>

              {/* Historical session list */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-3xl h-auto lg:h-[400px] flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-1">
                    <History className="w-5 h-5 text-indigo-400" />
                    Interview Logs
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Historical detailed analysis report indexes</p>
                </div>

                <div className="flex-grow overflow-y-auto max-h-[250px] space-y-3 pr-2">
                  {!performance || performance.history.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-center">
                      <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="text-xs text-slate-500">No records completed yet.</p>
                    </div>
                  ) : (
                    performance.history.map((item, idx) => (
                      <div 
                        key={idx}
                        className="bg-slate-900/60 hover:bg-slate-800/50 border border-slate-800/80 hover:border-slate-700/60 p-4 rounded-2xl flex items-center justify-between gap-4 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                            item.score >= 8 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            item.score >= 5 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {item.score}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-slate-200 truncate leading-snug">
                              {item.questionText}
                            </h4>
                            <div className="flex gap-2 text-[10px] text-slate-500 mt-1">
                              <span className="font-semibold text-indigo-400">{item.category}</span>
                              <span>•</span>
                              <span>{new Date(item.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleReviewPastAnswer(item)}
                          className="flex-shrink-0 text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
                        >
                          View Report
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="text-[10px] text-slate-500 font-medium text-right mt-2">
                  Total logged records: {performance?.history.length || 0}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ==============================================================
             2. DISTRACTION-FREE INTERVIEW INTERFACE
             ============================================================== */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header / Nav Panel */}
            <div className="flex justify-between items-center">
              <button 
                onClick={() => setScreen('dashboard')}
                className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-100 transition-colors bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Exit Arena</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-full">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-xs font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-full">
                  {selectedCategory}
                </span>
              </div>
            </div>

            {/* Split Screen layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Column: Question details & Timer */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                
                {/* Question Details Card */}
                <div className="glass-panel p-8 rounded-3xl flex-grow flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active prompt</span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        questions[currentQuestionIndex]?.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        questions[currentQuestionIndex]?.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {questions[currentQuestionIndex]?.difficulty}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold tracking-tight text-slate-100 leading-snug">
                      {questions[currentQuestionIndex]?.questionText}
                    </h3>
                  </div>

                  <div className="mt-8 bg-slate-950/60 border border-slate-900 p-5 rounded-2xl text-xs space-y-3 leading-relaxed text-slate-400">
                    <p className="font-semibold text-slate-200">💡 Performance Suggestions:</p>
                    <ul className="list-disc list-inside space-y-1.5 text-slate-400">
                      <li>Use clear structured formatting for technical concepts.</li>
                      <li>Incorporate details on edge-cases and limits.</li>
                      <li>Address Big O time & space efficiency if coding/DSA.</li>
                      <li>Include structural STAR examples if behavioral.</li>
                    </ul>
                  </div>
                </div>

                {/* SVG Countdown Timer */}
                <CountdownTimer 
                  initialSeconds={300} // 5 mins standard
                  onTimeUp={handleTimeUp}
                  isActive={!isEvaluating} 
                />
              </div>

              {/* Right Column: IDE response text editor */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-6">
                <div className="glass-panel rounded-3xl overflow-hidden flex flex-col h-full min-h-[400px]">
                  
                  {/* IDE header */}
                  <div className="bg-slate-950/80 border-b border-slate-900 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                      <span className="text-xs font-mono text-slate-500 ml-2">answer_submission.md</span>
                    </div>

                    <div className="flex gap-4 text-xs font-semibold text-slate-500">
                      <span>Words: <span className="font-mono text-indigo-400">{getWordCount(userAnswerText)}</span></span>
                      <span>Chars: <span className="font-mono text-cyan-400">{userAnswerText.length}</span></span>
                    </div>
                  </div>

                  {/* Textarea */}
                  <textarea
                    value={userAnswerText}
                    onChange={(e) => setUserAnswerText(e.target.value)}
                    disabled={isEvaluating}
                    placeholder="Provide your detailed answer here... (Tip: Write comprehensively to score high. Detail critical points, trade-offs, and complexities)"
                    className="flex-grow w-full bg-slate-950/40 p-6 text-sm text-slate-100 font-mono leading-relaxed resize-none outline-none focus:bg-slate-950/80 transition-colors"
                  />
                  
                  {/* Action row */}
                  <div className="bg-slate-950/60 border-t border-slate-900 px-6 py-4 flex items-center justify-between gap-4">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      Submit when fully formulated.
                    </p>

                    <div className="flex gap-3">
                      {questions.length > 1 && (
                        <button
                          onClick={() => {
                            const nextIdx = (currentQuestionIndex + 1) % questions.length;
                            setCurrentQuestionIndex(nextIdx);
                            setUserAnswerText('');
                          }}
                          disabled={isEvaluating}
                          className="btn-neon-secondary flex items-center gap-2 text-xs py-2 px-4"
                        >
                          Skip / Next
                        </button>
                      )}
                      
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={isEvaluating || !userAnswerText.trim()}
                        className={`btn-neon-primary flex items-center gap-2 text-xs py-2 px-5 ${
                          (!userAnswerText.trim() || isEvaluating) ? 'opacity-40 cursor-not-allowed shadow-none' : ''
                        }`}
                      >
                        {isEvaluating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Response</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Structured Evaluation Shimmer Backdrop Overlay */}
      {isEvaluating && (
        <div className="fixed inset-0 bg-[#03060f]/80 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300">
          <div className="max-w-md bg-slate-950/80 border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
            
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
              <Terminal className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Analyzing Response</h3>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              We are routing your response through the Gemini AI evaluator. The engine is inspecting your solution against key definitions, complexities, and architectural standards...
            </p>

            <div className="w-full mt-6 h-1.5 bg-slate-900 border border-slate-800/80 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full shimmer" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      )}

      {/* Structural Feedback Modal Overlay */}
      <FeedbackModal
        isOpen={isModalOpen}
        feedback={activeFeedback}
        questionText={activeQuestionText}
        onClose={() => {
          setIsModalOpen(false);
          setScreen('dashboard');
        }}
      />

    </div>
  );
}
