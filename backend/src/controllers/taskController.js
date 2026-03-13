/**
 * @module controllers/taskController
 * @description Handles task listing, starting, verification, and completion.
 * Triggers proactive pitfall warnings and verification diagnostics via RAG.
 */

const db = require('../config/database');
const verificationService = require('../services/verificationService');
const ragService = require('../services/ragService');
const riskService = require('../services/riskService');

/**
 * GET /api/tasks
 * Return all task instances for the current user with full task details and pitfalls.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function listTasks(req, res) {
  try {
    const result = await db.query(
      `SELECT ti.id, ti.status, ti.started_at, ti.completed_at,
              ti.evidence, ti.verification_result, ti.attempt_count, ti.order_index,
              t.id AS task_id, t.title, t.description, t.category,
              t.verification_type, t.verification_params,
              t.pitfall_warning, t.estimated_minutes
       FROM task_instances ti
       JOIN tasks t ON ti.task_id = t.id
       WHERE ti.user_id = $1
       ORDER BY ti.order_index ASC`,
      [req.user.id]
    );

    // Get pitfalls for all tasks
    const taskIds = result.rows.map((r) => r.task_id);
    let pitfalls = [];
    if (taskIds.length > 0) {
      const pitfallResult = await db.query(
        `SELECT task_id, id, title, warning_message FROM pitfalls WHERE task_id = ANY($1)`,
        [taskIds]
      );
      pitfalls = pitfallResult.rows;
    }

    // Map pitfalls to tasks
    const tasks = result.rows.map((row) => ({
      id: row.id,
      taskId: row.task_id,
      title: row.title,
      description: row.description,
      category: row.category,
      status: row.status,
      orderIndex: row.order_index,
      verificationType: row.verification_type,
      pitfallWarning: row.pitfall_warning,
      estimatedMinutes: row.estimated_minutes,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      evidence: row.evidence,
      verificationResult: row.verification_result,
      attemptCount: row.attempt_count,
      pitfalls: pitfalls
        .filter((p) => p.task_id === row.task_id)
        .map((p) => ({ id: p.id, title: p.title, warningMessage: p.warning_message })),
    }));

    res.json({ success: true, data: { tasks }, error: null });
  } catch (err) {
    console.error('[TaskController] List tasks error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Failed to retrieve tasks.' });
  }
}

/**
 * GET /api/tasks/:id
 * Full task detail including pitfalls.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getTask(req, res) {
  try {
    const result = await db.query(
      `SELECT ti.id, ti.status, ti.started_at, ti.completed_at,
              ti.evidence, ti.verification_result, ti.attempt_count,
              t.id AS task_id, t.title, t.description, t.category,
              t.verification_type, t.verification_params,
              t.pitfall_warning, t.estimated_minutes
       FROM task_instances ti
       JOIN tasks t ON ti.task_id = t.id
       WHERE ti.id = $1 AND ti.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Task not found.' });
    }

    const row = result.rows[0];

    // Get pitfalls
    const pitfallResult = await db.query(
      'SELECT id, title, description, warning_message, condition FROM pitfalls WHERE task_id = $1',
      [row.task_id]
    );

    res.json({
      success: true,
      data: {
        id: row.id,
        taskId: row.task_id,
        title: row.title,
        description: row.description,
        category: row.category,
        status: row.status,
        verificationType: row.verification_type,
        verificationParams: row.verification_params,
        pitfallWarning: row.pitfall_warning,
        estimatedMinutes: row.estimated_minutes,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        evidence: row.evidence,
        verificationResult: row.verification_result,
        attemptCount: row.attempt_count,
        pitfalls: pitfallResult.rows.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          warningMessage: p.warning_message,
        })),
      },
      error: null,
    });
  } catch (err) {
    console.error('[TaskController] Get task error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Failed to retrieve task.' });
  }
}

/**
 * POST /api/tasks/:id/start
 * Mark a task as in_progress. Triggers proactive pitfall warnings via chat.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function startTask(req, res) {
  try {
    // Get task instance with task_id
    const taskInstance = await db.query(
      `SELECT ti.id, ti.status, ti.task_id, t.title
       FROM task_instances ti
       JOIN tasks t ON ti.task_id = t.id
       WHERE ti.id = $1 AND ti.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (taskInstance.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Task not found.' });
    }

    const task = taskInstance.rows[0];

    if (task.status !== 'not_started') {
      return res.status(400).json({
        success: false,
        data: null,
        error: `Task is already ${task.status}. Cannot start.`,
      });
    }

    // Update status
    await db.query(
      `UPDATE task_instances SET status = 'in_progress', started_at = NOW()
       WHERE id = $1`,
      [req.params.id]
    );

    // Log event
    await db.query(
      `INSERT INTO progress_logs (user_id, event_type, metadata)
       VALUES ($1, 'task_started', $2)`,
      [req.user.id, JSON.stringify({ task_id: task.task_id, title: task.title })]
    );

    // Proactive pitfall warning (async, don't block response)
    ragService.sendPitfallWarning(req.user.id, task.task_id).catch((err) => {
      console.error('[TaskController] Pitfall warning failed:', err.message);
    });

    res.json({
      success: true,
      data: { message: `Task "${task.title}" started.`, taskId: req.params.id },
      error: null,
    });
  } catch (err) {
    console.error('[TaskController] Start task error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Failed to start task.' });
  }
}

/**
 * POST /api/tasks/:id/verify
 * Submit evidence for task verification. On failure, generates AI diagnostic.
 *
 * @param {import('express').Request} req - Body: { evidence: string }
 * @param {import('express').Response} res
 */
async function verifyTask(req, res) {
  try {
    const { evidence } = req.body;

    if (!evidence || evidence.trim().length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Evidence is required for verification.',
      });
    }

    // Get task instance
    const taskResult = await db.query(
      `SELECT ti.id, ti.status, ti.attempt_count, ti.task_id,
              t.title, t.verification_type, t.verification_params
       FROM task_instances ti
       JOIN tasks t ON ti.task_id = t.id
       WHERE ti.id = $1 AND ti.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Task not found.' });
    }

    const task = taskResult.rows[0];

    // Run verification
    const result = verificationService.verify(
      task.verification_type,
      evidence,
      task.verification_params || {}
    );

    // Update task instance
    const newStatus = result.success ? 'verified' : task.status;
    await db.query(
      `UPDATE task_instances
       SET evidence = $1, verification_result = $2, status = $3,
           attempt_count = attempt_count + 1,
           completed_at = CASE WHEN $2 = TRUE THEN NOW() ELSE completed_at END
       WHERE id = $4`,
      [evidence, result.success, newStatus, req.params.id]
    );

    // Log verification event
    await db.query(
      `INSERT INTO progress_logs (user_id, event_type, metadata)
       VALUES ($1, 'task_verified', $2)`,
      [
        req.user.id,
        JSON.stringify({
          task_id: task.task_id,
          title: task.title,
          success: result.success,
          attempt: task.attempt_count + 1,
        }),
      ]
    );

    // Recalculate risk score
    riskService.computeRiskScore(req.user.id).catch((err) => {
      console.error('[TaskController] Risk recalculation failed:', err.message);
    });

    // On failure: generate AI diagnostic asynchronously
    if (!result.success) {
      ragService.generateDiagnostic(req.user.id, task.title, evidence, result.message).catch((err) => {
        console.error('[TaskController] Diagnostic generation failed:', err.message);
      });
    }

    res.json({
      success: true,
      data: {
        verification: {
          passed: result.success,
          message: result.message,
          details: result.details,
          attemptCount: task.attempt_count + 1,
        },
      },
      error: null,
    });
  } catch (err) {
    console.error('[TaskController] Verify task error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Failed to verify task.' });
  }
}

/**
 * POST /api/tasks/:id/complete
 * Manual override to mark a task as completed.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function completeTask(req, res) {
  try {
    const taskResult = await db.query(
      `SELECT ti.id, ti.status, t.title, ti.task_id
       FROM task_instances ti
       JOIN tasks t ON ti.task_id = t.id
       WHERE ti.id = $1 AND ti.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Task not found.' });
    }

    const task = taskResult.rows[0];

    await db.query(
      `UPDATE task_instances SET status = 'completed', completed_at = NOW()
       WHERE id = $1`,
      [req.params.id]
    );

    // Log event
    await db.query(
      `INSERT INTO progress_logs (user_id, event_type, metadata)
       VALUES ($1, 'task_completed', $2)`,
      [req.user.id, JSON.stringify({ task_id: task.task_id, title: task.title })]
    );

    // Recalculate risk
    riskService.computeRiskScore(req.user.id).catch(() => {});

    res.json({
      success: true,
      data: { message: `Task "${task.title}" marked as completed.` },
      error: null,
    });
  } catch (err) {
    console.error('[TaskController] Complete task error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Failed to complete task.' });
  }
}

module.exports = { listTasks, getTask, startTask, verifyTask, completeTask };
