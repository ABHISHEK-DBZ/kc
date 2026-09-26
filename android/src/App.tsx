import React, { useState } from 'react';
import { ScreenId, BottomTab } from './types';
import { PhoneFrame } from './components/PhoneFrame';
import { SplashScreen } from './screens/SplashScreen';
import { HomeScreen } from './screens/HomeScreen';
import { CommunityScreen } from './screens/CommunityScreen';
import { AskQuestionScreen } from './screens/AskQuestionScreen';
import { AnalyzingQuestionScreen } from './screens/AnalyzingQuestionScreen';
import { QuestionSentScreen } from './screens/QuestionSentScreen';
import { QuestionDetailScreen } from './screens/QuestionDetailScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { CommunityLeadersScreen } from './screens/CommunityLeadersScreen';
import { KnowledgeBaseScreen } from './screens/KnowledgeBaseScreen';
import { 
  Smartphone, 
  LayoutGrid, 
  RotateCcw, 
  Layers, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('splash');
  const [activeTab, setActiveTab] = useState<BottomTab>('home');
  const [viewMode, setViewMode] = useState<'interactive' | 'panoramic'>('interactive');
  const [questionText, setQuestionText] = useState(
    'I entered all sales but my GSTR-1 report is showing wrong total. How can I fix this?'
  );

  const screensList: { id: ScreenId; label: string; number: number }[] = [
    { id: 'splash', label: 'Splash / Auth', number: 1 },
    { id: 'home', label: 'Home Dashboard', number: 2 },
    { id: 'community', label: 'Community Feed', number: 3 },
    { id: 'ask', label: 'Ask a Question', number: 4 },
    { id: 'analyzing', label: 'AI Analysis', number: 5 },
    { id: 'question_sent', label: 'Question Sent', number: 6 },
    { id: 'question_detail', label: 'Question Detail', number: 7 },
    { id: 'profile', label: 'Profile & Menu', number: 8 },
    { id: 'leaders', label: 'Leaders', number: 9 },
    { id: 'knowledge', label: 'Knowledge Base', number: 10 },
  ];

  const handleNavigate = (screen: ScreenId) => {
    setCurrentScreen(screen);
    // sync tab if screen corresponds to a tab
    if (screen === 'home') setActiveTab('home');
    else if (screen === 'community') setActiveTab('community');
    else if (screen === 'profile') setActiveTab('more');
  };

  const renderScreenById = (screenId: ScreenId) => {
    switch (screenId) {
      case 'splash':
        return <SplashScreen onNavigate={handleNavigate} />;
      case 'home':
        return (
          <HomeScreen
            onNavigate={handleNavigate}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        );
      case 'community':
        return (
          <CommunityScreen
            onNavigate={handleNavigate}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        );
      case 'ask':
        return (
          <AskQuestionScreen
            onNavigate={handleNavigate}
            questionText={questionText}
            setQuestionText={setQuestionText}
          />
        );
      case 'analyzing':
        return <AnalyzingQuestionScreen onNavigate={handleNavigate} />;
      case 'question_sent':
        return <QuestionSentScreen onNavigate={handleNavigate} />;
      case 'question_detail':
        return (
          <QuestionDetailScreen
            onNavigate={handleNavigate}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            onNavigate={handleNavigate}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        );
      case 'leaders':
        return (
          <CommunityLeadersScreen
            onNavigate={handleNavigate}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        );
      case 'knowledge':
        return (
          <KnowledgeBaseScreen
            onNavigate={handleNavigate}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        );
      default:
        return <HomeScreen onNavigate={handleNavigate} activeTab={activeTab} onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800/80 bg-[#0d1322]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 font-black text-white text-base">
            KC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[15px] tracking-tight text-white">
                KhataCopilot FranchiseOS
              </span>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-950/80 border border-blue-800/60 px-2 py-0.5 rounded-full">
                Android App Build
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              10 Native Screens • PRD Implementation • Single Closed-Loop Architecture
            </span>
          </div>
        </div>

        {/* View Mode Toggle & Reset */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setViewMode('interactive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'interactive'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone size={14} />
              <span>Interactive Device</span>
            </button>
            <button
              onClick={() => setViewMode('panoramic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'panoramic'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid size={14} />
              <span>10-Screen Overview (Image Match)</span>
            </button>
          </div>

          <button
            onClick={() => {
              setCurrentScreen('splash');
              setActiveTab('home');
            }}
            title="Reset to Splash Screen"
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </header>

      {/* Screen Selector Tab Strip (For rapid switching) */}
      <div className="bg-[#0b101d] border-b border-slate-800/60 px-6 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mr-2 flex items-center gap-1 flex-shrink-0">
          <Layers size={13} />
          Screens:
        </span>
        {screensList.map((screen) => {
          const isActive = currentScreen === screen.id;
          return (
            <button
              key={screen.id}
              onClick={() => {
                handleNavigate(screen.id);
                if (viewMode === 'panoramic') setViewMode('interactive');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex-shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800/60 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black ${
                isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {screen.number}
              </span>
              <span>{screen.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main App Workspace */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {viewMode === 'interactive' ? (
          /* Single Interactive Phone Simulation */
          <div className="flex flex-col items-center animate-fadeIn">
            <div className="mb-4 text-center">
              <span className="text-xs font-bold text-slate-400">
                Current View:{' '}
                <strong className="text-blue-400">
                  {screensList.find((s) => s.id === currentScreen)?.label} (Screen #{screensList.find((s) => s.id === currentScreen)?.number})
                </strong>
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Interact freely with buttons, navigation, inputs, and state transitions
              </p>
            </div>

            <PhoneFrame isActive={true}>
              {renderScreenById(currentScreen)}
            </PhoneFrame>
          </div>
        ) : (
          /* Panoramic 10-Screen Grid Mode (Matching User Image) */
          <div className="w-full max-w-[1720px] mx-auto py-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-extrabold text-white">
                All 10 Android Mobile Screens
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Pixel-perfect match of the 10 screens from your attached design reference. Click any screen to interact with it directly.
              </p>
            </div>

            {/* Grid of 10 Phones (2 rows of 5) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 justify-items-center">
              {screensList.map((screen) => (
                <div key={screen.id} className="flex flex-col items-center">
                  <PhoneFrame
                    title={`Screen ${screen.number}: ${screen.label}`}
                    onClick={() => {
                      setCurrentScreen(screen.id);
                      setViewMode('interactive');
                    }}
                    scale={0.92}
                    isActive={currentScreen === screen.id}
                  >
                    {renderScreenById(screen.id)}
                  </PhoneFrame>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="h-10 border-t border-slate-800/80 bg-[#0d1322] px-6 flex items-center justify-between text-[11px] text-slate-500">
        <div>
          KhataCopilot NetworkOS • Built in <code className="text-slate-400">android/</code>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 size={12} /> Closed-loop AI Routing
          </span>
          <span className="flex items-center gap-1 text-blue-400">
            <Sparkles size={12} /> Auto-GST & Knowledge Agent
          </span>
        </div>
      </footer>
    </div>
  );
};
