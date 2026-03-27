// frontend/src/pages/TeacherDashboard.jsx
// Teacher: import JSON from student, store in IndexedDB via Dexie.js, view stats + chart

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList, TrendingUp, BarChart3, Plus, Trash2,
  ClipboardPaste, AlertTriangle, Target, Award, AlertCircle, X,
  CircleDashed, CheckCircle2, XCircle
} from 'lucide-react';
import { TOPICS } from '../constants/topics';
import ExamTable from '../components/ExamTable';
import NetChart from '../components/NetChart';
import db from '../lib/db';

function calculateStats(exams) {
  if (exams.length === 0) return { count: 0, avgNet: 0, bestNet: 0, lastNet: 0 };
  const nets = exams.map((e) => Number(e.totalNet));
  const sorted = [...exams].sort((a, b) => new Date(b.date) - new Date(a.date));
  return {
    count: exams.length,
    avgNet: (nets.reduce((a, b) => a + b, 0) / nets.length).toFixed(1),
    bestNet: Math.max(...nets).toFixed(1),
    lastNet: Number(sorted[0].totalNet).toFixed(1),
  };
}

function calculateNet(correct, wrong) {
  return correct - wrong / 4;
}

function calculateTopicStatsList(exams) {
  if (exams.length === 0) return [];
  
  // Sort exams by date descending to get latest and previous
  const sortedExams = [...exams].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestExam = sortedExams[0];
  const previousExam = sortedExams[1];
  
  const topicStats = TOPICS.map(topic => {
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalQuestions = 0;
    
    exams.forEach(exam => {
      const r = exam.results[topic.key] || { correct: 0, wrong: 0 };
      totalCorrect += r.correct;
      totalWrong += r.wrong;
      totalQuestions += topic.maxQuestions;
    });
    
    const totalBlank = totalQuestions - totalCorrect - totalWrong;
    const net = calculateNet(totalCorrect, totalWrong);
    const successRate = totalQuestions > 0 ? (net / totalQuestions) * 100 : 0;
    
    // Calculate delta and previous net between latest and previous exam
    let delta = null;
    let prevNet = null;
    if (latestExam && previousExam) {
      const latestR = latestExam.results[topic.key] || { correct: 0, wrong: 0 };
      const prevR = previousExam.results[topic.key] || { correct: 0, wrong: 0 };
      const latestNetVal = calculateNet(latestR.correct, latestR.wrong);
      const prevNetVal = calculateNet(prevR.correct, prevR.wrong);
      delta = latestNetVal - prevNetVal;
      prevNet = prevNetVal;
    }
    
    return {
      ...topic,
      totalCorrect,
      totalWrong,
      totalBlank,
      totalQuestions,
      net,
      delta,
      prevNet,
      successRate: Math.max(0, parseFloat(successRate.toFixed(1)))
    };
  });
  
  return topicStats.sort((a, b) => b.successRate - a.successRate);
}

function validateExamJson(data) {
  if (!data || typeof data !== 'object') return 'Geçersiz JSON yapısı.';
  if (!data.date || !data.results || data.totalNet === undefined) {
    return 'JSON formatı hatalı. "date", "results" ve "totalNet" alanları gerekli.';
  }
  if (typeof data.results !== 'object') return '"results" alanı geçersiz.';
  return null;
}

export default function TeacherDashboard({ activeTab }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  // Load exams from IndexedDB
  const fetchExams = async () => {
    try {
      const data = await db.exams.toArray();
      setExams(data);
    } catch (err) {
      console.error('Error loading exams from IndexedDB:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleImport = async () => {
    setImportError('');
    setImportSuccess(false);

    let parsed;
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      setImportError('Geçersiz JSON. Lütfen doğru formatı yapıştırın.');
      return;
    }

    const error = validateExamJson(parsed);
    if (error) {
      setImportError(error);
      return;
    }

    // Check for duplicate
    const isDuplicate = exams.some(
      (e) => e.date === parsed.date && Math.abs(e.totalNet - parsed.totalNet) < 0.01
    );
    if (isDuplicate) {
      setImportError('Bu sınav zaten eklenmiş görünüyor.');
      return;
    }

    // Save to IndexedDB with createdAt timestamp
    try {
      await db.exams.add({
        date: parsed.date,
        student: parsed.student || 'Öğrenci',
        results: parsed.results,
        totalNet: parsed.totalNet,
        createdAt: new Date().toISOString(),
      });
      await fetchExams();
      setJsonInput('');
      setImportSuccess(true);
      setTimeout(() => {
        setImportSuccess(false);
        setShowImport(false);
      }, 1500);
    } catch (err) {
      console.error('Error saving to IndexedDB:', err);
      setImportError('Kayıt sırasında bir hata oluştu.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu sınavı silmek istediğinize emin misiniz?')) return;
    try {
      await db.exams.delete(id);
      await fetchExams();
    } catch (err) {
      console.error('Error deleting from IndexedDB:', err);
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  // Stats tab
  if (activeTab === 'stats') {
    const stats = calculateStats(exams);
    const topicStats = calculateTopicStatsList(exams);
    const strengths = topicStats.slice(0, 3).filter(t => t.successRate > 0);
    const weaknesses = [...topicStats].sort((a, b) => a.successRate - b.successRate);
    const mostBlanks = [...topicStats].filter(t => t.totalBlank > 0).sort((a, b) => b.totalBlank - a.totalBlank);

    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2><TrendingUp size={22} className="icon" /> Öğrenci — Gelişim Durumu</h2>
        </div>

        {exams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><BarChart3 size={28} /></div>
            <p>Henüz veri yok.</p>
            <p className="empty-hint">Öğrenci sınav sonuçlarını ekledikten sonra grafik burada görünecek.</p>
          </div>
        ) : (
          <>
            <motion.div
              className="stats-grid"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="stat-card">
                <div className="stat-icon blue"><ClipboardList size={20} /></div>
                <div className="stat-info">
                  <span className="stat-label">Toplam Sınav</span>
                  <span className="stat-value">{stats.count}</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon green"><Target size={20} /></div>
                <div className="stat-info">
                  <span className="stat-label">Ortalama Net</span>
                  <span className="stat-value">{stats.avgNet}</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon yellow"><Award size={20} /></div>
                <div className="stat-info">
                  <span className="stat-label">En Yüksek</span>
                  <span className="stat-value">{stats.bestNet}</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon red"><AlertCircle size={20} /></div>
                <div className="stat-info">
                  <span className="stat-label">Son Sınav</span>
                  <span className="stat-value">{stats.lastNet}</span>
                </div>
              </div>
            </motion.div>

            {/* Strengths, Weaknesses, and Blanks */}
            <div className="analysis-grid three-cols">
              <div className="analysis-card strengths">
                <h3 className="analysis-title"><Award size={18} /> En Güçlü Konular</h3>
                {strengths.length > 0 ? strengths.map(t => (
                  <div key={t.key} className="analysis-item">
                    <span className="analysis-name">{t.enLabel}</span>
                    <span className="analysis-val positive">%{t.successRate}</span>
                  </div>
                )) : <div className="analysis-item"><span className="text-muted">Yeterli veri yok</span></div>}
              </div>

              <div className="analysis-card weaknesses">
                <h3 className="analysis-title"><AlertTriangle size={18} /> Geliştirilmesi Gerekenler</h3>
                <div className="weakness-list">
                  {weaknesses.slice(0, 5).map(t => (
                    <div key={t.key} className="weakness-badge-item">
                      <span className="w-name">{t.enLabel}</span>
                      <div className="w-stats">
                        <span className="w-percent">%{t.successRate}</span>
                        <AlertCircle size={14} className="text-red-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analysis-card blanks">
                <h3 className="analysis-title info"><CircleDashed size={18} /> Çok Boş Bırakılanlar</h3>
                {mostBlanks.length > 0 ? mostBlanks.slice(0, 5).map(t => (
                  <div key={t.key} className="analysis-item">
                    <span className="analysis-name">{t.enLabel}</span>
                    <span className="analysis-val info">{t.totalBlank} Boş</span>
                  </div>
                )) : <div className="analysis-item"><span className="text-muted">Tüm sorular yanıtlanmış</span></div>}
              </div>
            </div>

            <div className="chart-section">
              <h3><TrendingUp size={18} className="icon" /> Net Puan Gelişimi</h3>
              <NetChart exams={exams} />
            </div>

            {/* Topic Mastery */}
            <div className="mastery-section">
              <h3><Target size={18} className="icon" /> Konu Bazlı Başarı (Tüm Sınavlar)</h3>
              <div className="mastery-list">
                {topicStats.map(t => {
                  let barColor = 'var(--danger)';
                  if (t.totalCorrect === 0 && t.totalWrong === 0) barColor = 'var(--accent)';
                  else if (t.successRate >= 70) barColor = 'var(--success)';
                  else if (t.successRate >= 40) barColor = 'var(--warning)';

                  return (
                    <div key={t.key} className="mastery-item relative">
                      <div className="mastery-header">
                        <div className="mastery-title-area">
                          <span className="mastery-label">{t.enLabel}</span>
                          <span className="mastery-q-badge mt-1">{t.totalQuestions} Soru</span>
                          
                          {/* Delta Indicator: ↑ emerald, ↓ red, → yellow */}
                          {t.delta !== null && (
                            <span className={`delta-indicator absolute top-4 right-4 ${t.delta > 0 ? 'text-emerald-400' : t.delta < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                              {t.delta > 0 ? '↑' : t.delta < 0 ? '↓' : '→'} {t.delta > 0 ? '+' : ''}{t.delta.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span className="mastery-percent" style={{ color: barColor }}>%{t.successRate}</span>
                      </div>
                      <div className="mastery-bar-bg">
                        <motion.div 
                          className="mastery-bar-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${t.successRate}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          style={{ backgroundColor: barColor }}
                        />
                      </div>
                      <div className="mastery-details">
                        <div className="md-stat">
                          <span className="md-val success">{t.totalCorrect}</span>
                          <span className="md-label">Doğru</span>
                        </div>
                        <div className="md-stat">
                          <span className="md-val danger">{t.totalWrong}</span>
                          <span className="md-label">Yanlış</span>
                        </div>
                        <div className="md-stat text-center">
                          <span className="md-val info">{t.totalBlank}</span>
                          <span className="md-label">Boş</span>
                        </div>
                        
                        <div className="md-divider"></div>

                        {t.prevNet !== null && (
                          <>
                            <div className="md-stat">
                              <span className="md-val text-slate-400">{t.prevNet.toFixed(2)}</span>
                              <span className="md-label">Önceki</span>
                            </div>
                            <div className="md-divider"></div>
                          </>
                        )}

                        <div className="md-stat highlight">
                          <span className="md-val">{t.net.toFixed(2)}</span>
                          <span className="md-label">Net</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Home tab — exam list + import
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2><ClipboardList size={22} className="icon" /> Zeynep'in Sınavları</h2>
        <button
          className={showImport ? 'btn-secondary' : 'btn-primary'}
          onClick={() => { setShowImport(!showImport); setImportError(''); setImportSuccess(false); }}
        >
          {showImport ? <><X size={16} /> İptal</> : <><Plus size={16} /> Sınav Ekle</>}
        </button>
      </div>

      {showImport && (
        <motion.div
          className="import-section"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.25 }}
          style={{ overflow: 'hidden' }}
        >
          <div className="import-card">
            <h3><ClipboardPaste size={18} className="icon" /> JSON İçe Aktar</h3>
            <p className="import-hint">Öğrenciden aldığınız JSON kodunu aşağıya yapıştırın.</p>
            <textarea
              className="json-textarea"
              value={jsonInput}
              onChange={(e) => { setJsonInput(e.target.value); setImportError(''); }}
              placeholder='{"date":"2026-03-26","student":"Zeynep","results":{...},"totalNet":45.5}'
              rows={6}
            />
            {importError && (
              <div className="error-item">
                <AlertTriangle size={14} /> {importError}
              </div>
            )}
            {importSuccess && (
              <motion.div
                className="success-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                ✓ Sınav başarıyla eklendi!
              </motion.div>
            )}
            <button className="btn-primary" onClick={handleImport} style={{ marginTop: '0.75rem' }}>
              <Plus size={16} /> Ekle
            </button>
          </div>
        </motion.div>
      )}

      {exams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><ClipboardList size={28} /></div>
          <p>Henüz sınav eklenmemiş.</p>
          <p className="empty-hint">"Sınav Ekle" butonuyla öğrenciden gelen JSON'ı yapıştırın.</p>
        </div>
      ) : (
        <ExamTable exams={exams} allowDelete onDelete={handleDelete} />
      )}
    </div>
  );
}
