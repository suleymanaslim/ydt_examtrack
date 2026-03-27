// frontend/src/App.jsx
// Root — role selection, teacher auth, route to dashboards

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, LogOut, Home, User, GraduationCap, Lock, TrendingUp } from 'lucide-react';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';

const TEACHER_PASSWORD = import.meta.env.VITE_TEACHER_PASSWORD;

export default function App() {
  const [view, setView] = useState('select'); // 'select' | 'student' | 'teacher-auth' | 'teacher'
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('home');

  const handleTeacherLogin = (e) => {
    e.preventDefault();
    if (password === TEACHER_PASSWORD) {
      setView('teacher');
      setError('');
    } else {
      setError('Şifre yanlış. Tekrar deneyin.');
    }
  };

  const handleBack = () => {
    setView('select');
    setPassword('');
    setError('');
    setActiveTab('home');
  };

  // Role selection screen
  if (view === 'select') {
    return (
      <div className="login-container">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="login-header">
            <div className="login-icon"><FileText size={28} /></div>
            <h1>YDT Takip</h1>
            <p className="login-subtitle">Yabancı Dil Testi Çalışma Takip Sistemi</p>
          </div>

          <div className="role-select-buttons">
            <button className="role-select-btn student" onClick={() => setView('student')}>
              <GraduationCap size={24} />
              <span className="role-select-name">Öğrenci</span>
              <span className="role-select-desc">Öğrenci — Sınav Sonucu Gir</span>
            </button>
            <button className="role-select-btn teacher" onClick={() => setView('teacher-auth')}>
              <User size={24} />
              <span className="role-select-name">Öğretmen</span>
              <span className="role-select-desc">Öğretmen — Sonuçları Takip Et</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Teacher password screen
  if (view === 'teacher-auth') {
    return (
      <div className="login-container">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="login-header">
            <div className="login-icon"><Lock size={28} /></div>
            <h1>Öğretmen Girişi</h1>
            <p className="login-subtitle">Öğretmen — Şifrenizi girin</p>
          </div>

          <form onSubmit={handleTeacherLogin}>
            <div className="input-group">
              <label htmlFor="password">Şifre</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin..."
                autoFocus
              />
            </div>

            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {error}
              </motion.div>
            )}

            <button type="submit" className="login-submit">Giriş Yap</button>
            <button type="button" className="btn-back" onClick={handleBack}>
              ← Geri Dön
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Student view
  if (view === 'student') {
    return (
      <div className="app">
        <header className="app-header">
          <div className="header-left">
            <span className="app-logo"><FileText size={22} /></span>
            <h1>YDT Takip</h1>
            <div className="header-user-info">
              <span className="user-icon"><GraduationCap size={14} /></span>
              Öğrenci
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-icon danger" onClick={handleBack} title="Çıkış">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="app-main">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <StudentDashboard />
          </motion.div>
        </main>
        <nav className="mobile-bottom-nav">
          <button className="nav-item active">
            <Home size={20} />
            Sınav Gir
          </button>
          <button className="nav-item" onClick={handleBack}>
            <LogOut size={20} />
            Çıkış
          </button>
        </nav>
      </div>
    );
  }

  // Teacher view
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <span className="app-logo"><FileText size={22} /></span>
          <h1>YDT Takip</h1>
          <div className="desktop-nav">
            <button className={`desktop-nav-btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
              <Home size={16} /> Sınavlar
            </button>
            <button className={`desktop-nav-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
              <TrendingUp size={16} /> Gelişim
            </button>
          </div>
        </div>
        <div className="header-actions">
          <div className="header-user-info">
            <span className="user-icon"><User size={14} /></span>
            Öğretmen
          </div>
          <button className="btn-icon danger" onClick={handleBack} title="Çıkış">
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <main className="app-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <TeacherDashboard activeTab={activeTab} />
          </motion.div>
        </AnimatePresence>
      </main>
      <nav className="mobile-bottom-nav">
        <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <Home size={20} />
          Sınavlar
        </button>
        <button className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
          <TrendingUp size={20} />
          Gelişim
        </button>
        <button className="nav-item" onClick={handleBack}>
          <LogOut size={20} />
          Çıkış
        </button>
      </nav>
    </div>
  );
}
