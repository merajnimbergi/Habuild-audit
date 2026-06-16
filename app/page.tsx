'use client';

import { useState, FormEvent } from 'react';
import styles from './page.module.css';

const AUDITORS = ['Pooja', 'Prince', 'Shyam', 'Khushbu', 'Safreen'];
const CATEGORIES = ['Enquiries', 'Payment', 'Session', 'Refund', 'Technical', 'Link Issue', 'Physio Feedback', 'Other'];
const SUB_CATEGORIES = ['Guidance', 'Refund', 'Batch Info', 'Account', 'Session Details', 'Other'];

export default function AuditForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    call_date: new Date().toISOString().split('T')[0],
    audit_date: new Date().toISOString().split('T')[0],
    auditor: '',
    agent: '',
    phone_number: '',
    category: '',
    sub_category: '',
    opening: 3,
    accuracy: 3,
    listening: 3,
    tone: 3,
    knowledge: 3,
    response_time: 3,
    fcr: 3,
    csat_feedback: 'Asked',
    call_summary: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.startsWith('opening') || name.startsWith('accuracy') ||
               name.startsWith('listening') || name.startsWith('tone') ||
               name.startsWith('knowledge') || name.startsWith('response') ||
               name.startsWith('fcr') ? parseFloat(value) || 0 : value
    }));
  };

  const calculateAverage = () => {
    const scores = [
      formData.opening,
      formData.accuracy,
      formData.listening,
      formData.tone,
      formData.knowledge,
      formData.response_time,
      formData.fcr,
    ];
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return avg.toFixed(2);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit audit');
      }

      setSuccess(true);
      setFormData({
        call_date: new Date().toISOString().split('T')[0],
        audit_date: new Date().toISOString().split('T')[0],
        auditor: '',
        agent: '',
        phone_number: '',
        category: '',
        sub_category: '',
        opening: 3,
        accuracy: 3,
        listening: 3,
        tone: 3,
        knowledge: 3,
        response_time: 3,
        fcr: 3,
        csat_feedback: 'Asked',
        call_summary: '',
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const average = calculateAverage();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 className={styles.title}>📞 Call Audit Entry</h1>
            <p className={styles.subtitle}>Quick call quality audit form</p>
          </div>
          <a href="/dashboard" style={{ color: '#D4AF37', textDecoration: 'none', fontSize: '1rem', fontWeight: 'bold' }}>
            👤 View Feedback
          </a>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Row 1: Dates */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Call Date</label>
              <input
                type="date"
                name="call_date"
                value={formData.call_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Audit Date</label>
              <input
                type="date"
                name="audit_date"
                value={formData.audit_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2: Auditor & Agent */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Auditor *</label>
              <select
                name="auditor"
                value={formData.auditor}
                onChange={handleChange}
                required
              >
                <option value="">Select auditor...</option>
                {AUDITORS.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>Agent Name *</label>
              <input
                type="text"
                name="agent"
                value={formData.agent}
                onChange={handleChange}
                placeholder="Agent name"
                required
              />
            </div>
          </div>

          {/* Row 3: Phone & Category */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Customer phone"
              />
            </div>
            <div className={styles.field}>
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Sub-category */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Sub-Category</label>
              <select
                name="sub_category"
                value={formData.sub_category}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                {SUB_CATEGORIES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>CSAT Feedback</label>
              <select
                name="csat_feedback"
                value={formData.csat_feedback}
                onChange={handleChange}
              >
                <option value="Asked">Asked</option>
                <option value="Not asked">Not asked</option>
              </select>
            </div>
          </div>

          {/* Quality Metrics - 7 point scale */}
          <div className={styles.metricsSection}>
            <h3>Quality Metrics (1-5 scale)</h3>
            <div className={styles.metricsGrid}>
              {[
                ['opening', 'Opening'],
                ['accuracy', 'Accuracy'],
                ['listening', 'Listening'],
                ['tone', 'Tone & Manner'],
                ['knowledge', 'Knowledge'],
                ['response_time', 'Response Time'],
                ['fcr', 'FCR'],
              ].map(([key, label]) => (
                <div key={key} className={styles.metric}>
                  <label>{label}</label>
                  <input
                    type="number"
                    name={key}
                    min="1"
                    max="5"
                    value={formData[key as keyof typeof formData]}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Average Score Display */}
          <div className={styles.averageBox}>
            <span>Average Score:</span>
            <strong>{average}</strong>
          </div>

          {/* Call Summary */}
          <div className={styles.field}>
            <label>Call Summary / Notes</label>
            <textarea
              name="call_summary"
              value={formData.call_summary}
              onChange={handleChange}
              placeholder="Brief notes about the call..."
              rows={4}
            />
          </div>

          {/* Error & Success Messages */}
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>✓ Audit submitted successfully!</div>}

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Audit'}
          </button>
        </form>
      </div>
    </div>
  );
}
