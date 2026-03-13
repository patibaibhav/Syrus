/**
 * @module controllers/analyticsController
 * @description Handles progress analytics, risk scores, productivity estimates,
 * all-developer views (manager only), and onboarding report generation.
 */

const db = require('../config/database');
const riskService = require('../services/riskService');
const reportService = require('../services/reportService');

/**
 * GET /api/analytics/progress
 * Return task completion stats for the current user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getProgress(req, res) {
  try {
    const result = await db.query(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE status IN ('completed', 'verified')) AS completed,
         COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress,
         COUNT(*) FILTER (WHERE status = 'not_started') AS not_started
       FROM task_instances
       WHERE user_id = $1`,
      [req.user.id]
    );

    const stats = result.rows[0];
    const total = parseInt(stats.total) || 1;
    const completed = parseInt(stats.completed) || 0;
    const inProgress = parseInt(stats.in_progress) || 0;
    const notStarted = parseInt(stats.not_started) || 0;
    const percentComplete = parseFloat(((completed / total) * 100).toFixed(1));

    // Estimate completion date based on velocity
    const userResult = await db.query('SELECT created_at FROM users WHERE id = $1', [req.user.id]);
    const startDate = new Date(userResult.rows[0].created_at);
    const now = new Date();
    const daysElapsed = Math.max(1, (now - startDate) / (1000 * 60 * 60 * 24));
    const tasksPerDay = completed / daysElapsed;
    const remainingTasks = total - completed;
    const estimatedDaysRemaining = tasksPerDay > 0 ? Math.ceil(remainingTasks / tasksPerDay) : null;

    const estimatedCompletionDate = estimatedDaysRemaining
      ? new Date(now.getTime() + estimatedDaysRemaining * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : null;

    res.json({
      success: true,
      data: {
        total,
        completed,
        inProgress,
        notStarted,
        percentComplete,
        tasksPerDay: parseFloat(tasksPerDay.toFixed(2)),
        estimatedCompletionDate,
        estimatedDaysRemaining,
      },
      error: null,
    });
  } catch (err) {
    console.error('[AnalyticsController] Progress error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Failed to retrieve progress.' });
  }
}

/**
 * GET /api/analytics/risk
 * Return the current risk score and factors for the current user.
 * Recalculates the score on each request for freshness.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getRisk(req, res) {
  try {
    const riskData = await riskService.computeRiskScore(req.user.id);

    res.json({
      success: true,
      data: {
        score: riskData.score,
        level: riskData.score > 0.7 ? 'high' : riskData.score > 0.4 ? 'medium' : 'low',
        flagForManager: riskData.flagForManager,
        factors: riskData.factors,
      },
      error: null,
    });
  } catch (err) {
    console.error('[AnalyticsController] Risk error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Failed to retrieve risk score.' });
  }
}

/**
 * GET /api/analytics/productivity-estimate
 * Return a time-to-productivity estimate based on persona benchmarks and velocity.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getProductivityEstimate(req, res) {
  try {
    // Get user's progress
    const progressResult = await db.query(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE status IN ('completed', 'verified')) AS completed,
         u.created_at
       FROM task_instances ti
       JOIN users u ON ti.user_id = u.id
       WHERE ti.user_id = $1
       GROUP BY u.created_at`,
      [req.user.id]
    );

    if (progressResult.rows.length === 0) {
      return res.json({
        success: true,
        data: { estimate: null, message: 'No tasks assigned yet.' },
        error: null,
      });
    }

    const stats = progressResult.rows[0];
    const total = parseInt(stats.total) || 1;
    const completed = parseInt(stats.completed) || 0;
    const startDate = new Date(stats.created_at);
    const now = new Date();
    const daysElapsed = Math.max(0.5, (now - startDate) / (1000 * 60 * 60 * 24));

    // Calculate velocity
    const tasksPerDay = completed / daysElapsed;
    const remaining = total - completed;
    const estimatedDaysToComplete = tasksPerDay > 0 ? remaining / tasksPerDay : null;

    // Add buffer for first PR (typically 1-2 days after onboarding)
    const totalEstimatedDays = estimatedDaysToComplete
      ? parseFloat((estimatedDaysToComplete + 1.5).toFixed(1))
      : null;

    // Generate human-readable message
    let message;
    if (completed === total) {
      message = 'You\'ve completed all onboarding tasks! You should be ready to merge your first PR now.';
    } else if (totalEstimatedDays && totalEstimatedDays <= 1) {
      message = 'Based on your current pace, you\'ll be ready to merge your first PR in ~1 day. 🚀';
    } else if (totalEstimatedDays && totalEstimatedDays <= 3) {
      message = `Based on your current pace, you'll be ready to merge your first PR in ~${Math.ceil(totalEstimatedDays)} days.`;
    } else if (totalEstimatedDays) {
      message = `Based on your current pace, estimated ~${Math.ceil(totalEstimatedDays)} days until your first PR. Keep going!`;
    } else {
      message = 'Complete more tasks to generate a productivity estimate.';
    }

    res.json({
      success: true,
      data: {
        daysElapsed: parseFloat(daysElapsed.toFixed(1)),
        tasksCompleted: completed,
        totalTasks: total,
        tasksPerDay: parseFloat(tasksPerDay.toFixed(2)),
        estimatedDaysRemaining: totalEstimatedDays,
        estimatedReadyDate: totalEstimatedDays
          ? new Date(now.getTime() + totalEstimatedDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : null,
        message,
      },
      error: null,
    });
  } catch (err) {
    console.error('[AnalyticsController] Productivity estimate error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Failed to compute productivity estimate.' });
  }
}

/**
 * GET /api/analytics/all-developers
 * Manager view: all developers with their risk scores and progress.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getAllDevelopers(req, res) {
  try {
    const result = await db.query(
      `SELECT
         u.id, u.name, u.email, u.experience_level, u.team, u.created_at,
         p.name AS persona_name,
         rs.score AS risk_score, rs.flag_for_manager, rs.factors AS risk_factors,
         COUNT(ti.id) AS total_tasks,
         COUNT(ti.id) FILTER (WHERE ti.status IN ('completed', 'verified')) AS completed_tasks
       FROM users u
       LEFT JOIN personas p ON u.persona_id = p.id
       LEFT JOIN risk_scores rs ON u.id = rs.user_id
       LEFT JOIN task_instances ti ON u.id = ti.user_id
       WHERE u.role = 'developer'
       GROUP BY u.id, p.name, rs.score, rs.flag_for_manager, rs.factors
       ORDER BY rs.score DESC NULLS LAST`
    );

    const developers = result.rows.map((dev) => {
      const total = parseInt(dev.total_tasks) || 0;
      const completed = parseInt(dev.completed_tasks) || 0;
      const daysSinceStart = Math.ceil(
        (Date.now() - new Date(dev.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: dev.id,
        name: dev.name,
        email: dev.email,
        experienceLevel: dev.experience_level,
        team: dev.team,
        personaName: dev.persona_name,
        daysSinceStart,
        progress: {
          total,
          completed,
          percentage: total > 0 ? parseFloat(((completed / total) * 100).toFixed(1)) : 0,
        },
        risk: {
          score: parseFloat(dev.risk_score) || 0,
          level: dev.risk_score > 0.7 ? 'high' : dev.risk_score > 0.4 ? 'medium' : 'low',
          flagged: dev.flag_for_manager || false,
          factors: dev.risk_factors || {},
        },
      };
    });

    res.json({
      success: true,
      data: { developers },
      error: null,
    });
  } catch (err) {
    console.error('[AnalyticsController] All developers error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Failed to retrieve developer data.' });
  }
}

/**
 * GET /api/reports/onboarding/:userId
 * Generate a full structured onboarding report for a specific developer.
 * Manager only.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getOnboardingReport(req, res) {
  try {
    const report = await reportService.generateReport(req.params.userId);

    res.json({
      success: true,
      data: { report },
      error: null,
    });
  } catch (err) {
    console.error('[AnalyticsController] Report error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Failed to generate onboarding report.' });
  }
}

module.exports = {
  getProgress,
  getRisk,
  getProductivityEstimate,
  getAllDevelopers,
  getOnboardingReport,
};
