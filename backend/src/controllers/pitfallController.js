/**
 * @module controllers/pitfallController
 * @description Retrieves pitfalls associated with a specific task.
 */

const db = require('../config/database');

/**
 * GET /api/pitfalls?taskId=
 * Return all pitfalls for the given task ID.
 *
 * @param {import('express').Request} req - Query: { taskId: UUID }
 * @param {import('express').Response} res
 */
async function getPitfalls(req, res) {
  try {
    const { taskId } = req.query;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'taskId query parameter is required.',
      });
    }

    const result = await db.query(
      `SELECT p.id, p.title, p.description, p.warning_message, p.condition,
              t.title AS task_title
       FROM pitfalls p
       JOIN tasks t ON p.task_id = t.id
       WHERE p.task_id = $1`,
      [taskId]
    );

    res.json({
      success: true,
      data: {
        taskId,
        pitfalls: result.rows.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          warningMessage: p.warning_message,
          condition: p.condition,
          taskTitle: p.task_title,
        })),
      },
      error: null,
    });
  } catch (err) {
    console.error('[PitfallController] Get pitfalls error:', err.message);
    res.status(500).json({
      success: false,
      data: null,
      error: 'Failed to retrieve pitfalls.',
    });
  }
}

module.exports = { getPitfalls };
