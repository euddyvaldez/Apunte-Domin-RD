import { useState, ReactNode, useEffect } from 'react';
import { useStore } from './store';
import { AnimatePresence, motion } from 'motion/react';
import { 
  History, 
  PlusCircle, 
  ArrowLeft, 
  Home as HomeIcon,
  Moon,
  Sun,
  Palette,
  Info,
  Mail,
  User as UserIcon,
  MessageCircle,
  X
} from 'lucide-react';
import HomeView from './views/HomeView';
import SetupView from './views/SetupView';
import GameView from './views/GameView';
import HistoryView from './views/HistoryView';

export default function App() {
  const store = useStore();
  const [view, setView] = useState<'home' | 'setup' | 'game' | 'history'>('home');
  const [showContact, setShowContact] = useState(false);

  const [hasCheckedResume, setHasCheckedResume] = useState(false);

  useEffect(() => {
    if (!hasCheckedResume && store.currentMatch && view === 'home') {
      setView('game');
    }
    setHasCheckedResume(true);
  }, [store.currentMatch, hasCheckedResume]);

  useEffect(() => {
    if (store.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [store.isDarkMode]);

  if (!store) {
    return <div className="flex items-center justify-center h-screen">Cargando aplicación...</div>;
  }

  // Handle routing
  const navigate = (newView: 'home' | 'setup' | 'game' | 'history') => setView(newView);

  return (
    <div className={`min-h-screen transition-all duration-500 theme-${store.theme}`}>
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
              Apuntes de Dominó <span className="text-primary italic">RD</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowContact(true)}
              className="p-2 bg-secondary/10 text-secondary rounded-full hover:bg-secondary/20 transition-all active:scale-90"
              title="Contacto Desarrollador"
            >
              <Info className="w-5 h-5" />
            </button>
            <button 
              onClick={() => store.toggleDarkMode()}
              className="p-2 bg-text-main/10 text-text-main rounded-full hover:bg-text-main/20 transition-all active:scale-90"
              title={store.isDarkMode ? "Modo Claro" : "Modo Oscuro"}
            >
              {store.isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
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

        {/* Contact Modal */}
        <AnimatePresence>
          {showContact && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowContact(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-sm bg-bg-page border-2 border-border-theme p-6 rounded-[2rem] shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-display font-bold">Desarrollador</h3>
                  <button 
                    onClick={() => setShowContact(false)}
                    className="p-2 hover:bg-text-main/5 rounded-full text-text-dim transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <UserIcon className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">Euddy Valdez</p>
                    <p className="text-sm text-text-dim">Creador de Apuntes de Dominó RD</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <a 
                    href="mailto:euddyvaldez@gmail.com"
                    className="flex items-center gap-4 p-4 bg-bg-card border border-border-theme rounded-2xl hover:border-primary/50 transition-all group"
                  >
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Email</p>
                      <p className="text-sm font-bold">euddyvaldez@gmail.com</p>
                    </div>
                  </a>

                  <a 
                    href="https://wa.me/18294464056"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-bg-card border border-border-theme rounded-2xl hover:border-green-500/50 transition-all group"
                  >
                    <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-all">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">WhatsApp</p>
                      <p className="text-sm font-bold">829-446-4056</p>
                    </div>
                  </a>
                </div>

                <button 
                  onClick={() => setShowContact(false)}
                  className="w-full bg-primary text-white p-4 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  Cerrar
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all relative ${active ? 'text-primary' : 'text-text-main'}`}
    >
      <motion.span 
        animate={active ? { scale: 1.2, y: -2 } : { scale: 1, y: 0 }}
        className={`w-7 h-7 flex items-center justify-center ${active ? 'drop-shadow-sm' : 'opacity-70'}`}
      >
        {icon}
      </motion.span>
      <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-60'}`}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
        />
      )}
    </button>
  );
}
