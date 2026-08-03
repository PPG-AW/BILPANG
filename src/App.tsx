import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TOPICS } from './data/topics';
import { generateQuestion } from './engine/generator';
import { Question } from './engine/types';
import { renderKatex } from './utils/helpers';

// ====================================
// GANTI URL DI BAWAH INI DENGAN URL WEB APP ANDA
// ====================================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxVtfQUth5aveerEgJ4gBmy_NXzRGCqACJqYMHpFN-jiT21uFvADGw0PWjj_7L9XJkogA/exec';
// ====================================

// ======== ICONS (SVG inline) ========
const Icons = {
  menu: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
  x: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  sun: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>,
  moon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
  clock: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  check: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  xCircle: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>,
  logOut: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  play: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>,
  stop: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="5" y="5" rx="2"/></svg>,
  book: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
  arrowRight: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  download: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
  trash: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  lightbulb: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>,
  user: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  refresh: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>,
};

// ======== TYPES ========
type Page = 'login' | 'guruLogin' | 'app' | 'dashboard';

interface DashboardRow {
  rowNum: number;
  nama: string;
  tanggal: string;
  waktu: string;
  topik: string;
  tipeSoal: string;
  soal: string;
  jawabanSiswa: string;
  status: string;
}

// ======== APP ========
export default function App() {
  const [page, setPage] = useState<Page>('login');
  const [studentName, setStudentName] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('studentName');
    if (saved) { setStudentName(saved); setPage('app'); }
    const dm = localStorage.getItem('darkMode');
    if (dm === 'true') setDarkMode(true);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const handleLogin = (name: string) => {
    setStudentName(name);
    sessionStorage.setItem('studentName', name);
    setPage('app');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('studentName');
    setStudentName('');
    setPage('login');
  };

  if (page === 'login') return <LoginPage onLogin={handleLogin} onGuruClick={() => setPage('guruLogin')} darkMode={darkMode} toggleDark={() => setDarkMode(!darkMode)} />;
  if (page === 'guruLogin') return <GuruLoginPage onBack={() => setPage('login')} onLogin={() => setPage('dashboard')} darkMode={darkMode} toggleDark={() => setDarkMode(!darkMode)} />;
  if (page === 'dashboard') return <DashboardPage onLogout={() => setPage('login')} darkMode={darkMode} toggleDark={() => setDarkMode(!darkMode)} />;
  return <MainApp studentName={studentName} onLogout={handleLogout} darkMode={darkMode} toggleDark={() => setDarkMode(!darkMode)} />;
}

// ======== LOGIN PAGE ========
function LoginPage({ onLogin, onGuruClick, darkMode, toggleDark }: { onLogin: (name: string) => void; onGuruClick: () => void; darkMode: boolean; toggleDark: () => void }) {
  const [name, setName] = useState('');

  return (
    <div className="login-container">
      <div className="card login-card animate-fadeIn">
        <div style={{ textAlign: 'right', marginBottom: 8 }}>
          <button className="btn btn-icon btn-ghost" onClick={toggleDark} title="Toggle dark mode">
            {darkMode ? Icons.sun : Icons.moon}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          {Icons.book}
        </div>
        <h1 className="login-title">Latihan Bilangan Berpangkat</h1>
        <p className="login-subtitle">Masukkan namamu untuk mulai berlatih</p>
        <form onSubmit={e => { e.preventDefault(); if (name.trim()) onLogin(name.trim()); }}>
          <div className="form-group">
            <label className="form-label" htmlFor="name-input">Nama</label>
            <input id="name-input" className="form-input" type="text" placeholder="Ketik namamu di sini..." value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={!name.trim()}>
            {Icons.play} <span>Masuk</span>
          </button>
        </form>
        <button className="guru-link" onClick={onGuruClick}>Masuk sebagai Guru</button>
      </div>
    </div>
  );
}

// ======== GURU LOGIN ========
function GuruLoginPage({ onBack, onLogin, darkMode, toggleDark }: { onBack: () => void; onLogin: () => void; darkMode: boolean; toggleDark: () => void }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === 'guru' && pass === 'guru123') { onLogin(); }
    else { setError('Username atau password salah'); }
  };

  return (
    <div className="login-container">
      <div className="card login-card animate-fadeIn">
        <div style={{ textAlign: 'right', marginBottom: 8 }}>
          <button className="btn btn-icon btn-ghost" onClick={toggleDark}>{darkMode ? Icons.sun : Icons.moon}</button>
        </div>
        <h1 className="login-title">Dashboard Guru</h1>
        <p className="login-subtitle">Masuk untuk melihat data siswa</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="guru-user">Username</label>
            <input id="guru-user" className="form-input" type="text" value={user} onChange={e => setUser(e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="guru-pass">Password</label>
            <input id="guru-pass" className="form-input" type="password" value={pass} onChange={e => setPass(e.target.value)} />
          </div>
          {error && <p style={{ color: 'var(--wrong)', fontSize: '0.88rem', marginBottom: 16 }}>{error}</p>}
          <button type="submit" className="btn btn-primary btn-full">Masuk</button>
        </form>
        <button className="guru-link" onClick={onBack}>Kembali ke halaman siswa</button>
      </div>
    </div>
  );
}

// ======== MAIN APP ========
function MainApp({ studentName, onLogout, darkMode, toggleDark }: { studentName: string; onLogout: () => void; darkMode: boolean; toggleDark: () => void }) {
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [selectedSubtype, setSelectedSubtype] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [questionNum, setQuestionNum] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Timer
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // MathQuill ref
  const mqRef = useRef<any>(null);
  const mqFieldRef = useRef<any>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const totalSecs = timerMinutes * 60;
    setTimeLeft(totalSecs);
    setTimeUp(false);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [timerMinutes]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeUp(false);
  }, []);

  const nextQuestion = useCallback(() => {
    if (selectedTopic === null || selectedSubtype === null) return;
    const q = generateQuestion(selectedTopic, selectedSubtype);
    setCurrentQuestion(q);
    setQuestionNum(prev => prev + 1);
    setShowResult(false);
    setIsCorrect(false);
    setUserAnswer('');
    setTimeUp(false);
    if (timerEnabled) startTimer();
    // Clear MathQuill
    setTimeout(() => {
      if (mqFieldRef.current) {
        mqFieldRef.current.latex('');
        mqFieldRef.current.focus();
      }
    }, 100);
  }, [selectedTopic, selectedSubtype, timerEnabled, startTimer]);

  const startPractice = useCallback(() => {
    if (selectedTopic === null || selectedSubtype === null) return;
    setIsActive(true);
    setQuestionNum(0);
    nextQuestion();
    setSidebarOpen(false);
  }, [selectedTopic, selectedSubtype, nextQuestion]);

  const stopPractice = useCallback(() => {
    setIsActive(false);
    setCurrentQuestion(null);
    setQuestionNum(0);
    setShowResult(false);
    stopTimer();
  }, [stopTimer]);

  const handleCheck = useCallback(() => {
    if (!currentQuestion || !mqFieldRef.current) return;
    const userLatex = mqFieldRef.current.latex();
    setUserAnswer(userLatex);
    
    // Simple comparison: normalize and compare
    const normalize = (s: string) => s.replace(/\s+/g, '').replace(/\\cdot/g, '\\times').replace(/·/g, '\\times');
    const correct = normalize(userLatex) === normalize(currentQuestion.answerLatex);
    setIsCorrect(correct);
    setShowResult(true);
    stopTimer();

    // Send data to Apps Script
    if (APPS_SCRIPT_URL) {
      const topic = TOPICS.find(t => t.id === currentQuestion.topicId);
      const subtype = topic?.subtypes.find(s => s.id === currentQuestion.subtypeId);
      const now = new Date();
      const data = {
        nama: studentName,
        tanggal: now.toLocaleDateString('id-ID'),
        waktu: now.toLocaleTimeString('id-ID'),
        topik: topic?.name || '',
        tipeSoal: subtype?.desc || '',
        soal: currentQuestion.questionText,
        jawabanSiswa: userLatex,
        status: correct ? 'Benar' : 'Salah',
      };
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => {});
    }
  }, [currentQuestion, stopTimer, studentName]);

  // Initialize MathQuill
  useEffect(() => {
    const initMQ = () => {
      const MQ = (window as any).MathQuill?.getInterface?.(2);
      if (!MQ) {
        setTimeout(initMQ, 200);
        return;
      }
      mqRef.current = MQ;
    };
    initMQ();
  }, []);

  // Render question math
  const renderMath = (latex: string) => {
    return <span dangerouslySetInnerHTML={{ __html: renderKatex(latex, true) }} />;
  };

  return (
    <div className="app-layout">
      {/* Hamburger */}
      <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? Icons.x : Icons.menu}
      </button>
      {sidebarOpen && <div className="sidebar-overlay show" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{studentName.charAt(0).toUpperCase()}</div>
            <div className="sidebar-user-name">{studentName}</div>
          </div>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Pilih Topik</div>
            <div className="setup-topics">
              {TOPICS.map(topic => (
                <div key={topic.id}>
                  <div className={`topic-item ${selectedTopic === topic.id ? 'active' : ''}`}>
                    <label>
                      <input type="radio" name="topic" checked={selectedTopic === topic.id}
                        onChange={() => { setSelectedTopic(topic.id); setSelectedSubtype(null); }} />
                      <span>{topic.name}</span>
                    </label>
                  </div>
                  {selectedTopic === topic.id && (
                    <div className="subtype-list animate-fadeIn">
                      {topic.subtypes.map(st => (
                        <div key={st.id} className={`subtype-item ${selectedSubtype === st.id ? 'active' : ''}`}>
                          <label>
                            <input type="radio" name="subtype" checked={selectedSubtype === st.id}
                              onChange={() => {
                                setSelectedSubtype(st.id);
                                if (isActive) {
                                  // Generate new question with new subtype immediately
                                  setTimeout(() => {
                                    const q = generateQuestion(topic.id, st.id);
                                    setCurrentQuestion(q);
                                    setQuestionNum(prev => prev + 1);
                                    setShowResult(false);
                                    setIsCorrect(false);
                                    setUserAnswer('');
                                    if (timerEnabled) startTimer();
                                    setTimeout(() => { mqFieldRef.current?.latex(''); mqFieldRef.current?.focus(); }, 100);
                                  }, 50);
                                }
                              }} />
                            <span>{st.desc}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Timer</div>
            <div className="toggle-wrapper">
              <label className="toggle">
                <input type="checkbox" checked={timerEnabled} onChange={e => setTimerEnabled(e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-label">{timerEnabled ? 'Timer Aktif' : 'Timer Mati'}</span>
            </div>
            {timerEnabled && (
              <div className="timer-input-group animate-fadeIn">
                <input type="number" className="timer-input" min="1" max="60" value={timerMinutes}
                  onChange={e => setTimerMinutes(Math.max(1, parseInt(e.target.value) || 1))} />
                <span className="timer-unit">menit per soal</span>
              </div>
            )}
          </div>

          {/* Dark mode */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">Tampilan</div>
            <div className="toggle-wrapper">
              <label className="toggle">
                <input type="checkbox" checked={darkMode} onChange={toggleDark} />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {darkMode ? Icons.moon : Icons.sun} {darkMode ? 'Mode Gelap' : 'Mode Terang'}
              </span>
            </div>
          </div>
        </div>
        <div className="sidebar-footer">
          {!isActive && selectedTopic !== null && selectedSubtype !== null && (
            <button className="btn btn-primary btn-full" onClick={startPractice}>
              {Icons.play} Mulai Latihan
            </button>
          )}
          {isActive && (
            <button className="btn btn-secondary btn-full" onClick={stopPractice}>
              {Icons.stop} Berhenti
            </button>
          )}
          <button className="btn btn-ghost btn-full" onClick={onLogout}>
            {Icons.logOut} Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {!isActive ? (
          <WelcomeScreen
            selectedTopic={selectedTopic}
            selectedSubtype={selectedSubtype}
            onStart={startPractice}
            hasSelection={selectedTopic !== null && selectedSubtype !== null}
          />
        ) : currentQuestion ? (
          <QuestionCard
            question={currentQuestion}
            questionNum={questionNum}
            showResult={showResult}
            isCorrect={isCorrect}
            userAnswer={userAnswer}
            onCheck={handleCheck}
            onNext={nextQuestion}
            mqRef={mqRef}
            mqFieldRef={mqFieldRef}
            timerEnabled={timerEnabled}
            timeLeft={timeLeft}
            timeUp={timeUp}
            renderMath={renderMath}
          />
        ) : null}
      </main>

      {/* Time up notification */}
      {timeUp && !showResult && (
        <div className="time-up-notification animate-fadeIn">
          {Icons.clock} Waktu habis! Kamu masih bisa menjawab.
        </div>
      )}
    </div>
  );
}

// ======== WELCOME SCREEN ========
function WelcomeScreen({ selectedTopic, selectedSubtype, onStart, hasSelection }: {
  selectedTopic: number | null; selectedSubtype: string | null; onStart: () => void; hasSelection: boolean;
}) {
  const topic = selectedTopic !== null ? TOPICS.find(t => t.id === selectedTopic) : null;
  const subtype = topic && selectedSubtype ? topic.subtypes.find(s => s.id === selectedSubtype) : null;

  return (
    <div className="card setup-card animate-fadeIn" style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 20 }}>{Icons.lightbulb}</div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 12 }}>Selamat Berlatih!</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
        Pilih topik dan tipe soal dari sidebar di sebelah kiri, lalu klik "Mulai Latihan" untuk memulai.
      </p>
      {topic && subtype && (
        <div style={{ padding: '16px 20px', background: 'var(--bg-input)', borderRadius: 'var(--radius)', marginBottom: 20 }}>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>{topic.name}</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{subtype.desc}</p>
        </div>
      )}
      {hasSelection && (
        <button className="btn btn-primary" onClick={onStart}>
          {Icons.play} Mulai Latihan
        </button>
      )}
      {!hasSelection && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Pilih topik dan tipe soal terlebih dahulu
        </p>
      )}
    </div>
  );
}

// ======== QUESTION CARD ========
function QuestionCard({ question, questionNum, showResult, isCorrect, userAnswer, onCheck, onNext, mqRef, mqFieldRef, timerEnabled, timeLeft, timeUp, renderMath }: {
  question: Question; questionNum: number; showResult: boolean; isCorrect: boolean;
  userAnswer: string; onCheck: () => void; onNext: () => void;
  mqRef: React.MutableRefObject<any>; mqFieldRef: React.MutableRefObject<any>;
  timerEnabled: boolean; timeLeft: number; timeUp: boolean;
  renderMath: (latex: string) => React.JSX.Element;
}) {
  const mqContainerRef = useRef<HTMLDivElement>(null);
  const [mqReady, setMqReady] = useState(false);

  useEffect(() => {
    // Initialize MathQuill field
    const initField = () => {
      const MQ = mqRef.current;
      if (!MQ || !mqContainerRef.current) {
        setTimeout(initField, 200);
        return;
      }
      const el = mqContainerRef.current.querySelector('.mq-field');
      if (!el) return;
      // Clear any existing
      if (mqFieldRef.current) {
        try { mqFieldRef.current.revert(); } catch {}
      }
      const field = MQ.MathField(el, {
        spaceBehavesLikeTab: true,
        handlers: {
          edit: () => {},
        },
      });
      mqFieldRef.current = field;
      setMqReady(true);
      setTimeout(() => field.focus(), 150);
    };
    initField();
    return () => {
      if (mqFieldRef.current) {
        try { mqFieldRef.current.revert(); } catch {}
        mqFieldRef.current = null;
      }
      setMqReady(false);
    };
  }, [question]); // Re-init on new question

  const mqCmd = (cmd: string) => {
    if (!mqFieldRef.current) return;
    mqFieldRef.current.cmd(cmd);
    mqFieldRef.current.focus();
  };

  const mqWrite = (latex: string) => {
    if (!mqFieldRef.current) return;
    mqFieldRef.current.write(latex);
    mqFieldRef.current.focus();
  };

  const mqKeystroke = (key: string) => {
    if (!mqFieldRef.current) return;
    mqFieldRef.current.keystroke(key);
    mqFieldRef.current.focus();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const commandLabel = question.commandType === 'simplify' ? 'Sederhanakan' : 'Hitung';

  return (
    <div className="card animate-fadeIn" key={questionNum}>
      <div className="question-header">
        <span className="question-number">Soal ke-{questionNum}</span>
        <span className="question-type-badge">{commandLabel}</span>
        {timerEnabled && !showResult && (
          <span className={`question-timer ${timeUp || timeLeft <= 30 ? 'warning' : ''}`}>
            {Icons.clock} {formatTime(timeLeft)}
          </span>
        )}
      </div>

      <p className="question-instruction">{commandLabel} bentuk berikut:</p>
      <div className="question-expression">
        {renderMath(question.questionLatex)}
      </div>

      {!showResult ? (
        <>
          <div className="mq-container" ref={mqContainerRef}>
            <div className="mq-container-label">Jawabanmu:</div>
            <div className="mq-input-wrapper" onClick={() => mqFieldRef.current?.focus()}>
              <span className="mq-field"></span>
            </div>
          </div>
          <div className="mq-buttons">
            <button className="mq-btn" onClick={() => mqCmd('^')} title="Pangkat">
              <span dangerouslySetInnerHTML={{ __html: renderKatex('a^{n}', false) }} />
            </button>
            <button className="mq-btn" onClick={() => mqCmd('/')} title="Pecahan">
              <span dangerouslySetInnerHTML={{ __html: renderKatex('\\frac{a}{b}', false) }} />
            </button>
            <button className="mq-btn" onClick={() => mqCmd('\\sqrt')} title="Akar kuadrat">
              <span dangerouslySetInnerHTML={{ __html: renderKatex('\\sqrt{\\phantom{x}}', false) }} />
            </button>
            <button className="mq-btn" onClick={() => mqCmd('\\nthroot')} title="Akar ke-n">
              <span dangerouslySetInnerHTML={{ __html: renderKatex('\\sqrt[n]{\\phantom{x}}', false) }} />
            </button>
            <button className="mq-btn" onClick={() => mqWrite('\\times')} title="Kali">
              <span dangerouslySetInnerHTML={{ __html: renderKatex('\\times', false) }} />
            </button>
            <button className="mq-btn" onClick={() => { mqWrite('('); mqWrite(')'); mqKeystroke('Left'); }} title="Kurung">( )</button>
            <button className="mq-btn" onClick={() => mqKeystroke('Backspace')} title="Hapus">
              {Icons.refresh} Hapus
            </button>
          </div>
          <button className="btn btn-primary btn-full" onClick={onCheck} disabled={!mqReady}>
            {Icons.check} Periksa Jawaban
          </button>
        </>
      ) : (
        <div className="animate-fadeIn">
          {/* Result banner */}
          <div className={`result-banner ${isCorrect ? 'correct' : 'wrong'}`}>
            {isCorrect ? Icons.check : Icons.xCircle}
            {isCorrect ? 'Benar! Jawaban kamu tepat.' : 'Belum tepat. Perhatikan pembahasan berikut.'}
          </div>

          {/* Show user answer */}
          <div className="result-answer">
            <div className="result-answer-label">Jawabanmu</div>
            <div className="result-answer-value">
              <span dangerouslySetInnerHTML={{ __html: renderKatex(userAnswer || '\\text{(kosong)}', false) }} />
            </div>
          </div>

          {/* Correct answer */}
          <div className="result-answer" style={{ borderLeft: `4px solid var(--correct)` }}>
            <div className="result-answer-label">Jawaban yang benar</div>
            <div className="result-answer-value">
              <span dangerouslySetInnerHTML={{ __html: renderKatex(question.answerLatex, false) }} />
            </div>
          </div>

          {/* Solution */}
          <div className="solution-container">
            <div className="solution-title">
              {Icons.lightbulb} Pembahasan
            </div>
            {question.solutionSteps.map((s, i) => (
              <div key={i} className="solution-step">
                <div className="solution-step-title" dangerouslySetInnerHTML={{ __html: s.title }} />
                {s.content && <div className="solution-step-content" dangerouslySetInnerHTML={{ __html: s.content }} />}
                {s.math && <div className="solution-step-math" dangerouslySetInnerHTML={{ __html: s.math }} />}
              </div>
            ))}
            <div className="solution-final">
              <div className="solution-final-label">Jawaban Akhir</div>
              <div className="solution-final-value">
                <span dangerouslySetInnerHTML={{ __html: renderKatex(question.answerLatex, false) }} />
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-full mt-6" onClick={onNext}>
            {Icons.arrowRight} Soal Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}

// ======== DASHBOARD ========
function DashboardPage({ onLogout, darkMode, toggleDark }: { onLogout: () => void; darkMode: boolean; toggleDark: () => void }) {
  const [data, setData] = useState<DashboardRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchData = useCallback(async () => {
    if (!APPS_SCRIPT_URL) return;
    setLoading(true);
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=getData`);
      const json = await res.json();
      if (json.data) {
        setData(json.data.map((row: any, i: number) => ({
          rowNum: i + 2,
          nama: row[0] || '',
          tanggal: row[1] || '',
          waktu: row[2] || '',
          topik: row[3] || '',
          tipeSoal: row[4] || '',
          soal: row[5] || '',
          jawabanSiswa: row[6] || '',
          status: row[7] || '',
        })));
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = data.filter(row => {
    if (filterName && !row.nama.toLowerCase().includes(filterName.toLowerCase())) return false;
    if (filterTopic && !row.topik.toLowerCase().includes(filterTopic.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async () => {
    if (!APPS_SCRIPT_URL || selected.size === 0) return;
    const rows = Array.from(selected);
    try {
      await fetch(`${APPS_SCRIPT_URL}?action=deleteRows&rows=${JSON.stringify(rows)}`);
      setSelected(new Set());
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
    setShowConfirm(false);
  };

  const handleDownload = () => {
    const headers = ['Nama Siswa', 'Tanggal', 'Waktu', 'Topik', 'Tipe Soal', 'Soal', 'Jawaban Siswa', 'Status'];
    const csvRows = [headers.join(',')];
    filtered.forEach(row => {
      csvRows.push([row.nama, row.tanggal, row.waktu, row.topik, row.tipeSoal, `"${row.soal}"`, `"${row.jawabanSiswa}"`, row.status].join(','));
    });
    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_latihan_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelect = (rowNum: number) => {
    const next = new Set(selected);
    if (next.has(rowNum)) next.delete(rowNum); else next.add(rowNum);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(r => r.rowNum)));
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '24px' }}>
      <div className="dashboard-container animate-fadeIn">
        <div className="dashboard-header">
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Dashboard Guru</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-icon btn-ghost" onClick={toggleDark}>{darkMode ? Icons.sun : Icons.moon}</button>
            <button className="btn btn-secondary btn-sm" onClick={fetchData}>{Icons.refresh} Refresh</button>
            <button className="btn btn-ghost btn-sm" onClick={onLogout}>{Icons.logOut} Keluar</button>
          </div>
        </div>

        <div className="dashboard-filters">
          <input className="form-input" placeholder="Filter nama..." value={filterName} onChange={e => setFilterName(e.target.value)} />
          <input className="form-input" placeholder="Filter topik..." value={filterTopic} onChange={e => setFilterTopic(e.target.value)} />
          <input className="form-input" type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} title="Dari tanggal" />
          <input className="form-input" type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} title="Sampai tanggal" />
          <button className="btn btn-primary btn-sm" onClick={handleDownload}>
            {Icons.download} Unduh CSV
          </button>
          {selected.size > 0 && (
            <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>
              {Icons.trash} Hapus ({selected.size})
            </button>
          )}
        </div>

        {loading ? (
          <div className="empty-state"><p>Memuat data...</p></div>
        ) : !APPS_SCRIPT_URL ? (
          <div className="empty-state">
            <p className="empty-state-text">URL Apps Script belum dikonfigurasi. Silakan isi variabel APPS_SCRIPT_URL di kode.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-text">Belum ada data jawaban siswa.</p>
          </div>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="checkbox-cell"><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
                  <th>Nama</th>
                  <th>Tanggal</th>
                  <th>Waktu</th>
                  <th>Topik</th>
                  <th>Tipe Soal</th>
                  <th>Soal</th>
                  <th>Jawaban</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr key={row.rowNum}>
                    <td className="checkbox-cell"><input type="checkbox" checked={selected.has(row.rowNum)} onChange={() => toggleSelect(row.rowNum)} /></td>
                    <td>{row.nama}</td>
                    <td>{row.tanggal}</td>
                    <td>{row.waktu}</td>
                    <td>{row.topik}</td>
                    <td>{row.tipeSoal}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.soal}</td>
                    <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.jawabanSiswa}</td>
                    <td className={row.status === 'Benar' ? 'status-correct' : 'status-wrong'}>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-title">Konfirmasi Hapus</div>
            <div className="modal-body">Apakah kamu yakin ingin menghapus {selected.size} data yang dipilih? Tindakan ini tidak dapat dibatalkan.</div>
            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowConfirm(false)}>Batal</button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
