/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  Settings, 
  Home, 
  ArrowLeft, 
  HelpCircle, 
  Headphones, 
  BookOpen, 
  Puzzle, 
  Map as MapIcon, 
  Trophy,
  Pause,
  Play as PlayIcon,
  Volume2,
  Lock,
  ChevronLeft,
  Zap,
  CheckCircle2,
  Gamepad2,
  Mic,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Screen, SONGS, SongNode } from './types';
import { sfxService } from './services/sfxService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('MAP');
  const [songs, setSongs] = useState<SongNode[]>(SONGS);
  const [selectedSongId, setSelectedSongId] = useState<string>(SONGS[0].id);
  const [progress, setProgress] = useState(25);

  const selectedSong = songs.find(s => s.id === selectedSongId) || songs[0];

  useEffect(() => {
    const handleUpdateProgress = (e: any) => {
      setProgress(p => {
        const newProgress = Math.min(100, p + e.detail);
        
        // Unlock next song logic
        if (newProgress >= 50) {
          setSongs(prev => prev.map(s => s.id === 'macdonald' ? { ...s, locked: false } : s));
        }
        if (newProgress >= 75) {
          setSongs(prev => prev.map(s => s.id === 'sheep' ? { ...s, locked: false } : s));
        }
        if (newProgress >= 100) {
          setSongs(prev => prev.map(s => s.id === 'bus' ? { ...s, locked: false } : s));
        }
        
        return newProgress;
      });
    };
    window.addEventListener('updateProgress', handleUpdateProgress);
    return () => window.removeEventListener('updateProgress', handleUpdateProgress);
  }, []);

  const navigateTo = (screen: Screen) => {
    sfxService.playClick();
    setCurrentScreen(screen);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-on-surface font-body select-none">
      <AnimatePresence mode="wait">
        {currentScreen === 'MAP' && (
          <MapScreen 
            songs={songs}
            onSelectSong={(song) => {
              setSelectedSongId(song.id);
              navigateTo('HUB');
            }} 
            progress={progress}
          />
        )}
        {currentScreen === 'HUB' && (
          <HubScreen 
            song={selectedSong} 
            onBack={() => navigateTo('MAP')} 
            onNavigate={navigateTo}
          />
        )}
        {currentScreen === 'LISTEN' && (
          <ListenScreen 
            song={selectedSong} 
            onBack={() => navigateTo('HUB')} 
            onNavigate={navigateTo}
          />
        )}
        {currentScreen === 'READ' && (
          <ReadScreen 
            song={selectedSong} 
            onBack={() => navigateTo('HUB')} 
            onNavigate={navigateTo}
          />
        )}
        {currentScreen === 'PLAY' && (
          <PlayScreen 
            song={selectedSong} 
            onBack={() => navigateTo('HUB')} 
            onNavigate={navigateTo}
          />
        )}
        {currentScreen === 'KARAOKE' && (
          <KaraokeScreen 
            song={selectedSong} 
            onBack={() => navigateTo('LISTEN')} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function HomeButton({ onClick, className = "" }: { onClick: () => void, className?: string }) {
  return (
    <button 
      onClick={() => {
        sfxService.playClick();
        onClick();
      }}
      className={`${className} w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex flex-col items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all shadow-xl border border-white/20`}
    >
      <Home size={32} fill="currentColor" />
      <span className="text-[10px] font-bold mt-1">HomePage</span>
    </button>
  );
}

function ActivityNavButton({ 
  type, 
  onClick,
  className = ""
}: { 
  type: 'LISTEN' | 'READ' | 'PLAY', 
  onClick: () => void,
  className?: string
}) {
  const config = {
    LISTEN: {
      icon: <Headphones size={48} fill="currentColor" />,
      label: '听一听',
      color: 'bg-secondary-fixed text-on-secondary-fixed shadow-[0_12px_0_#004d68]'
    },
    READ: {
      icon: <BookOpen size={48} fill="currentColor" />,
      label: '读一读',
      color: 'bg-primary-fixed text-on-primary-fixed shadow-[0_12px_0_#604700]'
    },
    PLAY: {
      icon: <Gamepad2 size={48} fill="currentColor" />,
      label: '玩一玩',
      color: 'bg-tertiary-fixed text-on-tertiary-fixed shadow-[0_12px_0_#03501b]'
    }
  };

  const { icon, label, color } = config[type];

  return (
    <button 
      onClick={() => {
        sfxService.playClick();
        onClick();
      }}
      className={`${color} ${className} w-36 h-36 rounded-full flex flex-col items-center justify-center gap-1 border-4 border-white/40 shadow-2xl transition-all active:translate-y-2 active:shadow-none`}
    >
      {icon}
      <span className="font-headline font-bold text-xl">{label}</span>
    </button>
  );
}

function MapScreen({ songs, onSelectSong, progress }: { songs: SongNode[], onSelectSong: (song: SongNode) => void, progress: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full relative overflow-hidden"
    >
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-12 py-6 bg-white/80 backdrop-blur-xl rounded-b-[3rem] shadow-[0_12px_40px_rgba(117,87,0,0.1)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-container p-1 shadow-sm overflow-hidden border-2 border-white">
            <img 
              alt="Avatar" 
              className="w-full h-full rounded-full bg-white object-cover" 
              src="https://picsum.photos/seed/kid/100/100"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-2xl font-black text-primary tracking-tight font-headline">English Playworld</div>
        </div>
        <nav className="hidden md:flex gap-12">
          <button 
            onClick={() => sfxService.playClick()}
            className="font-headline font-bold text-lg text-primary border-b-4 border-primary-fixed pb-1"
          >
            Animals
          </button>
          <button 
            onClick={() => sfxService.playClick()}
            className="font-headline font-bold text-lg text-on-surface-variant/60"
          >
            Plants
          </button>
          <button 
            onClick={() => sfxService.playClick()}
            className="font-headline font-bold text-lg text-on-surface-variant/60"
          >
            Daily Life
          </button>
        </nav>
        <div className="flex gap-4">
          <button 
            onClick={() => sfxService.playClick()}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/80 text-primary shadow-sm active:scale-95 transition-all"
          >
            <Star size={24} fill="currentColor" />
          </button>
          <button 
            onClick={() => sfxService.playClick()}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/80 text-primary shadow-sm active:scale-95 transition-all"
          >
            <Settings size={24} />
          </button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="w-full h-full pt-32 pb-24 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
           <img 
            alt="Zoo background" 
            className="w-full h-full object-cover opacity-30" 
            src="https://picsum.photos/seed/zoo/1920/1080"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* The Path (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" fill="none" viewBox="0 0 1200 600">
          <path 
            className="path-dash" 
            d="M150,450 C300,450 400,150 600,150 C800,150 900,450 1100,450" 
            stroke="#fbc02d" 
            strokeLinecap="round" 
            strokeOpacity="1" 
            strokeWidth="20" 
          />
        </svg>

        {/* Nodes */}
        <div className="relative z-20 w-full h-full max-w-6xl mx-auto px-12">
          {songs.map((song) => (
            <div 
              key={song.id}
              className="absolute" 
              style={{ 
                left: song.position.left, 
                top: song.position.top, 
                bottom: song.position.bottom 
              }}
            >
              <div className="flex flex-col items-center gap-4">
                {!song.locked && (
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-xl relative mb-4 border-b-4 border-surface-container-low"
                  >
                    <div className="text-center">
                      <h3 className="font-headline font-bold text-on-surface text-lg leading-tight">{song.title}</h3>
                      <p className="text-sm text-on-surface-variant font-medium">{song.chineseTitle}</p>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 rotate-45"></div>
                  </motion.div>
                )}

                <motion.button
                  whileHover={!song.locked ? { scale: 1.05 } : {}}
                  whileTap={!song.locked ? { scale: 0.95 } : {}}
                  onClick={() => {
                    if (!song.locked) {
                      sfxService.playClick();
                      onSelectSong(song);
                    }
                  }}
                  className={`w-40 h-40 rounded-3xl flex flex-col items-center justify-center p-6 border-4 border-white/50 relative transition-all ${
                    song.locked 
                      ? 'bg-surface-container-highest/90 grayscale shadow-[0_12px_0px_rgba(0,0,0,0.1)]' 
                      : 'bg-primary-container shadow-[0_12px_0px_#604700] active:translate-y-2 active:shadow-none'
                  }`}
                >
                  {song.locked ? (
                    <>
                      <Lock size={48} className="text-outline-variant/40" />
                      <div className="absolute inset-0 bg-black/10 rounded-3xl flex items-center justify-center">
                        <Lock size={40} className="text-white drop-shadow-lg" fill="currentColor" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Star size={64} className="text-white drop-shadow-md mb-4" fill="currentColor" />
                      <div className="bg-white text-primary font-headline font-extrabold px-6 py-1 rounded-full shadow-md text-lg tracking-wide">PLAY</div>
                    </>
                  )}
                </motion.button>
                
                {song.locked && (
                  <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-full text-center shadow-sm border border-white/50">
                    <h4 className="font-headline font-bold text-on-surface-variant">{song.title}</h4>
                    <p className="text-[10px] text-on-surface-variant opacity-70 font-black uppercase tracking-widest">Locked</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 h-28 bg-white/70 backdrop-blur-xl px-12 flex items-center justify-between z-50 rounded-t-[3rem] shadow-[0_-12px_40px_rgba(0,0,0,0.05)] border-t border-white/60">
        <div className="flex items-center gap-8 w-full max-w-5xl mx-auto">
          <div 
            onClick={() => sfxService.playClick()}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shadow-[0_6px_0px_#604700] transform transition-transform group-hover:scale-110 active:translate-y-1 active:shadow-none">
              <MapIcon size={32} />
            </div>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Map</span>
          </div>
          <div className="flex-1 bg-surface-container-low h-10 rounded-full relative overflow-hidden shadow-inner border-2 border-white/80">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-tertiary to-green-500 rounded-full shadow-lg flex items-center justify-end pr-3"
            >
              <div className="w-4 h-4 rounded-full bg-white/80 animate-pulse"></div>
            </motion.div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="font-headline font-black text-primary text-3xl block leading-none">{progress}%</span>
              <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">Zoo Explore</span>
            </div>
            <div 
              onClick={() => sfxService.playClick()}
              className="w-16 h-16 rounded-full bg-secondary text-white flex items-center justify-center shadow-xl border-4 border-white transition-transform hover:rotate-12 cursor-pointer"
            >
              <Trophy size={32} fill="currentColor" />
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}

function HubScreen({ song, onBack, onNavigate }: { song: SongNode, onBack: () => void, onNavigate: (s: Screen) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="h-full w-full relative z-10 flex flex-col bg-night-sky"
      style={{ background: 'radial-gradient(circle at 80% 20%, #2c3e50, #000000)' }}
    >
      {/* Decorative Stars */}
      <div className="absolute top-28 right-12 w-48 h-48 bg-white rounded-full shadow-[0_0_80px_rgba(255,255,255,0.3)] flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full">
          <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-on-surface-variant rounded-full"></div>
          <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-on-surface-variant rounded-full"></div>
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-16 h-8 border-b-4 border-on-surface-variant rounded-full"></div>
        </div>
      </div>

      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-8">
        <div className="flex-1 flex justify-start">
          <HomeButton onClick={onBack} />
        </div>
        <div className="flex-[2] flex justify-center">
          <h1 className="text-3xl md:text-4xl font-black text-white font-headline tracking-tight text-center drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
            {song.title}
          </h1>
        </div>
        <div className="flex-1 flex justify-end items-center gap-4">
          <div className="hidden lg:flex bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm items-center gap-3">
            <span className="font-headline font-bold text-yellow-200 text-sm">1/3 done</span>
            <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-yellow-400 rounded-full shadow-[0_0_8px_#facc15]"></div>
            </div>
          </div>
          <div className="flex gap-2">
            <Star 
              className="text-yellow-400 cursor-pointer" 
              fill="currentColor" 
              size={28} 
              onClick={() => sfxService.playClick()}
            />
            <HelpCircle 
              className="text-yellow-400 cursor-pointer" 
              size={28} 
              onClick={() => sfxService.playClick()}
            />
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-12 pb-12 pt-24">
        <div className="grid grid-cols-3 gap-12 w-full max-w-6xl h-3/5">
          <HubButton 
            icon={<Headphones size={80} />} 
            title="听一听" 
            subtitle="Listen to the song" 
            color="from-secondary-container to-secondary"
            onClick={() => onNavigate('LISTEN')}
          />
          <HubButton 
            icon={<BookOpen size={80} />} 
            title="读一读" 
            subtitle="Read the story" 
            color="from-primary-container to-primary"
            onClick={() => onNavigate('READ')}
          />
          <HubButton 
            icon={<Gamepad2 size={80} />} 
            title="玩一玩" 
            subtitle="Play a game" 
            color="from-tertiary-container to-tertiary"
            onClick={() => onNavigate('PLAY')}
          />
        </div>
      </main>
    </motion.div>
  );
}

function HubButton({ icon, title, subtitle, color, onClick }: { icon: ReactNode, title: string, subtitle: string, color: string, onClick: () => void }) {
  const handleClick = () => {
    sfxService.playClick();
    onClick();
  };

  return (
    <motion.button 
      whileHover={{ y: -10 }}
      whileTap={{ y: 8 }}
      onClick={handleClick}
      className={`group relative flex flex-col items-center justify-between p-10 bg-gradient-to-b ${color} rounded-3xl shadow-[0_15px_0_0_rgba(0,0,0,0.2)] transition-all`}
    >
      <div className="flex-grow flex items-center justify-center">
        <div className="w-40 h-40 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
          <div className="text-white">{icon}</div>
        </div>
      </div>
      <div className="text-center mt-6">
        <h2 className="font-headline text-5xl font-black text-white mb-2">{title}</h2>
        <p className="font-body text-xl font-bold text-white/80">{subtitle}</p>
      </div>
    </motion.button>
  );
}

function ListenScreen({ song, onBack, onNavigate }: { song: SongNode, onBack: () => void, onNavigate: (s: Screen) => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentLyricIndex((prev) => (prev + 1) % song.content.lyrics.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, song.content.lyrics.length]);

  const handleBack = () => {
    sfxService.playClick();
    onBack();
  };

  const handleTogglePlay = () => {
    sfxService.playClick();
    setIsPlaying(!isPlaying);
  };

  const handleNavigate = (s: Screen) => {
    sfxService.playClick();
    onNavigate(s);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full relative z-10 flex flex-col"
      style={{ background: 'linear-gradient(180deg, #001a26 0%, #00394e 100%)' }}
    >
      <nav className="relative z-50 flex justify-between items-start p-10">
        <HomeButton onClick={handleBack} />
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <h2 className="font-headline text-5xl font-black text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">听一听</h2>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => onNavigate('KARAOKE')}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-headline font-black text-xl shadow-[0_8px_0_#9d174d] active:translate-y-1 active:shadow-none transition-all hover:scale-105"
          >
            <Mic size={28} fill="currentColor" />
            <span>K歌模式</span>
          </button>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center relative z-10 px-20">
        <div className="relative group">
          <div className="absolute inset-0 bg-primary-container rounded-full blur-[80px] opacity-20 scale-125"></div>
          <div className="relative w-72 h-72 flex items-center justify-center">
            <motion.div
              animate={isPlaying ? { rotate: 360 } : {}}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            >
              <Star size={280} className="text-primary-container star-glow" fill="currentColor" />
            </motion.div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 mt-8">
              <div className="flex gap-10">
                <div className="w-5 h-5 bg-on-primary-container rounded-full"></div>
                <div className="w-5 h-5 bg-on-primary-container rounded-full"></div>
              </div>
              <div className="w-12 h-6 border-b-8 border-on-primary-container rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="mt-16 text-center max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.h1 
              key={currentLyricIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="font-headline text-6xl font-black text-white leading-tight"
            >
              {song.content.lyrics[currentLyricIndex]}
            </motion.h1>
          </AnimatePresence>
          <p className="font-body text-2xl text-secondary-fixed/60 mt-4 tracking-wide font-semibold">
            {song.chineseTitle}
          </p>
        </div>
      </main>

      <footer className="relative z-50 px-20 pb-16 pt-8">
        <div className="relative h-6 w-full bg-white/10 rounded-full mb-12 overflow-hidden">
          <motion.div 
            animate={{ width: isPlaying ? '100%' : '33%' }}
            transition={{ duration: isPlaying ? 12 : 0.5, ease: "linear" }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-fixed via-white to-secondary-container rounded-full flex items-center justify-end px-1"
          >
            <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_15px_#fff]"></div>
          </motion.div>
        </div>
        <div className="flex items-center justify-center">
          <button 
            onClick={handleTogglePlay}
            className="w-32 h-32 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shadow-[0_12px_0_#604700] transition-all active:translate-y-2 active:shadow-none"
          >
            {isPlaying ? <Pause size={72} fill="currentColor" /> : <PlayIcon size={72} fill="currentColor" className="ml-2" />}
          </button>
        </div>
      </footer>

      <div className="fixed bottom-12 left-12 z-50">
        <ActivityNavButton type="READ" onClick={() => handleNavigate('READ')} />
      </div>
      <div className="fixed bottom-12 right-12 z-50">
        <ActivityNavButton type="PLAY" onClick={() => handleNavigate('PLAY')} />
      </div>
    </motion.div>
  );
}

const LYRIC_ELEMENTS: Record<string, string[]> = {
  "twinkle": ["✨", "🌟"],
  "star": ["⭐", "🌟"],
  "world": ["🌍", "🌎"],
  "high": ["☁️", "✈️"],
  "diamond": ["💎", "💍"],
  "sky": ["🌌", "🌙"],
  "ode": ["🎵", "🎼"],
  "joy": ["😊", "🎉"],
  "brothers": ["🤝", "👨‍👩‍👧‍👦"],
  "daughter": ["👧", "💖"],
  "elysium": ["🏛️", "✨"],
  "minuet": ["💃", "🕺"],
  "dance": ["💃", "🕺"],
  "music": ["🎵", "🎶"],
  "night": ["🌙", "⭐"],
};

function KaraokeScreen({ song, onBack }: { song: SongNode, onBack: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [scoreLeft, setScoreLeft] = useState(0);
  const [scoreRight, setScoreRight] = useState(0);
  const [lyricProgress, setLyricProgress] = useState(0);
  const [melodyBars, setMelodyBars] = useState<number[]>(Array(20).fill(20));
  const [isPkActive, setIsPkActive] = useState(false);
  const [popOutElements, setPopOutElements] = useState<{id: string, emoji: string, x: number, y: number}[]>([]);

  useEffect(() => {
    if (isPlaying) {
      const currentLyric = song.content.lyrics[currentLyricIndex].toLowerCase();
      const elements: {id: string, emoji: string, x: number, y: number}[] = [];
      
      Object.entries(LYRIC_ELEMENTS).forEach(([keyword, emojis]) => {
        if (currentLyric.includes(keyword)) {
          emojis.forEach((emoji, i) => {
            elements.push({
              id: `${Date.now()}-${keyword}-${i}-${Math.random()}`,
              emoji,
              x: (Math.random() - 0.5) * 400,
              y: (Math.random() - 0.5) * 200 - 150
            });
          });
        }
      });
      
      if (elements.length > 0) {
        setPopOutElements(elements);
        const timer = setTimeout(() => setPopOutElements([]), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentLyricIndex, isPlaying, song.content.lyrics]);

  useEffect(() => {
    let interval: any;
    let progressInterval: any;
    let melodyInterval: any;

    if (isPlaying) {
      // Lyrics change every 5 seconds for Karaoke (child-friendly pace)
      interval = setInterval(() => {
        setCurrentLyricIndex((prev) => (prev + 1) % song.content.lyrics.length);
        setLyricProgress(0);
        // Simulate scoring only if PK is active
        if (isPkActive) {
          setScoreLeft(s => s + Math.floor(Math.random() * 100));
          setScoreRight(s => s + Math.floor(Math.random() * 100));
        }
      }, 5000);

      // Smooth progress for lyrics filling (50ms * 100 = 5000ms)
      progressInterval = setInterval(() => {
        setLyricProgress(p => Math.min(100, p + 1));
      }, 50);

      // Melody visualization
      melodyInterval = setInterval(() => {
        setMelodyBars(bars => bars.map(() => Math.floor(Math.random() * 60) + 20));
      }, 150);
    }

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
      clearInterval(melodyInterval);
    };
  }, [isPlaying, song.content.lyrics.length]);

  const handleTogglePlay = () => {
    sfxService.playClick();
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full relative z-10 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a041a 0%, #1a0b2e 100%)' }}
    >
      {/* Header */}
      <nav className="relative z-50 flex justify-between items-center px-6 md:px-10 py-4 md:py-6">
        <button 
          onClick={onBack}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 group-active:scale-95 transition-all shadow-lg">
            <ChevronLeft size={24} className="md:size-[28px] text-white" />
          </div>
          <span className="text-white/60 font-headline font-bold text-[8px] md:text-[10px] tracking-widest uppercase group-hover:text-white transition-colors">返回</span>
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <h2 className="font-headline text-2xl md:text-4xl font-black text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">K歌模式</h2>
        </div>
        <div className="flex gap-2 md:gap-4">
          {isPkActive ? (
            <div className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-error text-white rounded-xl md:rounded-2xl font-headline font-black text-sm md:text-lg shadow-[0_4px_0_#991b1b] md:shadow-[0_6px_0_#991b1b]">
              <Users size={18} className="md:size-[24px]" />
              <span>PK中</span>
            </div>
          ) : (
            <button 
              onClick={() => {
                sfxService.playClick();
                setIsPkActive(true);
                setIsPlaying(true);
                setCurrentLyricIndex(0);
                setLyricProgress(0);
                setScoreLeft(0);
                setScoreRight(0);
              }}
              className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl md:rounded-2xl font-headline font-black text-sm md:text-lg shadow-[0_4px_0_#9a3412] md:shadow-[0_6px_0_#9a3412] active:translate-y-1 active:shadow-none transition-all hover:scale-105"
            >
              <Users size={18} className="md:size-[24px]" />
              <span>开始PK</span>
            </button>
          )}
        </div>
      </nav>

      {/* Main Stage */}
      <main className="flex-grow flex flex-col items-center justify-center relative z-10 px-6 md:px-20 gap-2 md:gap-4">
        {/* PK Scores - Top of main */}
        <div className="w-full flex justify-between items-start max-w-6xl absolute top-2 md:top-4 left-1/2 -translate-x-1/2 px-6 md:px-20">
          {isPkActive ? (
            <>
              <motion.div 
                animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
                className="flex flex-col items-center gap-1 md:gap-3"
              >
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-error border-2 md:border-4 border-white shadow-2xl overflow-hidden">
                  <img src="https://picsum.photos/seed/p1/100/100" className="w-full h-full object-cover" />
                </div>
                <div className="bg-error text-white px-3 md:px-6 py-1 rounded-full font-headline font-black text-sm md:text-2xl shadow-lg border border-white/20">
                  {scoreLeft}
                </div>
                <span className="text-white font-black text-[8px] md:text-[10px] tracking-widest uppercase opacity-70">P1</span>
              </motion.div>

              {/* Melody Visualization */}
              <div className="flex-1 flex items-end justify-center gap-0.5 md:gap-1 h-16 md:h-24 px-4 md:px-10">
                {melodyBars.map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: isPlaying ? h * 0.6 : 10 }}
                    className="w-1 md:w-1.5 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full opacity-60"
                  />
                ))}
              </div>

              <motion.div 
                animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1, delay: 0.5 }}
                className="flex flex-col items-center gap-1 md:gap-3"
              >
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-secondary border-2 md:border-4 border-white shadow-2xl overflow-hidden">
                  <img src="https://picsum.photos/seed/p2/100/100" className="w-full h-full object-cover" />
                </div>
                <div className="bg-secondary text-white px-3 md:px-6 py-1 rounded-full font-headline font-black text-sm md:text-2xl shadow-lg border border-white/20">
                  {scoreRight}
                </div>
                <span className="text-white font-black text-[8px] md:text-[10px] tracking-widest uppercase opacity-70">P2</span>
              </motion.div>
            </>
          ) : (
            <div className="flex-1 flex items-end justify-center gap-0.5 md:gap-1 h-16 md:h-24 px-6 md:px-20">
              {melodyBars.map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: isPlaying ? h * 0.6 : 10 }}
                  className="w-1 md:w-1.5 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full opacity-60"
                />
              ))}
            </div>
          )}
        </div>

        {/* Conductor Beethoven - Center */}
        <div className="relative flex flex-col items-center mt-4">
          <motion.div
            animate={isPlaying ? { 
              y: [0, -5, 0],
              scale: [1, 1.02, 1]
            } : {}}
            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
            className="w-28 h-28 relative"
          >
            {/* Fluffy Hair */}
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-white rounded-full shadow-lg z-10" />
            <div className="absolute -top-3 left-5 w-12 h-12 bg-white rounded-full shadow-lg z-10" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg z-10" />
            <div className="absolute top-5 -left-3 w-8 h-8 bg-white rounded-full shadow-lg z-10" />
            <div className="absolute top-5 -right-3 w-8 h-8 bg-white rounded-full shadow-lg z-10" />
            
            {/* Face */}
            <div className="w-full h-full bg-[#ffe4e1] rounded-full border-2 border-[#d4a5a5] shadow-2xl relative z-20 overflow-hidden flex flex-col items-center">
              {/* Hair Top */}
              <div className="w-full h-1/3 bg-white rounded-t-full" />
              
              {/* Eyes */}
              <div className="flex gap-3 mt-2">
                <motion.div 
                  animate={isPlaying ? { scaleY: [1, 0.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 3, times: [0, 0.1, 1] }}
                  className="w-2 h-3.5 bg-[#2d1b1b] rounded-full relative"
                >
                  <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-white rounded-full opacity-80" />
                </motion.div>
                <motion.div 
                  animate={isPlaying ? { scaleY: [1, 0.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 3, times: [0, 0.1, 1] }}
                  className="w-2 h-3.5 bg-[#2d1b1b] rounded-full relative"
                >
                  <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-white rounded-full opacity-80" />
                </motion.div>
              </div>
              
              {/* Cheeks */}
              <div className="flex gap-8 -mt-1">
                <div className="w-2.5 h-1 bg-pink-300/40 rounded-full blur-sm" />
                <div className="w-2.5 h-1 bg-pink-300/40 rounded-full blur-sm" />
              </div>

              {/* Mouth */}
              <motion.div 
                animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
                className="w-4 h-2 border-b-2 border-[#2d1b1b] rounded-full mt-0.5"
              />

              {/* Tuxedo Collar */}
              <div className="absolute bottom-0 w-full h-5 bg-[#1a1a1a] flex justify-center">
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[14px] border-t-white" />
                <div className="absolute -top-0.5 w-2 h-2 bg-red-600 rotate-45 shadow-sm" />
              </div>
            </div>

            {/* Baton Hand */}
            <motion.div 
              animate={isPlaying ? { 
                rotate: [20, -40, 20, 50, 20],
                y: [0, -5, 0, 5, 0]
              } : {}}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="absolute -right-5 top-1/2 z-30 flex items-center"
            >
              <div className="w-4 h-4 bg-[#ffe4e1] rounded-full border border-[#d4a5a5] shadow-md" />
              <div className="w-10 h-1 bg-yellow-700 rounded-full origin-left -ml-1 shadow-lg" />
            </motion.div>
          </motion.div>
          
          <div className="mt-2 flex items-center gap-2 bg-white/5 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
            <div className="w-1 h-1 rounded-full bg-pink-500 animate-pulse"></div>
            <span className="text-pink-400 font-black text-[7px] tracking-[0.2em] uppercase">Beethoven</span>
          </div>
        </div>

        {/* Lyrics Area - Bottom of main */}
        <div className="text-center max-w-4xl w-full px-4 h-[180px] md:h-[220px] relative overflow-hidden flex flex-col items-center mt-2">
          {/* Gradient Masks */}
          <div className="absolute top-0 left-0 w-full h-12 md:h-16 bg-gradient-to-b from-[#0a041a] to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-12 md:h-16 bg-gradient-to-t from-[#1a0b2e] to-transparent z-10 pointer-events-none" />

          {/* Pop-out Educational Elements */}
          <AnimatePresence>
            {popOutElements.map((el) => (
              <motion.div
                key={el.id}
                initial={{ scale: 0, opacity: 0, y: 0 }}
                animate={{ scale: 1.3, opacity: 1, y: el.y, x: el.x }}
                exit={{ scale: 0, opacity: 0, y: el.y - 100 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="absolute z-50 text-4xl md:text-6xl pointer-events-none drop-shadow-[0_0_25px_rgba(255,255,255,0.6)]"
              >
                {el.emoji}
              </motion.div>
            ))}
          </AnimatePresence>

          {isPkActive ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.div 
                animate={{ y: -currentLyricIndex * 100 }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
                className="flex flex-col items-center absolute"
              >
                {song.content.lyrics.map((lyric, index) => {
                  const isActive = index === currentLyricIndex;
                  const isNear = Math.abs(index - currentLyricIndex) <= 2;
                  
                  if (!isNear && !isActive) return <div key={index} className="h-[100px]" />;

                  return (
                    <div key={index} className="h-[100px] flex items-center justify-center relative w-full px-4">
                      {isActive ? (
                        <motion.div 
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="relative inline-block transition-all max-w-full"
                        >
                          {/* Background Lyrics (Gray) */}
                          <h1 className="font-headline text-3xl md:text-5xl lg:text-6xl font-black text-white/10 leading-tight">
                            {lyric}
                          </h1>
                          {/* Foreground Lyrics (Filled) */}
                          <div 
                            className="absolute top-0 left-0 overflow-hidden transition-all duration-100 ease-linear"
                            style={{ width: `${lyricProgress}%` }}
                          >
                            <h1 className="font-headline text-3xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-400 to-pink-500 leading-tight drop-shadow-[0_0_25px_rgba(236,72,153,0.7)] whitespace-nowrap">
                              {lyric}
                            </h1>
                            {/* Rhythm Indicator (Bouncing Ball) */}
                            <motion.div 
                              animate={{ y: [0, -15, 0] }}
                              transition={{ repeat: Infinity, duration: 0.5 }}
                              className="absolute right-0 top-0 w-4 h-4 md:w-6 md:h-6 bg-yellow-400 rounded-full shadow-[0_0_20px_#fbbf24] -mr-2 md:-mr-3 mt-1 md:mt-1.5 z-50 border-2 border-white/30"
                            />
                          </div>
                        </motion.div>
                      ) : (
                        <h1 className="font-headline text-2xl md:text-4xl font-black text-white/10 leading-tight opacity-20 scale-90 transition-all">
                          {lyric}
                        </h1>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            </div>
          ) : (
            <div className="relative inline-block mt-4 md:mt-8 max-w-full px-4">
              {/* Background Lyrics (Gray) */}
              <h1 className="font-headline text-3xl md:text-5xl lg:text-6xl font-black text-white/10 leading-tight">
                {song.content.lyrics[currentLyricIndex]}
              </h1>
              {/* Foreground Lyrics (Filled) */}
              <div 
                className="absolute top-0 left-0 overflow-hidden transition-all duration-100 ease-linear"
                style={{ width: `${lyricProgress}%` }}
              >
                <h1 className="font-headline text-3xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-400 to-pink-500 leading-tight drop-shadow-[0_0_25px_rgba(236,72,153,0.7)] whitespace-nowrap">
                  {song.content.lyrics[currentLyricIndex]}
                </h1>
                {/* Rhythm Indicator (Bouncing Ball) */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="absolute right-0 top-0 w-4 h-4 md:w-6 md:h-6 bg-yellow-400 rounded-full shadow-[0_0_20px_#fbbf24] -mr-2 md:-mr-3 mt-1 md:mt-1.5 z-50 border-2 border-white/30"
                />
              </div>
            </div>
          )}
        </div>
        
        <p className="font-body text-lg md:text-2xl text-purple-200/40 tracking-widest font-bold uppercase -mt-4 md:-mt-8">
          {song.chineseTitle}
        </p>
      </main>

      {/* Controls */}
      <footer className="relative z-50 px-6 md:px-20 pb-6 md:pb-8 pt-2 md:pt-4 flex flex-col items-center gap-2 md:gap-4">
        <div className="w-full max-w-4xl h-2 md:h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            animate={{ width: isPlaying ? '100%' : '0%' }}
            transition={{ duration: isPlaying ? 12 : 0, ease: "linear" }}
            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
          />
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <button 
            onClick={() => {
              sfxService.playClick();
              setCurrentLyricIndex(prev => (prev - 1 + song.content.lyrics.length) % song.content.lyrics.length);
              setLyricProgress(0);
            }}
            className="w-12 h-12 md:w-16 md:h-16 bg-white/10 text-white rounded-full flex items-center justify-center border-2 border-white/20 active:scale-90 transition-all"
          >
            <ChevronLeft size={24} className="md:size-[32px]" />
          </button>
          <button 
            onClick={handleTogglePlay}
            className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-[0_4px_0_#9d174d] md:shadow-[0_8px_0_#9d174d] transition-all active:translate-y-2 active:shadow-none"
          >
            {isPlaying ? <Pause size={32} className="md:size-[56px]" fill="currentColor" /> : <PlayIcon size={32} className="md:size-[56px] ml-1 md:ml-2" fill="currentColor" />}
          </button>
          <button 
            onClick={() => {
              sfxService.playClick();
              setCurrentLyricIndex(prev => (prev + 1) % song.content.lyrics.length);
              setLyricProgress(0);
            }}
            className="w-12 h-12 md:w-16 md:h-16 bg-white/10 text-white rounded-full flex items-center justify-center border-2 border-white/20 active:scale-90 transition-all"
          >
            <ChevronLeft size={24} className="md:size-[32px] rotate-180" />
          </button>
        </div>
      </footer>
    </motion.div>
  );
}

function ReadScreen({ song, onBack, onNavigate }: { song: SongNode, onBack: () => void, onNavigate: (s: Screen) => void }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isEnglish, setIsEnglish] = useState(true);
  const pages = song.content.storyPages;
  const page = pages[currentPage];

  const handleBack = () => {
    sfxService.playClick();
    onBack();
  };

  const handleNavigate = (s: Screen) => {
    sfxService.playClick();
    onNavigate(s);
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      sfxService.playClick();
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      sfxService.playClick();
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleLanguage = () => {
    sfxService.playClick();
    setIsEnglish(!isEnglish);
  };

  // Helper to highlight the keyword in text
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!isEnglish) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} className="text-primary-container font-black underline decoration-4 underline-offset-8 decoration-primary-container/30">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full relative flex items-center justify-center p-8 overflow-hidden"
      style={{ background: 'radial-gradient(circle at 70% 20%, #1e2a4a 0%, #050b18 70%)' }}
    >
      {/* Header */}
      <div className="absolute top-8 left-8 z-50 flex items-center gap-6">
        <HomeButton onClick={handleBack} />
        <button 
          onClick={toggleLanguage}
          className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full flex items-center justify-center active:scale-95 transition-all border border-white/20 font-black text-xl shadow-lg"
        >
          {isEnglish ? '中文' : 'English'}
        </button>
      </div>
      
      <div className="absolute top-8 left-0 right-0 flex justify-center items-center z-50">
        <h2 className="font-headline text-5xl font-black text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          {isEnglish ? 'Read Along' : '读一读'}
        </h2>
      </div>

      <div className="absolute top-8 right-8 z-50">
        <div className="bg-white/10 backdrop-blur-md text-white px-6 py-4 rounded-full border border-white/20 font-black text-2xl">
          {currentPage + 1} / {pages.length}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        {/* Illustration Side */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentPage}
            initial={{ x: -100, opacity: 0, rotate: -5 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={{ x: 100, opacity: 0, rotate: 5 }}
            transition={{ type: "spring", damping: 20 }}
            className="flex justify-center"
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-[4rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="w-[500px] h-[500px] bg-white p-6 rounded-[4rem] shadow-2xl relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
                <img 
                  alt="Story illustration" 
                  className="w-full h-full object-cover rounded-[3rem]" 
                  src={`https://picsum.photos/seed/${page.imageSeed}/800/800`}
                  referrerPolicy="no-referrer"
                />
                {/* Opera Overlay (Nursery Rhyme Snippet) */}
                {page.nurseryRhyme && (
                  <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute bottom-10 left-10 right-10 bg-black/60 backdrop-blur-md p-6 rounded-3xl border border-white/20"
                  >
                    <div className="flex items-center gap-4 text-primary-container mb-2">
                      <Mic size={24} />
                      <span className="text-sm font-black tracking-widest uppercase">Sing Along</span>
                    </div>
                    <p className="text-2xl font-black text-white italic leading-tight">
                      ♪ {page.nurseryRhyme} ♪
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Text Side */}
        <div className="flex flex-col gap-12">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentPage + (isEnglish ? 'en' : 'zh')}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[4rem] p-16 shadow-2xl"
            >
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                  <div className="h-2 w-12 bg-primary-container rounded-full" />
                  <span className="text-primary-container font-black tracking-widest uppercase text-xl">
                    {isEnglish ? 'The Story' : '故事内容'}
                  </span>
                </div>
                
                <h1 className="text-5xl font-black text-white leading-tight font-body">
                  {renderHighlightedText(isEnglish ? page.text : page.chineseText, page.highlight)}
                </h1>

                <div className="flex items-center gap-6 mt-4">
                  <div className="px-8 py-4 bg-primary-container/20 rounded-2xl border border-primary-container/30">
                    <span className="text-primary-container font-black text-3xl">
                      {page.highlight}
                    </span>
                  </div>
                  <p className="text-white/60 font-bold text-xl">
                    {isEnglish ? 'Key Word' : '重点单词'}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center gap-8 px-8">
            <button 
              onClick={prevPage}
              disabled={currentPage === 0}
              className={`h-24 w-24 rounded-full flex items-center justify-center transition-all border-4 ${
                currentPage === 0 
                ? 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed' 
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20 active:scale-90 shadow-xl'
              }`}
            >
              <ChevronLeft size={48} />
            </button>
            
            <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary-container shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
              />
            </div>

            <button 
              onClick={nextPage}
              disabled={currentPage === pages.length - 1}
              className={`h-24 w-24 rounded-full flex items-center justify-center transition-all border-4 ${
                currentPage === pages.length - 1 
                ? 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed' 
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20 active:scale-90 shadow-xl'
              }`}
            >
              <ChevronLeft size={48} className="rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Nav */}
      <div className="fixed bottom-12 left-12 z-50">
        <ActivityNavButton type="LISTEN" onClick={() => handleNavigate('LISTEN')} />
      </div>
      <div className="fixed bottom-12 right-12 z-50">
        <ActivityNavButton type="PLAY" onClick={() => handleNavigate('PLAY')} />
      </div>
    </motion.div>
  );
}

function PlayScreen({ song, onBack, onNavigate }: { song: SongNode, onBack: () => void, onNavigate: (s: Screen) => void }) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleBack = () => {
    sfxService.playClick();
    onBack();
  };

  const handleNavigate = (s: Screen) => {
    sfxService.playClick();
    onNavigate(s);
  };

  const handleOptionClick = (correct: boolean) => {
    sfxService.playClick();
    if (correct) {
      setScore(s => s + 100);
      setCombo(c => c + 1);
      setFeedback("Great!");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      // Increase global progress
      window.dispatchEvent(new CustomEvent('updateProgress', { detail: 10 }));
      
      // Show success screen after a short delay
      setTimeout(() => {
        setShowSuccess(true);
      }, 1500);
    } else {
      setCombo(0);
      setFeedback("Oops!");
    }
    setTimeout(() => setFeedback(null), 2000);
  };

  if (showSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full w-full bg-primary flex flex-col items-center justify-center text-white p-12 text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mb-8"
        >
          <Trophy size={160} fill="currentColor" />
        </motion.div>
        <h2 className="text-6xl font-black mb-4 font-headline tracking-tight">AWESOME!</h2>
        <p className="text-2xl opacity-90 mb-12 font-medium">You've mastered the sound of "{song.content.game.phonics}"!</p>
        
        <div className="flex flex-col gap-4 w-full max-w-md">
          <button 
            onClick={() => handleNavigate('MAP')}
            className="w-full py-6 bg-white text-primary rounded-3xl font-black text-2xl shadow-[0_12px_0_#d1d1d1] active:translate-y-2 active:shadow-none transition-all border-2 border-primary/10"
          >
            HomePage
          </button>
          <button 
            onClick={() => {
              sfxService.playClick();
              setShowSuccess(false);
            }}
            className="w-full py-6 bg-primary-fixed text-primary rounded-3xl font-black text-2xl shadow-[0_12px_0_#604700] active:translate-y-2 active:shadow-none transition-all"
          >
            PLAY AGAIN
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full relative flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(circle at top, #001e2b 0%, #00394e 100%)' }}
    >
      <div className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-8">
        <HomeButton onClick={handleBack} />
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <h1 className="font-headline text-5xl font-black text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">玩一玩</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => sfxService.playClick()}
            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border-4 border-white/30 active:scale-90 transition-all"
          >
            <Volume2 size={24} />
          </button>
          <button 
            onClick={() => sfxService.playClick()}
            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border-4 border-white/30 active:scale-90 transition-all"
          >
            <Settings size={24} />
          </button>
        </div>
      </div>

      <main className="relative h-full w-full flex flex-col items-center justify-between py-12 px-12 max-w-[1440px] mx-auto z-10 pt-32">
        <div className="w-full max-w-4xl flex justify-between items-center gap-8">
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-3 bg-white/10 p-2 rounded-full border-2 border-white/20 backdrop-blur-sm">
              <div className="w-14 h-14 rounded-full bg-primary-container border-4 border-white overflow-hidden">
                <img src="https://picsum.photos/seed/p1/100/100" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 pr-3">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-white font-headline font-bold text-lg">Leo</span>
                  <span className="text-primary-fixed font-headline font-black text-xl">{score.toLocaleString()}</span>
                </div>
                <div className="h-4 w-full bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${Math.min(100, (score / 2000) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-tertiary-fixed to-tertiary rounded-full"
                  ></motion.div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-center">
              <AnimatePresence>
                {combo > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="px-4 py-1 bg-primary-container text-on-primary-container font-headline font-bold rounded-full text-xs shadow-lg"
                  >
                    COMBO x{combo}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-error-container to-error rotate-45 flex items-center justify-center border-4 border-white shadow-xl">
              <span className="font-headline font-black text-white text-3xl -rotate-45">VS</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2 items-end">
            <div className="flex flex-row-reverse items-center gap-3 bg-white/10 p-2 rounded-full border-2 border-white/20 backdrop-blur-sm w-full">
              <div className="w-14 h-14 rounded-full bg-secondary-container border-4 border-white overflow-hidden">
                <img src="https://picsum.photos/seed/p2/100/100" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 pl-3">
                <div className="flex flex-row-reverse justify-between items-end mb-1">
                  <span className="text-white font-headline font-bold text-lg">Sparky</span>
                  <span className="text-secondary-fixed font-headline font-black text-xl">980</span>
                </div>
                <div className="h-4 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-gradient-to-l from-secondary-fixed to-secondary rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex-shrink-0 flex items-center justify-center my-6">
          <div className="w-72 h-72 bg-white/10 backdrop-blur-xl border-[6px] border-white/30 rounded-[4rem] flex flex-col items-center justify-center shadow-2xl">
            <div className="absolute -top-10 -right-8 w-24 h-24 bg-primary-container rounded-full flex items-center justify-center border-4 border-white rotate-12 shadow-2xl">
              <Star size={48} className="text-on-primary-container" fill="currentColor" />
            </div>
            <span className="text-white font-headline font-black text-[9rem] tracking-tighter drop-shadow-lg">{song.content.game.phonics}</span>
            <span className="text-secondary-fixed font-headline font-bold text-2xl mt-4 bg-secondary/40 px-6 py-2 rounded-full border-2 border-secondary-fixed/50 backdrop-blur-sm">Phonics Sound</span>
          </div>
        </div>

        <div className="w-full max-w-5xl flex justify-center items-end gap-10 pb-8 relative mt-4">
          <AnimatePresence>
            {feedback && (
              <motion.div 
                initial={{ y: 20, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -20, opacity: 0, scale: 0.5 }}
                className="absolute left-0 bottom-36 z-20 transform -rotate-6 mb-16"
              >
                <div className={`bg-white/95 backdrop-blur-sm px-6 py-4 rounded-[2rem] border-4 ${feedback === 'Great!' ? 'border-tertiary-fixed' : 'border-error'} shadow-2xl flex items-center gap-4 animate-bounce`}>
                  {feedback === 'Great!' ? <CheckCircle2 size={40} className="text-tertiary" /> : <Lock size={40} className="text-error" />}
                  <div>
                    <p className={`${feedback === 'Great!' ? 'text-tertiary-dim' : 'text-error'} font-headline font-black text-2xl uppercase leading-none`}>{feedback}</p>
                    <p className={`${feedback === 'Great!' ? 'text-tertiary' : 'text-error-container'} font-bold text-sm mt-0.5`}>{feedback === 'Great!' ? 'Perfect streak' : 'Try again!'}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {song.content.game.options.map((option, i) => (
            <React.Fragment key={i}>
              <GameOption 
                label={option.label} 
                imgSeed={option.imgSeed} 
                onClick={() => handleOptionClick(option.correct)}
              />
            </React.Fragment>
          ))}

          <div className="absolute right-0 bottom-36 z-20 flex flex-col items-center transform rotate-6 mb-16">
            <div className="w-20 h-20 bg-error-container rounded-full flex items-center justify-center border-4 border-white shadow-2xl animate-pulse">
              <Zap size={40} className="text-white" fill="currentColor" />
            </div>
            <p className="text-white font-headline font-black text-lg mt-3 drop-shadow-xl uppercase">Powering Up!</p>
          </div>
        </div>
      </main>

      <div className="fixed bottom-12 left-12 z-50">
        <ActivityNavButton type="LISTEN" onClick={() => handleNavigate('LISTEN')} />
      </div>
      <div className="fixed bottom-12 right-12 z-50">
        <ActivityNavButton type="READ" onClick={() => handleNavigate('READ')} />
      </div>
    </motion.div>
  );
}

function GameOption({ label, imgSeed, active, onClick }: { label: string, imgSeed: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`relative group ${active ? 'w-64 h-80' : 'w-60 h-72'} flex-shrink-0`}
    >
      <div className={`absolute inset-0 rounded-2xl translate-y-4 ${active ? 'bg-secondary-dim' : 'bg-primary-dim'}`}></div>
      <div className={`relative h-full w-full rounded-2xl p-6 flex flex-col items-center justify-between border-[5px] border-white transition-all group-hover:-translate-y-2 group-active:translate-y-2 ${active ? 'bg-secondary-container shadow-2xl' : 'bg-white'}`}>
        <div className="w-32 h-32 flex items-center justify-center">
          <img 
            src={`https://picsum.photos/seed/${imgSeed}/200/200`} 
            className="w-full h-full object-contain" 
            referrerPolicy="no-referrer" 
          />
        </div>
        <div className="w-full text-center">
          <span className={`block font-headline font-black uppercase tracking-wider ${active ? 'text-on-secondary-container text-4xl' : 'text-primary text-3xl'}`}>
            {label}
          </span>
          <div className={`mt-2.5 h-2 mx-auto rounded-full ${active ? 'w-16 bg-on-secondary-container/20' : 'w-14 bg-primary/20'}`}></div>
        </div>
      </div>
    </button>
  );
}
