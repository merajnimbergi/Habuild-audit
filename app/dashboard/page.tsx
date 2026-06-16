'use client';

import { useState, useEffect } from 'react';
import styles from './dashboard.module.css';

interface Feedback {
  id: number;
  audit_id: number;
  agent_name: string;
  auditor_name: string;
  category: string;
  score: number;
  feedback: string;
  call_date: string;
  created_at: string;
  agent_viewed: boolean;
  delivery_status: string;
  delivery_channels: string[];
}

export default function Dashboard() {
  const [inputName, setInputName] = useState('');
  const [agentName, setAgentName] = useState('');
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAgentName('');
    setInputName('');
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  useEffect(() => {
    if (agentName && feedback.length > 0) {
      fetchFeedback();
    }
  }, [filter]);

  const handleLogin = () => {
    if (inputName.trim()) {
      setAgentName(inputName);
      fetchFeedback(inputName);
    }
  };

  const fetchFeedback = async (name?: string) => {
    const agentToFetch = name || agentName;
    setLoading(true);
    try {
      const url = new URL('/api/feedback', window.location.origin);
      url.searchParams.set('agent_name', agentToFetch);
      if (filter !== 'all') {
        url.searchParams.set('status', filter === 'pending' ? 'pending' : 'viewed');
      }

      const response = await fetch(url);
      const data = await response.json();
      setFeedback(data.feedback || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsViewed = async (feedbackId: number) => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback_id: feedbackId,
          action: 'mark_viewed',
        }),
      });

      if (response.ok) {
        setFeedback(
          feedback.map(f =>
            f.id === feedbackId ? { ...f, agent_viewed: true } : f
          )
        );
      }
    } catch (error) {
      console.error('Error marking as viewed:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return '#4CAF50'; // Green
    if (score >= 3.5) return '#FFC107'; // Amber
    if (score >= 2.5) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📋 My Audit Feedback</h1>
        <p>View feedback from your calls</p>
      </div>

      {!agentName ? (
        <div className={styles.loginCard}>
          <h2>Welcome</h2>
          <p>Enter your name to view your feedback</p>
          <input
            type="text"
            placeholder="Enter your name..."
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && inputName && handleLogin()}
            className={styles.input}
          />
          <button
            onClick={handleLogin}
            className={styles.button}
            disabled={!inputName.trim()}
          >
            View My Feedback
          </button>
        </div>
      ) : (
        <>
          <div className={styles.toolbar}>
            <div className={styles.agentInfo}>
              <h2>👤 {agentName}</h2>
              <button
                onClick={() => {
                  setAgentName('');
                  setInputName('');
                  setFeedback([]);
                  setFilter('all');
                  localStorage.clear();
                  sessionStorage.clear();
                }}
                className={styles.logoutBtn}
              >
                Logout
              </button>
            </div>

            <div className={styles.filters}>
              <button
                className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({feedback.length})
              </button>
              <button
                className={`${styles.filterBtn} ${filter === 'pending' ? styles.active : ''}`}
                onClick={() => setFilter('pending')}
              >
                New (
                {feedback.filter(f => !f.agent_viewed).length})
              </button>
              <button
                className={`${styles.filterBtn} ${filter === 'viewed' ? styles.active : ''}`}
                onClick={() => setFilter('viewed')}
              >
                Reviewed (
                {feedback.filter(f => f.agent_viewed).length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading feedback...</div>
          ) : feedback.length === 0 ? (
            <div className={styles.empty}>
              <p>No feedback to display</p>
            </div>
          ) : (
            <div className={styles.feedbackList}>
              {feedback.map(f => (
                <div
                  key={f.id}
                  className={`${styles.feedbackCard} ${!f.agent_viewed ? styles.unviewed : ''}`}
                >
                  {!f.agent_viewed && <div className={styles.newBadge}>NEW</div>}

                  <div className={styles.cardHeader}>
                    <div className={styles.scoreBox} style={{ borderColor: getScoreColor(f.score) }}>
                      <div className={styles.score} style={{ color: getScoreColor(f.score) }}>
                        {f.score.toFixed(1)}
                      </div>
                      <div className={styles.scoreLabel}>Score</div>
                    </div>

                    <div className={styles.headerInfo}>
                      <h3>{f.category}</h3>
                      <p className={styles.auditor}>Audited by: {f.auditor_name}</p>
                      <p className={styles.date}>
                        Call: {new Date(f.call_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className={styles.feedback}>
                    <h4>Feedback:</h4>
                    <p>{f.feedback || 'No specific feedback provided'}</p>
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.timestamp}>
                      {new Date(f.created_at).toLocaleDateString()} at{' '}
                      {new Date(f.created_at).toLocaleTimeString()}
                    </span>
                    {!f.agent_viewed && (
                      <button
                        className={styles.markViewedBtn}
                        onClick={() => markAsViewed(f.id)}
                      >
                        Mark as Reviewed
                      </button>
                    )}
                    {f.agent_viewed && (
                      <span className={styles.viewedBadge}>✓ Reviewed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
