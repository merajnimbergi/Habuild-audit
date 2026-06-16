'use client';

import { useState, useEffect } from 'react';
import styles from './analytics.module.css';

interface AgentMetrics {
  name: string;
  phone: string;
  totalFeedback: number;
  avgScore: string;
  categories: { [key: string]: number };
  avgRatings: {
    opening: string;
    accuracy: string;
    listening: string;
    tone: string;
    knowledge: string;
    response_time: string;
    fcr: string;
  };
}

interface AnalyticsData {
  totalAudits: number;
  totalFeedback: number;
  avgScore: string;
  agents: AgentMetrics[];
  categories: { [key: string]: number };
  auditors: { [key: string]: number };
  ratingDistribution: { [key: string]: number };
  lastUpdated: string;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className={styles.container}><div className={styles.loading}>Loading analytics...</div></div>;
  }

  if (error) {
    return <div className={styles.container}><div className={styles.error}>Error: {error}</div></div>;
  }

  if (!data) {
    return <div className={styles.container}><div className={styles.empty}>No analytics data available</div></div>;
  }

  const scoreColor = (score: string) => {
    const s = parseFloat(score);
    if (s >= 4.5) return '#1CC993';
    if (s >= 3.5) return '#1B9B8F';
    if (s >= 2.5) return '#E8964F';
    if (s >= 1.5) return '#D74E4E';
    return '#999';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📊 Call Quality Analytics Dashboard</h1>
        <p>Real-time performance metrics across all agents</p>
        <small>Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}</small>
      </div>

      {/* Overall Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Total Audits</div>
          <div className={styles.metricValue}>{data.totalAudits}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Total Feedback</div>
          <div className={styles.metricValue}>{data.totalFeedback}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Average Score</div>
          <div className={styles.metricValue} style={{ color: scoreColor(data.avgScore) }}>
            {data.avgScore}/5
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Active Agents</div>
          <div className={styles.metricValue}>{data.agents.length}</div>
        </div>
      </div>

      <div className={styles.gridContainer}>
        {/* Agent Performance */}
        <div className={styles.section}>
          <h2>👥 Agent Performance Rankings</h2>
          <div className={styles.agentTable}>
            <div className={styles.tableHeader}>
              <div className={styles.col1}>Agent Name</div>
              <div className={styles.col2}>Feedback Count</div>
              <div className={styles.col3}>Avg Score</div>
              <div className={styles.col4}>Phone</div>
            </div>
            {data.agents.map((agent) => (
              <div key={agent.name} className={styles.tableRow}>
                <div className={styles.col1}>{agent.name}</div>
                <div className={styles.col2}>{agent.totalFeedback}</div>
                <div className={styles.col3}>
                  <span style={{ color: scoreColor(agent.avgScore), fontWeight: 'bold' }}>
                    {agent.avgScore}
                  </span>
                </div>
                <div className={styles.col4}>{agent.phone || 'N/A'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className={styles.section}>
          <h2>📈 Rating Distribution</h2>
          <div className={styles.ratingChart}>
            {Object.entries(data.ratingDistribution).map(([rating, count]) => {
              const total = data.totalFeedback || 1;
              const percentage = (count / total) * 100;
              const colors = {
                '1': '#D74E4E',
                '2': '#E8964F',
                '3': '#F5A623',
                '4': '#0B6E63',
                '5': '#1CC993',
              };
              return (
                <div key={rating} className={styles.ratingBar}>
                  <div className={styles.ratingLabel}>
                    <strong>{rating}</strong> Star
                  </div>
                  <div className={styles.barContainer}>
                    <div
                      className={styles.bar}
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: colors[rating as keyof typeof colors],
                      }}
                    />
                  </div>
                  <div className={styles.ratingCount}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.gridContainer}>
        {/* Categories */}
        <div className={styles.section}>
          <h2>📂 Call Categories</h2>
          <div className={styles.categoryList}>
            {Object.entries(data.categories).map(([category, count]) => (
              <div key={category} className={styles.categoryItem}>
                <span>{category}</span>
                <span className={styles.badge}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Auditors */}
        <div className={styles.section}>
          <h2>🔍 Auditor Activity</h2>
          <div className={styles.categoryList}>
            {Object.entries(data.auditors).map(([auditor, count]) => (
              <div key={auditor} className={styles.categoryItem}>
                <span>{auditor}</span>
                <span className={styles.badge}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Agent Ratings */}
      <div className={styles.section}>
        <h2>⭐ Detailed Parameter Ratings by Agent</h2>
        <div className={styles.detailedRatingsTable}>
          <div className={styles.tableHeader}>
            <div className={styles.agentCol}>Agent</div>
            <div className={styles.ratingCol}>Opening</div>
            <div className={styles.ratingCol}>Accuracy</div>
            <div className={styles.ratingCol}>Listening</div>
            <div className={styles.ratingCol}>Tone</div>
            <div className={styles.ratingCol}>Knowledge</div>
            <div className={styles.ratingCol}>Response Time</div>
            <div className={styles.ratingCol}>FCR</div>
          </div>
          {data.agents.map((agent) => (
            <div key={agent.name} className={styles.tableRow}>
              <div className={styles.agentCol}>{agent.name}</div>
              <div className={styles.ratingCol}>{agent.avgRatings.opening}</div>
              <div className={styles.ratingCol}>{agent.avgRatings.accuracy}</div>
              <div className={styles.ratingCol}>{agent.avgRatings.listening}</div>
              <div className={styles.ratingCol}>{agent.avgRatings.tone}</div>
              <div className={styles.ratingCol}>{agent.avgRatings.knowledge}</div>
              <div className={styles.ratingCol}>{agent.avgRatings.response_time}</div>
              <div className={styles.ratingCol}>{agent.avgRatings.fcr}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
