import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

async function getFeedbackData() {
  try {
    const data = (await kv.get('habuild:feedback')) as any;
    return data || { feedback: [], nextId: 1 };
  } catch (error) {
    return { feedback: [], nextId: 1 };
  }
}

async function getAuditsData() {
  try {
    const data = (await kv.get('habuild:audits')) as any;
    return data || { audits: [], nextId: 1 };
  } catch (error) {
    return { audits: [], nextId: 1 };
  }
}

export async function GET(_request: NextRequest) {
  try {
    const data = await getFeedbackData();
    const auditsData = await getAuditsData();
    const feedback = data.feedback || [];
    const audits = auditsData.audits || [];

    // Calculate overall metrics
    const totalAudits = audits.length;
    const avgScore = feedback.length > 0
      ? (feedback.reduce((sum: number, f: any) => sum + (f.score || 0), 0) / feedback.length).toFixed(2)
      : '0.00';

    // Agent performance
    const agentMetrics: { [key: string]: any } = {};
    feedback.forEach((f: any) => {
      if (!agentMetrics[f.agent_name]) {
        agentMetrics[f.agent_name] = {
          name: f.agent_name,
          phone: f.agent_phone,
          totalFeedback: 0,
          avgScore: 0,
          scores: [],
          ratings: {
            opening: [],
            accuracy: [],
            listening: [],
            tone: [],
            knowledge: [],
            response_time: [],
            fcr: [],
          },
          categories: {},
        };
      }
      const agent = agentMetrics[f.agent_name];
      agent.totalFeedback++;
      agent.scores.push(f.score || 0);

      // Collect ratings
      if (f.ratings) {
        agent.ratings.opening.push(f.ratings.opening || 0);
        agent.ratings.accuracy.push(f.ratings.accuracy || 0);
        agent.ratings.listening.push(f.ratings.listening || 0);
        agent.ratings.tone.push(f.ratings.tone || 0);
        agent.ratings.knowledge.push(f.ratings.knowledge || 0);
        agent.ratings.response_time.push(f.ratings.response_time || 0);
        agent.ratings.fcr.push(f.ratings.fcr || 0);
      }

      // Category breakdown
      const category = f.category || 'Other';
      agent.categories[category] = (agent.categories[category] || 0) + 1;
    });

    // Calculate averages for each agent
    const agentList = Object.values(agentMetrics).map((agent: any) => ({
      ...agent,
      avgScore: agent.scores.length > 0
        ? (agent.scores.reduce((a: number, b: number) => a + b, 0) / agent.scores.length).toFixed(2)
        : '0.00',
      avgRatings: {
        opening: agent.ratings.opening.length > 0
          ? (agent.ratings.opening.reduce((a: number, b: number) => a + b, 0) / agent.ratings.opening.length).toFixed(2)
          : '0.00',
        accuracy: agent.ratings.accuracy.length > 0
          ? (agent.ratings.accuracy.reduce((a: number, b: number) => a + b, 0) / agent.ratings.accuracy.length).toFixed(2)
          : '0.00',
        listening: agent.ratings.listening.length > 0
          ? (agent.ratings.listening.reduce((a: number, b: number) => a + b, 0) / agent.ratings.listening.length).toFixed(2)
          : '0.00',
        tone: agent.ratings.tone.length > 0
          ? (agent.ratings.tone.reduce((a: number, b: number) => a + b, 0) / agent.ratings.tone.length).toFixed(2)
          : '0.00',
        knowledge: agent.ratings.knowledge.length > 0
          ? (agent.ratings.knowledge.reduce((a: number, b: number) => a + b, 0) / agent.ratings.knowledge.length).toFixed(2)
          : '0.00',
        response_time: agent.ratings.response_time.length > 0
          ? (agent.ratings.response_time.reduce((a: number, b: number) => a + b, 0) / agent.ratings.response_time.length).toFixed(2)
          : '0.00',
        fcr: agent.ratings.fcr.length > 0
          ? (agent.ratings.fcr.reduce((a: number, b: number) => a + b, 0) / agent.ratings.fcr.length).toFixed(2)
          : '0.00',
      },
    }));

    // Category breakdown
    const categoryMetrics: { [key: string]: number } = {};
    feedback.forEach((f: any) => {
      const category = f.category || 'Other';
      categoryMetrics[category] = (categoryMetrics[category] || 0) + 1;
    });

    // Auditor breakdown
    const auditorMetrics: { [key: string]: number } = {};
    audits.forEach((a: any) => {
      const auditor = a.auditor || 'Unknown';
      auditorMetrics[auditor] = (auditorMetrics[auditor] || 0) + 1;
    });

    // Rating distribution (1-5 scale)
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    feedback.forEach((f: any) => {
      const score = Math.round(parseFloat(f.score) || 0);
      if (score >= 1 && score <= 5) {
        ratingDistribution[score as keyof typeof ratingDistribution]++;
      }
    });

    return NextResponse.json(
      {
        totalAudits,
        totalFeedback: feedback.length,
        avgScore,
        agents: agentList.sort((a: any, b: any) => parseFloat(b.avgScore) - parseFloat(a.avgScore)),
        categories: categoryMetrics,
        auditors: auditorMetrics,
        ratingDistribution,
        lastUpdated: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
