import { useState, ReactNode } from 'react';
import { useStore } from './store';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Trophy, 
  History, 
  PlusCircle, 
  Settings, 
  ArrowLeft, 
  Users, 
  Home as HomeIcon,
  Moon,
  Sun,
  Palette
} from 'lucide-react';
import HomeView from './views/HomeView';
import SetupView from './views/SetupView';
import GameView from './views/GameView';
import HistoryView from './views/HistoryView';
import PracticeView from './views/PracticeView';

export default function App() {
  const store = useStore();
  const [view, setView] = useState<'home' | 'setup' | 'game' | 'history' | 'practice'>('home');

  // Handle routing
  const navigate = (newView: 'home' | 'setup' | 'game' | 'history' | 'practice') => setView(newView);

  return (
    <div className={`min-h-screen transition-colors duration-500 theme-${store.theme}`}>
      <div className="max-w-md mx-auto min-h-screen flex flex-col bg-bg-page shadow-xl overflow-hidden relative border-x border-border-theme">
        
        {/* Header */}
        <header className="p-4 flex items-center justify-between border-b border-border-theme bg-bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-2">
            {view !== 'home' && (
              <button 
                onClick={() => navigate('home')}
                className="p-1 hover:bg-primary/10 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="font-display font-bold text-xl tracking-tight">
              Dominó <span className="text-primary italic">RD</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const themes: ('minimalist' | 'escolar' | 'cartulina' | 'sleek')[] = ['minimalist', 'escolar', 'cartulina', 'sleek'];
                const nextIdx = (themes.indexOf(store.theme) + 1) % themes.length;
                store.setTheme(themes[nextIdx]);
              }}
              className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-all active:scale-90"
              title="Cambiar Tema"
            >
              <Palette className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* View Container */}
        <main className="flex-1 overflow-y-auto pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {view === 'home' && <HomeView navigate={navigate} store={store} />}
              {view === 'setup' && <SetupView navigate={navigate} store={store} />}
              {view === 'game' && <GameView navigate={navigate} store={store} />}
              {view === 'history' && <HistoryView navigate={navigate} store={store} />}
              {view === 'practice' && <PracticeView navigate={navigate} store={store} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation (Only on small screens / inside container) */}
        <nav className="absolute bottom-0 left-0 right-0 h-16 bg-bg-card/80 backdrop-blur-md border-t border-border-theme flex items-center justify-around px-4 z-50">
          <NavButton active={view === 'home'} onClick={() => navigate('home')} icon={<HomeIcon />} label="Inicio" />
          <NavButton active={view === 'history'} onClick={() => navigate('history')} icon={<History />} label="Historial" />
          <NavButton 
            active={view === 'game' || view === 'setup'} 
            onClick={() => {
              if (store.currentMatch) navigate('game');
              else navigate('setup');
            }} 
            icon={<PlusCircle className={store.currentMatch ? "text-primary" : ""} />} 
            label={store.currentMatch ? "Partida" : "Nueva"} 
          />
        </nav>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-primary scale-110' : 'text-text-dim opacity-60'}`}
    >
      <span className="w-6 h-6">{icon}</span>
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
    </button>
  );
}
