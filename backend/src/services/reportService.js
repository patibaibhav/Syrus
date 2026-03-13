/**
 * @module services/reportService
 * @description Generates structured onboarding reports for managers and HR.
 * Produces beautifully formatted JSON that reads like a real HR document
 * with completion timestamps, velocity metrics, and verification pass rates.
 */

const db = require('../config/database');
const riskService = require('./riskService');

/**
 * Generate a comprehensive onboarding report for a specific developer.
 * Includes: personal info, persona match, task breakdown with timings,
 * verification stats, velocity metrics, risk assessment, chat engagement,
 * and time-to-productivity estimate.
 *
 * @param {string} userId - Developer's UUID
 * @returns {Promise<Object>} Structured onboarding report
 */
async function generateReport(userId) {
  try {
    // ── 1. Developer Profile ──
    const userResult = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.experience_level, u.tech_stack,
              u.team, u.created_at,
              p.name AS persona_name, p.role AS persona_role,
              p.learning_objectives, p.onboarding_focus
       FROM users u
       LEFT JOIN personas p ON u.persona_id = p.id
       WHERE u.id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found.');
    }

    const user = userResult.rows[0];
    const startDate = new Date(user.created_at);
    const now = new Date();
    const daysElapsed = Math.max(1, Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)));

    // ── 2. Task Breakdown ──
    const tasksResult = await db.query(
      `SELECT ti.id, ti.status, ti.started_at, ti.completed_at,
              ti.attempt_count, ti.verification_result,
              t.title, t.category, t.estimated_minutes, t.verification_type
       FROM task_instances ti
       JOIN tasks t ON ti.task_id = t.id
       WHERE ti.user_id = $1
       ORDER BY ti.order_index ASC`,
      [userId]
    );

    const tasks = tasksResult.rows;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed' || t.status === 'verified').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
    const notStartedTasks = tasks.filter((t) => t.status === 'not_started').length;

    // Calculate time spent per task
    const taskDetails = tasks.map((task) => {
      let minutesSpent = null;
      if (task.started_at && task.completed_at) {
        minutesSpent = Math.round(
          (new Date(task.completed_at) - new Date(task.started_at)) / (1000 * 60)
        );
      } else if (task.started_at) {
        minutesSpent = Math.round((now - new Date(task.started_at)) / (1000 * 60));
      }

      return {
        title: task.title,
        category: task.category,
        status: task.status,
        estimated_minutes: task.estimated_minutes,
        actual_minutes: minutesSpent,
        efficiency: minutesSpent && task.estimated_minutes
          ? parseFloat(((task.estimated_minutes / minutesSpent) * 100).toFixed(1))
          : null,
        verification_type: task.verification_type,
        verification_passed: task.verification_result,
        attempts: task.attempt_count,
        started_at: task.started_at,
        completed_at: task.completed_at,
      };
    });

    // ── 3. Verification Statistics ──
    const totalVerifications = tasks.reduce((sum, t) => sum + (t.attempt_count || 0), 0);
    const successfulVerifications = tasks.filter((t) => t.verification_result === true).length;
    const verificationPassRate = totalVerifications > 0
      ? parseFloat(((successfulVerifications / totalVerifications) * 100).toFixed(1))
      : 0;

    // ── 4. Velocity Metrics ──
    const completedWithTime = tasks.filter((t) => t.started_at && t.completed_at);
    const totalEstimatedMinutes = tasks.reduce((sum, t) => sum + (t.estimated_minutes || 0), 0);
    const totalActualMinutes = completedWithTime.reduce((sum, t) => {
      return sum + Math.round((new Date(t.completed_at) - new Date(t.started_at)) / (1000 * 60));
    }, 0);
    const averageTaskMinutes = completedWithTime.length > 0
      ? Math.round(totalActualMinutes / completedWithTime.length)
      : null;
    const tasksPerDay = completedTasks > 0 ? parseFloat((completedTasks / daysElapsed).toFixed(1)) : 0;

    // ── 5. Risk Assessment ──
    const riskData = await riskService.getRiskScore(userId);

    // ── 6. Chat Engagement ──
    const chatResult = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE role = 'user') AS user_messages,
         COUNT(*) FILTER (WHERE role = 'assistant') AS assistant_messages
       FROM chat_history WHERE user_id = $1`,
      [userId]
    );
    const chatStats = chatResult.rows[0];

    // ── 7. Time-to-Productivity Estimate ──
    const remainingTasks = totalTasks - completedTasks;
    const estimatedDaysRemaining = tasksPerDay > 0
      ? parseFloat((remainingTasks / tasksPerDay).toFixed(1))
      : null;

    // ── 8. Category Breakdown ──
    const categoryStats = {};
    for (const task of tasks) {
      if (!categoryStats[task.category]) {
        categoryStats[task.category] = { total: 0, completed: 0, in_progress: 0 };
      }
      categoryStats[task.category].total++;
      if (task.status === 'completed' || task.status === 'verified') {
        categoryStats[task.category].completed++;
      } else if (task.status === 'in_progress') {
        categoryStats[task.category].in_progress++;
      }
    }

    // ── Build Report ──
    return {
      report_metadata: {
        generated_at: now.toISOString(),
        report_type: 'Developer Onboarding Progress Report',
        version: '1.0',
      },
      developer: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        experience_level: user.experience_level,
        tech_stack: user.tech_stack,
        team: user.team,
        onboarding_start_date: startDate.toISOString(),
        days_elapsed: daysElapsed,
      },
      persona_match: {
        persona_name: user.persona_name,
        persona_role: user.persona_role,
        onboarding_focus: user.onboarding_focus,
        learning_objectives: user.learning_objectives,
      },
      progress_summary: {
        total_tasks: totalTasks,
        completed: completedTasks,
        in_progress: inProgressTasks,
        not_started: notStartedTasks,
        completion_percentage: parseFloat(((completedTasks / totalTasks) * 100).toFixed(1)),
        category_breakdown: categoryStats,
      },
      velocity_metrics: {
        tasks_per_day: tasksPerDay,
        average_task_duration_minutes: averageTaskMinutes,
        total_estimated_minutes: totalEstimatedMinutes,
        total_actual_minutes: totalActualMinutes,
        overall_efficiency: totalActualMinutes > 0
          ? parseFloat(((totalEstimatedMinutes / totalActualMinutes) * 100).toFixed(1))
          : null,
      },
      verification_stats: {
        total_attempts: totalVerifications,
        successful: successfulVerifications,
        pass_rate_percentage: verificationPassRate,
        tasks_with_multiple_attempts: tasks.filter((t) => t.attempt_count > 1).length,
      },
      risk_assessment: {
        current_score: riskData.score,
        risk_level: riskData.score > 0.7 ? 'HIGH' : riskData.score > 0.4 ? 'MEDIUM' : 'LOW',
        flagged_for_manager: riskData.flagForManager,
        factors: riskData.factors,
      },
      chat_engagement: {
        total_user_messages: parseInt(chatStats.user_messages) || 0,
        total_assistant_responses: parseInt(chatStats.assistant_messages) || 0,
        engagement_level: parseInt(chatStats.user_messages) > 10 ? 'HIGH' :
          parseInt(chatStats.user_messages) > 3 ? 'MEDIUM' : 'LOW',
      },
      time_to_productivity: {
        estimated_days_remaining: estimatedDaysRemaining,
        estimated_completion_date: estimatedDaysRemaining
          ? new Date(now.getTime() + estimatedDaysRemaining * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : null,
        assessment: completedTasks === totalTasks
          ? 'Onboarding complete — developer is ready for full productivity.'
          : estimatedDaysRemaining && estimatedDaysRemaining <= 2
            ? 'On track — developer should be productive within 2 days.'
            : estimatedDaysRemaining && estimatedDaysRemaining <= 5
              ? 'Progressing — developer is working through tasks at a reasonable pace.'
              : 'Needs attention — progress is slower than expected. Consider assigning a buddy.',
      },
      task_details: taskDetails,
    };
  } catch (err) {
    console.error('[ReportService] Error generating report:', err.message);
    throw new Error('Failed to generate onboarding report.');
  }
}

module.exports = { generateReport };
