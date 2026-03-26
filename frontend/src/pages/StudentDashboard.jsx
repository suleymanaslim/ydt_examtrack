// frontend/src/pages/StudentDashboard.jsx
// Student: fill form → see result card (screenshot-friendly) + copyable JSON

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileEdit, Copy, Check, RotateCcw, ClipboardList } from 'lucide-react';
import { TOPICS } from '../constants/topics';

const initialResults = () =>
  Object.fromEntries(TOPICS.map((t) => [t.key, { correct: 0, wrong: 0 }]));

function calculateNet(correct, wrong) {
  return correct - wrong / 4;
}

export default function StudentDashboard() {
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [results, setResults] = useState(initialResults());
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (topicKey, field, value) => {
    const topic = TOPICS.find((t) => t.key === topicKey);
    const max = topic.maxQuestions;
    let numValue = value === '' ? 0 : Math.max(0, parseInt(value, 10) || 0);

    // Clamp to max questions for this topic
    numValue = Math.min(numValue, max);

    // Ensure correct + wrong doesn't exceed maxQuestions
    const other = field === 'correct' ? 'wrong' : 'correct';
    const otherValue = results[topicKey][other];
    if (numValue + otherValue > max) {
      numValue = max - otherValue;
    }

    setResults((prev) => ({
      ...prev,
      [topicKey]: { ...prev[topicKey], [field]: numValue },
    }));
    setErrors((prev) => ({ ...prev, [topicKey]: undefined }));
  };

  const getTotalNet = () =>
    TOPICS.reduce((sum, t) => sum + calculateNet(results[t.key].correct, results[t.key].wrong), 0);

  const getTotalCorrect = () =>
    TOPICS.reduce((sum, t) => sum + results[t.key].correct, 0);

  const getTotalWrong = () =>
    TOPICS.reduce((sum, t) => sum + results[t.key].wrong, 0);

  const validate = () => {
    const newErrors = {};
    let valid = true;
    TOPICS.forEach((topic) => {
      const r = results[topic.key];
      if (r.correct + r.wrong > topic.maxQuestions) {
        newErrors[topic.key] = `Doğru + Yanlış toplamı ${topic.maxQuestions} soruyu geçemez.`;
        valid = false;
      }
    });
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setResults(initialResults());
    setExamDate(new Date().toISOString().split('T')[0]);
    setErrors({});
    setSubmitted(false);
    setCopied(false);
  };

  const totalNet = getTotalNet();
  const totalCorrect = getTotalCorrect();
  const totalWrong = getTotalWrong();

  // Build JSON output
  const jsonOutput = JSON.stringify({
    date: examDate,
    student: 'Zeynep',
    results,
    totalNet: parseFloat(totalNet.toFixed(2)),
  }, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = jsonOutput;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // After submission: show result card + JSON
  if (submitted) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2><ClipboardList size={22} className="icon" /> Sınav Sonucu</h2>
          <button className="btn-secondary" onClick={handleReset}>
            <RotateCcw size={16} /> Yeni Sınav
          </button>
        </div>

        {/* Screenshot-friendly result card */}
        <motion.div
          className="result-card"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="result-card-header">
            <div>
              <div className="result-card-title">YDT Sınav Sonucu</div>
              <div className="result-card-student">Zeynep — {new Date(examDate + 'T00:00:00').toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            </div>
            <div className={`result-card-total ${totalNet >= 0 ? 'positive' : 'negative'}`}>
              {totalNet.toFixed(2)}
              <span className="result-card-total-label">Net</span>
            </div>
          </div>

          <div className="result-card-summary">
            <div className="result-summary-item">
              <span className="result-summary-label">Doğru</span>
              <span className="result-summary-value positive">{totalCorrect}</span>
            </div>
            <div className="result-summary-item">
              <span className="result-summary-label">Yanlış</span>
              <span className="result-summary-value negative">{totalWrong}</span>
            </div>
            <div className="result-summary-item">
              <span className="result-summary-label">Boş</span>
              <span className="result-summary-value">{80 - totalCorrect - totalWrong}</span>
            </div>
          </div>

          <table className="result-table">
            <thead>
              <tr>
                <th>Konu</th>
                <th>D</th>
                <th>Y</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              {TOPICS.map((topic) => {
                const r = results[topic.key];
                const net = calculateNet(r.correct, r.wrong);
                return (
                  <tr key={topic.key}>
                    <td>{topic.label}</td>
                    <td className="positive">{r.correct}</td>
                    <td className="negative">{r.wrong}</td>
                    <td className={`net-value ${net > 0 ? 'positive' : net < 0 ? 'negative' : ''}`}>
                      {net.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>

        {/* JSON output */}
        <motion.div
          className="json-section"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <div className="json-header">
            <h3>Öğretmene Gönder</h3>
            <button className={`btn-copy ${copied ? 'copied' : ''}`} onClick={handleCopy}>
              {copied ? <><Check size={14} /> Kopyalandı!</> : <><Copy size={14} /> JSON Kopyala</>}
            </button>
          </div>
          <p className="json-hint">Aşağıdaki kodu kopyalayıp öğretmeninize gönderin.</p>
          <textarea
            className="json-textarea"
            value={jsonOutput}
            readOnly
            rows={10}
            onClick={(e) => e.target.select()}
          />
        </motion.div>
      </div>
    );
  }

  // Form view
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2><FileEdit size={22} className="icon" /> Sınav Sonucu Gir</h2>
      </div>

      <form onSubmit={handleSubmit} className="exam-form">
        <div className="form-header">
          <div className="date-input-group">
            <label htmlFor="examDate">Sınav Tarihi</label>
            <input
              id="examDate"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="topics-table-wrapper">
          <table className="topics-table">
            <thead>
              <tr>
                <th>Konu</th>
                <th>Max</th>
                <th>Doğru</th>
                <th>Yanlış</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              {TOPICS.map((topic) => {
                const r = results[topic.key];
                const net = calculateNet(r.correct, r.wrong);
                const hasError = !!errors[topic.key];
                return (
                  <tr key={topic.key} className={hasError ? 'row-error' : ''}>
                    <td className="topic-label">{topic.label}</td>
                    <td className="topic-max">{topic.maxQuestions}</td>
                    <td>
                      <input type="number" min="0" max={topic.maxQuestions}
                        value={r.correct || ''} onChange={(e) => handleChange(topic.key, 'correct', e.target.value)}
                        placeholder="0" className="number-input" />
                    </td>
                    <td>
                      <input type="number" min="0" max={topic.maxQuestions}
                        value={r.wrong || ''} onChange={(e) => handleChange(topic.key, 'wrong', e.target.value)}
                        placeholder="0" className="number-input" />
                    </td>
                    <td className={`net-value ${net > 0 ? 'positive' : net < 0 ? 'negative' : ''}`}>
                      {net.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td><strong>TOPLAM</strong></td>
                <td><strong>80</strong></td>
                <td><strong>{totalCorrect}</strong></td>
                <td><strong>{totalWrong}</strong></td>
                <td className={`net-value total-net ${totalNet > 0 ? 'positive' : totalNet < 0 ? 'negative' : ''}`}>
                  <strong>{totalNet.toFixed(2)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="topics-mobile">
          {TOPICS.map((topic) => {
            const r = results[topic.key];
            const net = calculateNet(r.correct, r.wrong);
            const hasError = !!errors[topic.key];
            return (
              <div key={topic.key} className={`topic-card ${hasError ? 'row-error' : ''}`}>
                <div className="topic-card-header">
                  <span className="topic-name">{topic.label}</span>
                  <span className="topic-info">{topic.maxQuestions} soru</span>
                </div>
                <div className="topic-card-inputs">
                  <div className="field">
                    <label>Doğru</label>
                    <input type="number" min="0" max={topic.maxQuestions}
                      value={r.correct || ''} onChange={(e) => handleChange(topic.key, 'correct', e.target.value)}
                      placeholder="0" className="number-input" />
                  </div>
                  <div className="field">
                    <label>Yanlış</label>
                    <input type="number" min="0" max={topic.maxQuestions}
                      value={r.wrong || ''} onChange={(e) => handleChange(topic.key, 'wrong', e.target.value)}
                      placeholder="0" className="number-input" />
                  </div>
                  <div className="topic-card-net">
                    <span className="net-label">Net</span>
                    <div className={`net-val ${net > 0 ? 'positive' : net < 0 ? 'negative' : ''}`}>
                      {net.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="mobile-total">
            <div className="mobile-total-label">Toplam Net</div>
            <div className={`mobile-total-net ${totalNet > 0 ? 'positive' : totalNet < 0 ? 'negative' : ''}`}>
              {totalNet.toFixed(2)}
            </div>
            <div className="mobile-total-row">
              <span className="mobile-total-item">Doğru: <strong>{totalCorrect}</strong></span>
              <span className="mobile-total-item">Yanlış: <strong>{totalWrong}</strong></span>
            </div>
          </div>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="form-errors">
            {Object.entries(errors).map(([key, msg]) => {
              const topic = TOPICS.find((t) => t.key === key);
              return (
                <div key={key} className="error-item">
                  <strong>{topic?.label}:</strong> {msg}
                </div>
              );
            })}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary full-width">
            <ClipboardList size={16} /> Sonucu Göster
          </button>
        </div>
      </form>
    </div>
  );
}
