/**
 * @module services/riskService
 * @description Computes a risk score (0.0 to 1.0) for each developer based on
 * weighted signals: stuck tasks, verification failures, inactivity, low completion,
 * and no chat activity. Flags high-risk developers for manager attention.
 */

const db = require('../config/database');

/**
 * Signal weights for risk score computation.
 * Total must equal 1.0.
 */
const SIGNAL_WEIGHTS = {
  STUCK_TASKS: 0.30,
  VERIFICATION_FAILURES: 0.25,
  INACTIVE_24H: 0.20,
  LOW_COMPLETION_48H: 0.15,
  NO_CHAT_ACTIVITY: 0.10,
};

/** Risk threshold above which a developer is flagged for manager review */
const FLAG_THRESHOLD = 0.70;

/**
 * Compute the risk score for a given developer.
 * Evaluates 5 weighted signals and stores the result in the risk_scores table.
 *
 * @param {string} userId - Developer's UUID
 * @returns {Promise<{score: number, factors: Object, flagForManager: boolean}>}
 *
 * @sideeffect Updates the risk_scores table
 * @sideeffect Logs a recalculation event to progress_logs
 */
async function computeRiskScore(userId) {
  try {
    const factors = {};
    let totalScore = 0;

    // ── Signal 1: Tasks stuck in_progress > 2x estimated time ──
    const stuckResult = await db.query(
      `SELECT COUNT(*) AS stuck_count
       FROM task_instances ti
       JOIN tasks t ON ti.task_id = t.id
       WHERE ti.user_id = $1
         AND ti.status = 'in_progress'
         AND ti.started_at IS NOT NULL
         AND EXTRACT(EPOCH FROM (NOW() - ti.started_at)) / 60 > (t.estimated_minutes * 2)`,
      [userId]
    );
    const stuckCount = parseInt(stuckResult.rows[0].stuck_count);
    const stuckScore = stuckCount > 0 ? Math.min(1.0, stuckCount * 0.5) : 0;
    factors.stuck_tasks = { count: stuckCount, signal_score: stuckScore };
    totalScore += stuckScore * SIGNAL_WEIGHTS.STUCK_TASKS;

    // ── Signal 2: Verification failures > 3 on any single task ──
    const failureResult = await db.query(
      `SELECT MAX(attempt_count) AS max_attempts,
              COUNT(*) FILTER (WHERE attempt_count > 3) AS high_fail_tasks
       FROM task_instances
       WHERE user_id = $1 AND verification_result = FALSE`,
      [userId]
    );
    const maxAttempts = parseInt(failureResult.rows[0].max_attempts) || 0;
    const highFailTasks = parseInt(failureResult.rows[0].high_fail_tasks) || 0;
    const failureScore = maxAttempts > 3 ? Math.min(1.0, highFailTasks * 0.4 + 0.2) : 0;
    factors.verification_failures = { max_attempts: maxAttempts, high_fail_tasks: highFailTasks, signal_score: failureScore };
    totalScore += failureScore * SIGNAL_WEIGHTS.VERIFICATION_FAILURES;

    // ── Signal 3: Zero activity in last 24 hours ──
    const activityResult = await db.query(
      `SELECT COUNT(*) AS recent_activity
       FROM progress_logs
       WHERE user_id = $1
         AND timestamp > NOW() - INTERVAL '24 hours'`,
      [userId]
    );
    const recentActivity = parseInt(activityResult.rows[0].recent_activity);
    const inactiveScore = recentActivity === 0 ? 1.0 : 0;
    factors.inactive_24h = { recent_events: recentActivity, signal_score: inactiveScore };
    totalScore += inactiveScore * SIGNAL_WEIGHTS.INACTIVE_24H;

    // ── Signal 4: Overall completion < 30% after 48 hours ──
    const completionResult = await db.query(
      `SELECT
         COUNT(*) AS total_tasks,
         COUNT(*) FILTER (WHERE status IN ('completed', 'verified')) AS completed_tasks,
         MIN(u.created_at) AS user_created_at
       FROM task_instances ti
       JOIN users u ON ti.user_id = u.id
       WHERE ti.user_id = $1`,
      [userId]
    );
    const row = completionResult.rows[0];
    const totalTasks = parseInt(row.total_tasks) || 1;
    const completedTasks = parseInt(row.completed_tasks) || 0;
    const completionPct = completedTasks / totalTasks;
    const hoursSinceStart = row.user_created_at
      ? (Date.now() - new Date(row.user_created_at).getTime()) / (1000 * 60 * 60)
      : 0;
    const lowCompletionScore = hoursSinceStart > 48 && completionPct < 0.3 ? 1.0 : 0;
    factors.low_completion = {
      completion_pct: parseFloat((completionPct * 100).toFixed(1)),
      hours_since_start: parseFloat(hoursSinceStart.toFixed(1)),
      signal_score: lowCompletionScore,
    };
    totalScore += lowCompletionScore * SIGNAL_WEIGHTS.LOW_COMPLETION_48H;

    // ── Signal 5: No chat activity (developer not asking for help) ──
    const chatResult = await db.query(
      `SELECT COUNT(*) AS chat_count
       FROM chat_history
       WHERE user_id = $1 AND role = 'user'`,
      [userId]
    );
    const chatCount = parseInt(chatResult.rows[0].chat_count);
    const noChatScore = chatCount === 0 ? 1.0 : 0;
    factors.no_chat_activity = { total_messages: chatCount, signal_score: noChatScore };
    totalScore += noChatScore * SIGNAL_WEIGHTS.NO_CHAT_ACTIVITY;

    // ── Compute final score ──
    const finalScore = parseFloat(Math.min(1.0, totalScore).toFixed(3));
    const flagForManager = finalScore > FLAG_THRESHOLD;

    // ── Store in risk_scores table ──
    await db.query(
      `INSERT INTO risk_scores (user_id, score, factors, flag_for_manager, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET score = $2, factors = $3, flag_for_manager = $4, updated_at = NOW()`,
      [userId, finalScore, JSON.stringify(factors), flagForManager]
    );

    // ── Log recalculation event ──
    await db.query(
      `INSERT INTO progress_logs (user_id, event_type, metadata)
       VALUES ($1, 'risk_recalculated', $2)`,
      [userId, JSON.stringify({ score: finalScore, flagged: flagForManager })]
    );

    return { score: finalScore, factors, flagForManager };
  } catch (err) {
    console.error('[RiskService] Error computing risk score:', err.message);
    throw new Error('Failed to compute risk score.');
  }
}

/**
 * Get the current risk score for a user (from cache).
 * If no score exists, compute it.
 *
 * @param {string} userId - Developer's UUID
 * @returns {Promise<{score: number, factors: Object, flagForManager: boolean, updatedAt: string}>}
 */
async function getRiskScore(userId) {
  try {
    const result = await db.query(
      'SELECT score, factors, flag_for_manager, updated_at FROM risk_scores WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return computeRiskScore(userId);
    }

    const row = result.rows[0];
    return {
      score: parseFloat(row.score),
      factors: row.factors,
      flagForManager: row.flag_for_manager,
      updatedAt: row.updated_at,
    };
  } catch (err) {
    console.error('[RiskService] Error getting risk score:', err.message);
    throw new Error('Failed to get risk score.');
  }
}

/**
 * Get all developers flagged for manager attention (risk > 0.70).
 * @returns {Promise<Array<{userId: string, name: string, score: number, factors: Object}>>}
 */
async function getFlaggedDevelopers() {
  try {
    const result = await db.query(
      `SELECT u.id AS user_id, u.name, u.email, rs.score, rs.factors, rs.updated_at
       FROM risk_scores rs
       JOIN users u ON rs.user_id = u.id
       WHERE rs.flag_for_manager = TRUE
       ORDER BY rs.score DESC`
    );
    return result.rows;
  } catch (err) {
    console.error('[RiskService] Error getting flagged developers:', err.message);
    return [];
  }
}

module.exports = { computeRiskScore, getRiskScore, getFlaggedDevelopers };
