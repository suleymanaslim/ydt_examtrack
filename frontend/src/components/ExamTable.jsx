// frontend/src/components/ExamTable.jsx
// Displays exam list — desktop table + mobile cards (JSON-based data)

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Trash2, Eye, EyeOff } from 'lucide-react';
import { TOPICS } from '../constants/topics';

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function calculateNet(correct, wrong) {
  return correct - wrong / 4;
}

export default function ExamTable({ exams, allowDelete, onDelete }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Sort by date descending
  const sorted = [...exams].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      {/* Desktop Table */}
      <div className="exam-table-container">
        <table className="exam-table">
          <thead>
            <tr>
              <th></th>
              <th>Tarih</th>
              <th>Doğru</th>
              <th>Yanlış</th>
              <th>Net</th>
              {allowDelete && <th>İşlem</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((exam) => {
              const isExpanded = expandedId === exam.id;
              const results = exam.results || {};
              const totalCorrect = TOPICS.reduce((s, t) => s + (results[t.key]?.correct || 0), 0);
              const totalWrong = TOPICS.reduce((s, t) => s + (results[t.key]?.wrong || 0), 0);
              const net = Number(exam.totalNet);

              return (
                <tr key={exam.id} className="exam-row-group">
                  <td colSpan={allowDelete ? 6 : 5} style={{ padding: 0 }}>
                    <table className="exam-inner-table" style={{ width: '100%' }}>
                      <tbody>
                        <tr
                          className={`exam-row clickable ${isExpanded ? 'expanded' : ''}`}
                          onClick={() => toggleExpand(exam.id)}
                        >
                          <td className="expand-icon">
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </td>
                          <td>{formatDate(exam.date)}</td>
                          <td>{totalCorrect}</td>
                          <td>{totalWrong}</td>
                          <td className={`net-value ${net > 0 ? 'positive' : net < 0 ? 'negative' : ''}`}>
                            {net.toFixed(2)}
                          </td>
                          {allowDelete && (
                            <td>
                              <button
                                className="btn-danger btn-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(exam.id);
                                }}
                              >
                                <Trash2 size={13} /> Sil
                              </button>
                            </td>
                          )}
                        </tr>
                        <AnimatePresence>
                          {isExpanded && (
                            <tr className="detail-row">
                              <td colSpan={allowDelete ? 6 : 5}>
                                <motion.div
                                  className="detail-content"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <table className="detail-table">
                                    <thead>
                                      <tr>
                                        <th>Konu</th>
                                        <th>Soru</th>
                                        <th>Doğru</th>
                                        <th>Yanlış</th>
                                        <th>Boş</th>
                                        <th>Net</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {TOPICS.map((topic) => {
                                        const r = results[topic.key] || { correct: 0, wrong: 0 };
                                        const topicNet = calculateNet(r.correct, r.wrong);
                                        const blank = topic.maxQuestions - r.correct - r.wrong;
                                        return (
                                          <tr key={topic.key}>
                                            <td>{topic.label}</td>
                                            <td className="topic-max">{topic.maxQuestions}</td>
                                            <td className="positive">{r.correct}</td>
                                            <td className="negative">{r.wrong}</td>
                                            <td className="blank">{blank}</td>
                                            <td className={`net-value ${topicNet > 0 ? 'positive' : topicNet < 0 ? 'negative' : ''}`}>
                                              {topicNet.toFixed(2)}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="exam-mobile-cards">
        {sorted.map((exam) => {
          const isExpanded = expandedId === exam.id;
          const results = exam.results || {};
          const totalCorrect = TOPICS.reduce((s, t) => s + (results[t.key]?.correct || 0), 0);
          const totalWrong = TOPICS.reduce((s, t) => s + (results[t.key]?.wrong || 0), 0);
          const net = Number(exam.totalNet);

          return (
            <motion.div
              key={exam.id}
              className="exam-mobile-card"
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="exam-mobile-card-header">
                <span className="exam-mobile-date">{formatDate(exam.date)}</span>
                <span className={`exam-mobile-net net-value ${net > 0 ? 'positive' : net < 0 ? 'negative' : ''}`}>
                  {net.toFixed(2)}
                </span>
              </div>

              <div className="exam-mobile-stats">
                <span>Doğru: <strong>{totalCorrect}</strong></span>
                <span>Yanlış: <strong>{totalWrong}</strong></span>
                <span>Boş: <strong>{80 - totalCorrect - totalWrong}</strong></span>
              </div>

              <div className="exam-mobile-actions">
                <button className="exam-mobile-toggle" onClick={() => toggleExpand(exam.id)}>
                  {isExpanded ? <><EyeOff size={14} /> Gizle</> : <><Eye size={14} /> Detay</>}
                </button>
                {allowDelete && (
                  <button className="btn-danger btn-sm" onClick={() => onDelete(exam.id)}>
                    <Trash2 size={13} /> Sil
                  </button>
                )}
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    className="exam-mobile-detail"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {TOPICS.map((topic) => {
                      const r = results[topic.key] || { correct: 0, wrong: 0 };
                      const topicNet = calculateNet(r.correct, r.wrong);
                      const blank = topic.maxQuestions - r.correct - r.wrong;
                      return (
                        <div key={topic.key} className="exam-mobile-detail-row">
                          <span className="detail-topic-name">{topic.label} <span className="detail-topic-max">({topic.maxQuestions} soru)</span></span>
                          <span className="detail-topic-stats">
                            <span className="positive">{r.correct}D</span>{' / '}
                            <span className="negative">{r.wrong}Y</span>{' / '}
                            <span className="blank">{blank}B</span>
                            {' → '}
                            <span className={`net-value ${topicNet > 0 ? 'positive' : topicNet < 0 ? 'negative' : ''}`}>
                              {topicNet.toFixed(2)}
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
