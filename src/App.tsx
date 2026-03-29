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
import { geminiImageService } from './services/geminiImageService';

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
          setSongs(prev => prev.map(s =>
            (s.id === 'bus' || s.id === 'boat') ? { ...s, locked: false } : s
          ));
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
            onNavigate={navigateTo}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/** Parse an LRC file into timed lyric lines, ignoring metadata tags */
function parseLRC(text: string): { time: number; lyric: string }[] {
  const result: { time: number; lyric: string }[] = [];
  for (const line of text.split('\n')) {
    const m = /\[(\d{2}):(\d{2}\.\d{2,3})\](.+)/.exec(line);
    if (!m) continue;
    const time = parseInt(m[1]) * 60 + parseFloat(m[2]);
    const lyric = m[3].trim();
    if (lyric) result.push({ time, lyric });
  }
  return result;
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
      {/* Q版睡美人 */}
      <div className="absolute top-28 right-12 w-48 h-48 rounded-full shadow-[0_0_60px_rgba(248,100,180,0.55)] overflow-hidden">
        <svg viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg" width="192" height="192">
          <defs>
            <radialGradient id="auroraBg192" cx="50%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#fce8f8"/>
              <stop offset="100%" stopColor="#c84898"/>
            </radialGradient>
          </defs>

          {/* 粉色背景 */}
          <circle cx="96" cy="96" r="96" fill="url(#auroraBg192)"/>
          {/* 光晕 */}
          <circle cx="96" cy="48" r="62" fill="white" opacity="0.06"/>
          {/* 装饰亮点 */}
          <circle cx="168" cy="68" r="3" fill="#ffd8f0" opacity="0.6"/>
          <circle cx="22" cy="80" r="2" fill="#ffd8f0" opacity="0.5"/>
          <circle cx="160" cy="40" r="2.5" fill="#ffe0f8" opacity="0.5"/>
          <circle cx="30" cy="50" r="1.8" fill="#ffd0f0" opacity="0.5"/>

          {/* ===== 后发（金色飘逸） ===== */}
          <path d="M 32 85 Q 18 110 22 142 Q 28 164 34 180 Q 44 156 42 128 Q 44 106 50 90Z" fill="#f2c030"/>
          <path d="M 160 85 Q 174 110 170 142 Q 164 164 158 180 Q 148 156 150 128 Q 148 106 142 90Z" fill="#f2c030"/>
          <ellipse cx="96" cy="65" rx="68" ry="60" fill="#f0c028"/>

          {/* 脸 */}
          <circle cx="96" cy="82" r="54" fill="#fde8c8"/>

          {/* 顶发+刘海 */}
          <path d="M 30 86 Q 42 22 96 18 Q 150 22 162 86 Q 142 44 96 50 Q 50 44 30 86" fill="#e0b020"/>
          <path d="M 84 18 Q 96 14 108 18 Q 96 32 84 18" fill="#f8e070"/>
          <path d="M 44 68 Q 56 46 72 58 Q 60 54 54 68Z" fill="#e0b020"/>
          <path d="M 148 68 Q 136 46 120 58 Q 132 54 138 68Z" fill="#e0b020"/>

          {/* ===== 大眼睛（紫色） ===== */}
          <ellipse cx="76" cy="78" rx="15" ry="16" fill="white"/>
          <ellipse cx="76" cy="79" rx="10.5" ry="11.5" fill="#8050c8"/>
          <ellipse cx="76" cy="80" rx="7" ry="7.5" fill="#5030a0"/>
          <circle cx="76" cy="81" r="4.5" fill="#10082a"/>
          <circle cx="80" cy="75" r="3.5" fill="white"/>
          <circle cx="73" cy="78" r="1.8" fill="white" opacity="0.7"/>

          <ellipse cx="116" cy="78" rx="15" ry="16" fill="white"/>
          <ellipse cx="116" cy="79" rx="10.5" ry="11.5" fill="#8050c8"/>
          <ellipse cx="116" cy="80" rx="7" ry="7.5" fill="#5030a0"/>
          <circle cx="116" cy="81" r="4.5" fill="#10082a"/>
          <circle cx="120" cy="75" r="3.5" fill="white"/>
          <circle cx="113" cy="78" r="1.8" fill="white" opacity="0.7"/>

          {/* 眼线+睫毛左 */}
          <path d="M 61 72 Q 76 61 91 72" stroke="#18082a" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <line x1="63" y1="73" x2="59" y2="62" stroke="#18082a" strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="68" y1="68" x2="65" y2="57" stroke="#18082a" strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="76" y1="65" x2="76" y2="55" stroke="#18082a" strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="84" y1="68" x2="87" y2="58" stroke="#18082a" strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="89" y1="72" x2="93" y2="63" stroke="#18082a" strokeWidth="2.2" strokeLinecap="round"/>

          {/* 眼线+睫毛右 */}
          <path d="M 101 72 Q 116 61 131 72" stroke="#18082a" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <line x1="103" y1="72" x2="99" y2="63" stroke="#18082a" strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="108" y1="68" x2="105" y2="58" stroke="#18082a" strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="116" y1="65" x2="116" y2="55" stroke="#18082a" strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="124" y1="68" x2="127" y2="58" stroke="#18082a" strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="129" y1="72" x2="133" y2="62" stroke="#18082a" strokeWidth="2.2" strokeLinecap="round"/>

          {/* 眉毛 */}
          <path d="M 60 63 Q 76 53 92 60" stroke="#b88820" strokeWidth="3.2" fill="none" strokeLinecap="round"/>
          <path d="M 100 60 Q 116 53 132 63" stroke="#b88820" strokeWidth="3.2" fill="none" strokeLinecap="round"/>

          {/* 鼻子 */}
          <circle cx="96" cy="94" r="2.5" fill="#e0a898" opacity="0.6"/>

          {/* 腮红 */}
          <ellipse cx="60" cy="97" rx="16" ry="9" fill="#ffb8cc" opacity="0.45"/>
          <ellipse cx="132" cy="97" rx="16" ry="9" fill="#ffb8cc" opacity="0.45"/>

          {/* 嘴巴 */}
          <path d="M 80 109 Q 96 121 112 109" stroke="#e06878" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M 80 109 Q 88 116 96 114 Q 104 116 112 109" fill="#f09898"/>

          {/* ===== 皇冠 ===== */}
          <path d="M 62 48 L 70 30 L 80 45 L 96 24 L 112 45 L 122 30 L 130 48" stroke="#f8d840" strokeWidth="3" fill="#f8d840" fillOpacity="0.15" strokeLinejoin="round"/>
          <line x1="60" y1="50" x2="132" y2="50" stroke="#f8d840" strokeWidth="2.5"/>
          <circle cx="70" cy="30" r="3.5" fill="#ffe880"/>
          <circle cx="96" cy="24" r="4.5" fill="#ffe880"/>
          <circle cx="122" cy="30" r="3.5" fill="#ffe880"/>
          <circle cx="96" cy="24" r="5" fill="#ff88b8" opacity="0.95"/>
          <circle cx="70" cy="30" r="4" fill="#d870f8" opacity="0.85"/>
          <circle cx="122" cy="30" r="4" fill="#d870f8" opacity="0.85"/>
          <circle cx="97.5" cy="22" r="1.8" fill="white" opacity="0.7"/>

          {/* ===== 粉色礼服 ===== */}
          <path d="M 0 160 Q 30 132 96 135 Q 162 132 192 160 L 192 192 L 0 192Z" fill="#f860a8"/>
          <path d="M 0 170 Q 36 150 96 152 Q 156 150 192 170 L 192 192 L 0 192Z" fill="#e04898"/>
          <path d="M 24 158 Q 60 144 96 143 Q 132 144 168 158" stroke="#ff9ccc" strokeWidth="1.5" fill="none" opacity="0.65"/>
          <path d="M 14 167 Q 54 155 96 154 Q 138 155 178 167" stroke="#ff9ccc" strokeWidth="1" fill="none" opacity="0.45"/>
          {/* 玫瑰装饰 */}
          <g transform="translate(48,158)">
            <circle cx="0" cy="0" r="9" fill="#ff5888"/>
            <circle cx="0" cy="0" r="6" fill="#ff80a8"/>
            <circle cx="0" cy="0" r="3" fill="#ffb0c8"/>
            <circle cx="0" cy="0" r="1.2" fill="#ffe0ec"/>
          </g>
          <g transform="translate(144,158)">
            <circle cx="0" cy="0" r="9" fill="#ff5888"/>
            <circle cx="0" cy="0" r="6" fill="#ff80a8"/>
            <circle cx="0" cy="0" r="3" fill="#ffb0c8"/>
            <circle cx="0" cy="0" r="1.2" fill="#ffe0ec"/>
          </g>

          {/* 侧发飘动 */}
          <path d="M 32 85 Q 22 108 24 140" stroke="#f2c030" strokeWidth="16" fill="none" strokeLinecap="round" opacity="0.9"/>
          <path d="M 160 85 Q 170 108 168 140" stroke="#f2c030" strokeWidth="16" fill="none" strokeLinecap="round" opacity="0.9"/>
          <path d="M 32 85 Q 22 108 24 140" stroke="#d8a018" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.35"/>
          <path d="M 160 85 Q 170 108 168 140" stroke="#d8a018" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.35"/>
        </svg>
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
  const [audioProgress, setAudioProgress] = useState(0);
  const [lrcLines, setLrcLines] = useState<{ time: number; lyric: string }[]>([]);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  // Ref so the audio timeupdate closure always sees the latest LRC data
  const lrcLinesRef = React.useRef<{ time: number; lyric: string }[]>([]);

  // Keep ref in sync with state
  useEffect(() => { lrcLinesRef.current = lrcLines; }, [lrcLines]);

  // Fetch and parse LRC file when available
  useEffect(() => {
    if (!song.lrcSrc) return;
    fetch(song.lrcSrc)
      .then(r => r.text())
      .then(text => setLrcLines(parseLRC(text)))
      .catch(() => {});
  }, [song.lrcSrc]);

  // Setup audio element
  useEffect(() => {
    if (!song.audioSrc) return;
    const audio = new Audio(song.audioSrc);
    audioRef.current = audio;

    const onTimeUpdate = () => {
      if (!audio.duration) return;
      const t = audio.currentTime;
      setAudioProgress((t / audio.duration) * 100);

      const lines = lrcLinesRef.current;
      if (lines.length > 0) {
        // LRC-based sync: find the last timestamp we've passed
        let idx = 0;
        for (let i = lines.length - 1; i >= 0; i--) {
          if (t >= lines[i].time) { idx = i; break; }
        }
        setCurrentLyricIndex(idx);
      } else if (song.content.lyricTimestamps) {
        // Fallback: hardcoded timestamps
        const ts = song.content.lyricTimestamps;
        let idx = 0;
        for (let i = ts.length - 1; i >= 0; i--) {
          if (t >= ts[i]) { idx = i; break; }
        }
        setCurrentLyricIndex(idx);
      } else {
        setCurrentLyricIndex(Math.min(
          Math.floor((t / audio.duration) * song.content.lyrics.length),
          song.content.lyrics.length - 1
        ));
      }
    };
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [song.audioSrc]);

  // Fallback timer for songs without MP3
  useEffect(() => {
    if (song.audioSrc) return;
    let interval: any;
    if (isPlaying) interval = setInterval(() => {
      setCurrentLyricIndex(p => (p + 1) % song.content.lyrics.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPlaying, song.audioSrc, song.content.lyrics.length]);

  const handleTogglePlay = () => {
    sfxService.playClick();
    if (audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play().catch(() => {});
    }
    setIsPlaying(p => !p);
  };

  const handleNavigate = (s: Screen) => { sfxService.playClick(); onNavigate(s); };

  // Active lyrics: prefer LRC data; fall back to types.ts
  const activeLyrics = lrcLines.length > 0 ? lrcLines.map(l => l.lyric) : song.content.lyrics;

  // Image: each lyric maps to a storyPage (2 lyrics per page)
  const storyPageForLyric = song.content.storyPages[Math.floor(currentLyricIndex / 2)];
  const coverImageUrl = storyPageForLyric?.imageUrl ?? null;

  const progressWidth = song.audioSrc ? audioProgress : (isPlaying ? 100 : 33);
  const progressDuration = song.audioSrc ? 0.1 : (isPlaying ? 12 : 0.5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full w-full relative z-10 flex flex-col"
      style={{ background: 'linear-gradient(180deg, #001a26 0%, #00394e 100%)' }}
    >
      <nav className="relative z-50 flex justify-between items-start p-10">
        <HomeButton onClick={() => onNavigate('MAP')} />
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
            {coverImageUrl ? (
              // Songs with local illustrations: show the matching image
              <AnimatePresence mode="wait">
                <motion.div
                  key={Math.floor(currentLyricIndex / 2)}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="w-72 h-72 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl"
                >
                  <img src={coverImageUrl} alt="Song illustration" className="w-full h-full object-cover" />
                </motion.div>
              </AnimatePresence>
            ) : (
              // Other songs: original spinning star
              <>
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
              </>
            )}
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
              {activeLyrics[currentLyricIndex] ?? ''}
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
            animate={{ width: `${progressWidth}%` }}
            transition={{ duration: progressDuration, ease: "linear" }}
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

function KaraokeScreen({ song, onBack, onNavigate }: { song: SongNode, onBack: () => void, onNavigate: (s: Screen) => void }) {
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

  const totalProgress = song.content.lyrics.length > 0
    ? Math.min(100, (currentLyricIndex * 100 + lyricProgress) / song.content.lyrics.length)
    : 0;

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
      <main className="flex-grow flex flex-col items-center relative z-10 px-6 md:px-20 gap-2 md:gap-4 py-2 md:py-4 min-h-0">
        {/* PK Scores / Melody Bars */}
        <div className="w-full flex justify-between items-center max-w-6xl flex-shrink-0">
          {isPkActive ? (
            <>
              <motion.div 
                animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
                className="flex flex-col items-center gap-1 md:gap-3"
              >
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-blue-400 border-2 md:border-4 border-white shadow-2xl overflow-hidden">
                  <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                    <defs>
                      <radialGradient id="elsaBgP1" cx="50%" cy="35%" r="70%">
                        <stop offset="0%" stopColor="#d8f4ff"/>
                        <stop offset="100%" stopColor="#4898d8"/>
                      </radialGradient>
                    </defs>
                    <rect width="80" height="80" fill="url(#elsaBgP1)"/>
                    {/* 后发（白金色） */}
                    <ellipse cx="40" cy="28" rx="26" ry="25" fill="#c8d8f8"/>
                    {/* 脸 */}
                    <ellipse cx="40" cy="38" rx="21" ry="22" fill="#fde8d8"/>
                    {/* 顶发 */}
                    <path d="M 16 28 Q 22 4 40 3 Q 58 4 64 28 Q 52 12 40 14 Q 28 12 16 28" fill="#b8c8f0"/>
                    {/* 发丝高光 */}
                    <path d="M 36 3 Q 40 1 44 3 Q 40 10 36 3" fill="#e0e8ff"/>
                    {/* 左眼 */}
                    <ellipse cx="32" cy="35" rx="5.5" ry="6" fill="white"/>
                    <ellipse cx="32" cy="35.5" rx="3.8" ry="4.2" fill="#2898d8"/>
                    <circle cx="32" cy="36" r="2.2" fill="#082840"/>
                    <circle cx="33.8" cy="33.5" r="1.5" fill="white"/>
                    <circle cx="31" cy="35" r="0.8" fill="white" opacity="0.7"/>
                    {/* 右眼 */}
                    <ellipse cx="48" cy="35" rx="5.5" ry="6" fill="white"/>
                    <ellipse cx="48" cy="35.5" rx="3.8" ry="4.2" fill="#2898d8"/>
                    <circle cx="48" cy="36" r="2.2" fill="#082840"/>
                    <circle cx="49.8" cy="33.5" r="1.5" fill="white"/>
                    <circle cx="47" cy="35" r="0.8" fill="white" opacity="0.7"/>
                    {/* 睫毛左 */}
                    <path d="M 26.5 31 Q 32 26 37.5 31" stroke="#082840" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
                    <line x1="27.5" y1="31.5" x2="25" y2="26" stroke="#082840" strokeWidth="1.1" strokeLinecap="round"/>
                    <line x1="32" y1="29" x2="32" y2="24" stroke="#082840" strokeWidth="1.1" strokeLinecap="round"/>
                    <line x1="36.5" y1="31" x2="38.5" y2="26.5" stroke="#082840" strokeWidth="1.1" strokeLinecap="round"/>
                    {/* 睫毛右 */}
                    <path d="M 42.5 31 Q 48 26 53.5 31" stroke="#082840" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
                    <line x1="43.5" y1="31.5" x2="41.5" y2="26.5" stroke="#082840" strokeWidth="1.1" strokeLinecap="round"/>
                    <line x1="48" y1="29" x2="48" y2="24" stroke="#082840" strokeWidth="1.1" strokeLinecap="round"/>
                    <line x1="52.5" y1="31" x2="55" y2="26" stroke="#082840" strokeWidth="1.1" strokeLinecap="round"/>
                    {/* 眉毛 */}
                    <path d="M 26 28 Q 32 24 38 27" stroke="#8898b8" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
                    <path d="M 42 27 Q 48 24 54 28" stroke="#8898b8" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
                    {/* 鼻子 */}
                    <circle cx="40" cy="43" r="1.1" fill="#e0a898" opacity="0.6"/>
                    {/* 腮红 */}
                    <ellipse cx="26" cy="44" rx="7" ry="4" fill="#ffb8d0" opacity="0.35"/>
                    <ellipse cx="54" cy="44" rx="7" ry="4" fill="#ffb8d0" opacity="0.35"/>
                    {/* 嘴 */}
                    <path d="M 33 51 Q 40 57 47 51" stroke="#e06878" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                    <path d="M 33 51 Q 36.5 54.5 40 53.5 Q 43.5 54.5 47 51" fill="#f09898"/>
                    {/* 冰晶皇冠 */}
                    <path d="M 24 18 L 29 8 L 34 16 L 40 6 L 46 16 L 51 8 L 56 18" stroke="#a8e0ff" strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
                    <line x1="23" y1="18" x2="57" y2="18" stroke="#a8e0ff" strokeWidth="1.5"/>
                    <circle cx="29" cy="8" r="1.5" fill="#d8f4ff"/>
                    <circle cx="40" cy="6" r="2" fill="#d8f4ff"/>
                    <circle cx="51" cy="8" r="1.5" fill="#d8f4ff"/>
                    <circle cx="40" cy="6" r="2.2" fill="#80d8ff" opacity="0.9"/>
                    {/* 冰蓝礼服 */}
                    <path d="M 0 64 Q 18 52 40 54 Q 62 52 80 64 L 80 80 L 0 80Z" fill="#58b8e8"/>
                    <path d="M 0 71 Q 20 62 40 63 Q 60 62 80 71 L 80 80 L 0 80Z" fill="#3888c8"/>
                    <path d="M 12 62 Q 40 56 68 62" stroke="#a8e8ff" strokeWidth="1" fill="none" opacity="0.65"/>
                    {/* 侧发 */}
                    <path d="M 16 28 Q 11 48 13 62" stroke="#c8d8f8" strokeWidth="11" fill="none" strokeLinecap="round" opacity="0.85"/>
                    <path d="M 64 28 Q 69 48 67 62" stroke="#c8d8f8" strokeWidth="11" fill="none" strokeLinecap="round" opacity="0.85"/>
                    <path d="M 16 28 Q 11 48 13 62" stroke="#9898c8" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.3"/>
                    <path d="M 64 28 Q 69 48 67 62" stroke="#9898c8" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.3"/>
                    {/* 雪花装饰 */}
                    <g opacity="0.7" fill="none" stroke="#c8ecff" strokeWidth="1">
                      <line x1="6" y1="10" x2="6" y2="18"/>
                      <line x1="2" y1="14" x2="10" y2="14"/>
                      <line x1="3" y1="11" x2="9" y2="17"/>
                      <line x1="9" y1="11" x2="3" y2="17"/>
                    </g>
                    <g opacity="0.6" fill="none" stroke="#c8ecff" strokeWidth="0.8">
                      <line x1="72" y1="8" x2="72" y2="14"/>
                      <line x1="69" y1="11" x2="75" y2="11"/>
                      <line x1="70" y1="9" x2="74" y2="13"/>
                      <line x1="74" y1="9" x2="70" y2="13"/>
                    </g>
                  </svg>
                </div>
                <div className="bg-blue-500 text-white px-3 md:px-6 py-1 rounded-full font-headline font-black text-sm md:text-2xl shadow-lg border border-white/20">
                  {scoreLeft}
                </div>
                <span className="text-white font-black text-[8px] md:text-[10px] tracking-widest uppercase opacity-70">Elsa</span>
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
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-full border-2 md:border-4 border-white shadow-2xl overflow-hidden">
                  <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                    <defs>
                      <radialGradient id="clownBg" cx="50%" cy="40%" r="65%">
                        <stop offset="0%" stopColor="#fff8e0"/>
                        <stop offset="100%" stopColor="#ffd060"/>
                      </radialGradient>
                    </defs>
                    {/* 黄色背景 */}
                    <rect width="80" height="80" fill="url(#clownBg)"/>
                    {/* 左侧红色爆炸头 */}
                    <circle cx="10" cy="32" r="13" fill="#ff3030"/>
                    <circle cx="6" cy="22" r="9" fill="#ff3030"/>
                    <circle cx="14" cy="18" r="10" fill="#ff3030"/>
                    {/* 右侧红色爆炸头 */}
                    <circle cx="70" cy="32" r="13" fill="#ff3030"/>
                    <circle cx="74" cy="22" r="9" fill="#ff3030"/>
                    <circle cx="66" cy="18" r="10" fill="#ff3030"/>
                    {/* 顶部小爆炸 */}
                    <circle cx="40" cy="8" r="8" fill="#ff3030"/>
                    <circle cx="30" cy="10" r="7" fill="#ff3030"/>
                    <circle cx="50" cy="10" r="7" fill="#ff3030"/>
                    {/* 白色脸 */}
                    <ellipse cx="40" cy="42" rx="24" ry="26" fill="white"/>
                    {/* 左眼彩妆（蓝色星形） */}
                    <ellipse cx="29" cy="36" rx="8" ry="8" fill="#60c8ff" opacity="0.5"/>
                    <ellipse cx="29" cy="36" rx="5.5" ry="6" fill="white"/>
                    <ellipse cx="29" cy="36.5" rx="3.5" ry="4" fill="#1860c8"/>
                    <circle cx="29" cy="37" r="2" fill="#081830"/>
                    <circle cx="30.5" cy="34.8" r="1.3" fill="white"/>
                    {/* 右眼彩妆（绿色星形） */}
                    <ellipse cx="51" cy="36" rx="8" ry="8" fill="#60e870" opacity="0.5"/>
                    <ellipse cx="51" cy="36" rx="5.5" ry="6" fill="white"/>
                    <ellipse cx="51" cy="36.5" rx="3.5" ry="4" fill="#186018"/>
                    <circle cx="51" cy="37" r="2" fill="#081808"/>
                    <circle cx="52.5" cy="34.8" r="1.3" fill="white"/>
                    {/* 眉毛（夸张上扬） */}
                    <path d="M 21 28 Q 29 20 37 27" stroke="#181818" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    <path d="M 43 27 Q 51 20 59 28" stroke="#181818" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    {/* 红鼻子（超大） */}
                    <circle cx="40" cy="46" r="7" fill="#ff1818"/>
                    <circle cx="38" cy="44" r="2" fill="#ff8888" opacity="0.6"/>
                    {/* 腮红（橙色） */}
                    <ellipse cx="22" cy="47" rx="8" ry="5" fill="#ff8840" opacity="0.5"/>
                    <ellipse cx="58" cy="47" rx="8" ry="5" fill="#ff8840" opacity="0.5"/>
                    {/* 大嘴（夸张笑） */}
                    <path d="M 22 54 Q 40 70 58 54" stroke="#e01818" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                    <path d="M 22 54 Q 31 63 40 64 Q 49 63 58 54 Q 49 60 40 61 Q 31 60 22 54Z" fill="#e84848"/>
                    {/* 牙齿 */}
                    <rect x="30" y="57" width="8" height="5" rx="1" fill="white"/>
                    <rect x="40" y="57" width="8" height="5" rx="1" fill="white"/>
                    {/* 彩色蝴蝶结领 */}
                    <path d="M 0 68 Q 18 58 40 60 Q 62 58 80 68 L 80 80 L 0 80Z" fill="#e01880"/>
                    <circle cx="14" cy="64" r="4" fill="#ffee00"/>
                    <circle cx="26" cy="62" r="3" fill="#00c8ff"/>
                    <circle cx="40" cy="61" r="4" fill="#ffee00"/>
                    <circle cx="54" cy="62" r="3" fill="#00c8ff"/>
                    <circle cx="66" cy="64" r="4" fill="#ffee00"/>
                    {/* 帽子尖顶 */}
                    <path d="M 28 16 L 40 1 L 52 16Z" fill="#9020e0"/>
                    <path d="M 27 17 L 53 17" stroke="#9020e0" strokeWidth="3" strokeLinecap="round"/>
                    <circle cx="40" cy="1" r="2.5" fill="#ffee00"/>
                    {/* 帽子彩色条纹 */}
                    <line x1="34" y1="16" x2="40" y2="4" stroke="#ffee00" strokeWidth="1.5" opacity="0.6"/>
                    <line x1="46" y1="16" x2="40" y2="4" stroke="#ff88cc" strokeWidth="1.5" opacity="0.6"/>
                  </svg>
                </div>
                <div className="bg-purple-600 text-white px-3 md:px-6 py-1 rounded-full font-headline font-black text-sm md:text-2xl shadow-lg border border-white/20">
                  {scoreRight}
                </div>
                <span className="text-white font-black text-[8px] md:text-[10px] tracking-widest uppercase opacity-70">小丑</span>
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
        <div className="relative flex flex-col items-center flex-shrink-0">
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

        {/* Lyrics Area - fills remaining space */}
        <div className="text-center max-w-4xl w-full px-4 flex-1 min-h-0 relative overflow-hidden flex flex-col items-center justify-center">
          {/* Gradient Masks */}
          <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-[#0a041a] to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#1a0b2e] to-transparent z-10 pointer-events-none" />

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
            <div className="relative w-full h-full overflow-hidden">
              <motion.div
                animate={{ y: -currentLyricIndex * 100 }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
                className="flex flex-col items-center absolute left-0 w-full"
                style={{ top: 'calc(50% - 50px)' }}
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
        
        <p className="font-body text-lg md:text-2xl text-purple-200/40 tracking-widest font-bold uppercase">
          {song.chineseTitle}
        </p>
      </main>

      {/* Controls */}
      <footer className="relative z-50 px-6 md:px-20 pb-6 md:pb-8 pt-2 md:pt-4 flex flex-col items-center gap-2 md:gap-4">
        <div className="w-full max-w-4xl h-2 md:h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-[width] duration-100 ease-linear"
            style={{ width: `${totalProgress}%` }}
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
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [lrcLines, setLrcLines] = useState<{ time: number; lyric: string }[]>([]);
  const lrcLinesRef = React.useRef<{ time: number; lyric: string }[]>([]);
  useEffect(() => { lrcLinesRef.current = lrcLines; }, [lrcLines]);

  // Fetch and parse LRC file
  useEffect(() => {
    if (!song.lrcSrc) return;
    fetch(song.lrcSrc)
      .then(r => r.text())
      .then(text => setLrcLines(parseLRC(text)))
      .catch(() => {});
  }, [song.lrcSrc]);

  // Setup audio element
  useEffect(() => {
    if (!song.audioSrc) return;
    audioRef.current = new Audio(song.audioSrc);
    return () => { audioRef.current?.pause(); };
  }, [song.audioSrc]);

  // Auto-play the corresponding audio segment when page or LRC data changes
  useEffect(() => {
    if (!song.audioSrc || !audioRef.current) return;
    const audio = audioRef.current;

    const playSegment = () => {
      const lines = lrcLinesRef.current;
      let startTime: number;
      let endTime: number;

      if (lines.length > 0) {
        // LRC-based: each story page covers 2 lyric lines
        const lyricStart = currentPage * 2;
        const lyricEnd   = lyricStart + 2;
        startTime = lines[lyricStart]?.time ?? 0;
        endTime   = lines[lyricEnd]?.time   ?? audio.duration;
      } else {
        // Fallback: divide evenly
        startTime = (currentPage / pages.length) * audio.duration;
        endTime   = ((currentPage + 1) / pages.length) * audio.duration;
      }

      audio.currentTime = startTime;
      audio.play().catch(() => {});
      const timer = setTimeout(() => audio.pause(), (endTime - startTime) * 1000);
      return timer;
    };

    let timer: ReturnType<typeof setTimeout>;
    if (audio.readyState >= 1) {
      timer = playSegment();
    } else {
      audio.addEventListener('loadedmetadata', () => { timer = playSegment(); }, { once: true });
    }
    return () => { clearTimeout(timer); audio.pause(); };
  }, [currentPage, song.audioSrc, lrcLines]);

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
        <HomeButton onClick={() => onNavigate('MAP')} />
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
                  src={page.imageUrl ?? `https://picsum.photos/seed/${page.imageSeed}/800/800`}
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

      {/* LRC Debug Bar — bottom center, only when LRC is loaded */}
      {lrcLines.length > 0 && (() => {
        const lyricStart = currentPage * 2;
        const startTime  = lrcLines[lyricStart]?.time ?? 0;
        const endTime    = lrcLines[lyricStart + 2]?.time ?? null;
        const fmt = (s: number) =>
          `${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(2).padStart(5, '0')}`;
        return (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div className="bg-black/80 backdrop-blur border border-yellow-400/50 rounded-2xl px-6 py-3 flex items-center gap-5 text-xs font-mono shadow-xl">
              <span className="text-yellow-400 font-black uppercase tracking-widest">LRC</span>
              <div className="flex flex-col gap-0.5 text-white/80">
                {lrcLines[lyricStart] && (
                  <span>[{fmt(lrcLines[lyricStart].time)}] {lrcLines[lyricStart].lyric}</span>
                )}
                {lrcLines[lyricStart + 1] && (
                  <span>[{fmt(lrcLines[lyricStart + 1].time)}] {lrcLines[lyricStart + 1].lyric}</span>
                )}
              </div>
              <div className="flex items-center gap-2 border-l border-white/20 pl-4">
                <span className="text-green-400 font-bold">▶ {fmt(startTime)}</span>
                <span className="text-white/30">→</span>
                <span className="text-red-400 font-bold">■ {endTime !== null ? fmt(endTime) : 'END'}</span>
                {endTime !== null && (
                  <span className="text-white/40">({(endTime - startTime).toFixed(2)}s)</span>
                )}
              </div>
            </div>
          </div>
        );
      })()}
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
        <HomeButton onClick={() => onNavigate('MAP')} />
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
