import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  X,
  MessageCircle
} from 'lucide-react';
import { useAppStore } from './context/StoreContext';
import HomeView from './views/HomeView';
import SetupView from './views/SetupView';
import GameView from './views/GameView';
import HistoryView from './views/HistoryView';

export default function App() {
  const store = useAppStore();
  const [view, setView] = useState<'home' | 'setup' | 'game' | 'history'>('home');
  const [showContact, setShowContact] = useState(false);
  const [hasCheckedResume, setHasCheckedResume] = useState(false);

  useEffect(() => {
    if (store.currentMatch && !hasCheckedResume) {
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

  // Handle routing with Browser History API synchronization
  const navigate = (newView: 'home' | 'setup' | 'game' | 'history', replace: boolean = false) => {
    if (view === newView) return;
    
    if (replace) {
      window.history.replaceState({ view: newView }, '', '');
    } else {
      window.history.pushState({ view: newView }, '', '');
    }
    setView(newView);
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
      } else {
        setView('home');
      }
    };
    window.history.replaceState({ view }, '', '');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (!store) {
    return <div className="flex items-center justify-center h-screen bg-bg-page text-text-main">Cargando aplicación...</div>;
  }

  return (
    <div className={`min-h-screen transition-all duration-500 theme-${store.theme || 'minimalist'}`}>
      <div className="max-w-md mx-auto min-h-screen flex flex-col bg-bg-page shadow-xl overflow-hidden relative border-x border-border-theme">
        
        {/* Header */}
        <header className="p-4 flex items-center justify-between border-b border-border-theme bg-bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-2">
            {view !== 'home' && (
              <button 
                onClick={() => navigate('home')}
                className="p-1 hover:bg-primary/10 rounded-full transition-colors"
                id="back-button"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="font-display font-bold text-xl tracking-tight" id="app-title">
              Apuntes de Dominó <span className="text-primary italic">RD</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowContact(true)}
              className="p-2 bg-secondary/10 text-secondary rounded-full hover:bg-secondary/20 transition-all active:scale-90"
              title="Contacto Desarrollador"
              id="info-button"
            >
              <Info className="w-5 h-5" />
            </button>
            <button 
              onClick={() => store.toggleDarkMode()}
              className="p-2 bg-text-main/10 text-text-main rounded-full hover:bg-text-main/20 transition-all active:scale-90"
              title={store.isDarkMode ? "Modo Claro" : "Modo Oscuro"}
              id="theme-toggle-button"
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
              id="palette-button"
            >
              <Palette className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* View Container */}
        <main className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
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

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-16 bg-bg-card/80 backdrop-blur-md border-t border-border-theme flex items-center justify-around px-4 z-50">
          <NavButton active={view === 'home'} onClick={() => navigate('home')} icon={<HomeIcon />} label="Inicio" id="nav-home" />
          <NavButton active={view === 'history'} onClick={() => navigate('history')} icon={<History />} label="Historial" id="nav-history" />
          <NavButton 
            active={view === 'game' || view === 'setup'} 
            onClick={() => {
              if (store.currentMatch) navigate('game');
              else navigate('setup');
            }} 
            icon={<PlusCircle className={store.currentMatch ? "text-primary scale-110" : ""} />} 
            label={store.currentMatch ? "Partida" : "Nueva"} 
            id="nav-play"
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
                id="contact-modal"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-display font-bold" id="modal-title">Desarrollador</h3>
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
                  <ContactLink 
                    href="mailto:euddyvaldez@gmail.com" 
                    icon={<Mail className="w-5 h-5" />} 
                    label="Email" 
                    value="euddyvaldez@gmail.com"
                  />
                  <ContactLink 
                    href="https://wa.me/18294464056" 
                    icon={<MessageCircle className="w-5 h-5" />} 
                    label="WhatsApp" 
                    value="829-446-4056"
                    isWhatsApp
                  />
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

function NavButton({ active, onClick, icon, label, id }: { active: boolean, onClick: () => void, icon: React.ReactElement, label: string, id: string }) {
  return (
    <button 
      id={id}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all relative ${active ? 'text-primary' : 'text-text-main'}`}
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

function ContactLink({ href, icon, label, value, isWhatsApp }: any) {
  return (
    <a 
      href={href}
      target={isWhatsApp ? "_blank" : undefined}
      rel={isWhatsApp ? "noopener noreferrer" : undefined}
      className="flex items-center gap-4 p-4 bg-bg-card border border-border-theme rounded-2xl hover:border-primary/50 transition-all group"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isWhatsApp ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}`}>
        {icon}
      </div>
      <div className="text-left">
        <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{label}</p>
        <p className="text-[13px] font-bold tracking-tight">{value}</p>
      </div>
    </a>
  );
}
