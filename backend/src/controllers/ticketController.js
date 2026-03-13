/**
 * @module controllers/ticketController
 * @description Handles starter ticket retrieval and status updates.
 */

const db = require('../config/database');

/**
 * GET /api/tickets/starter
 * Return starter tickets assigned to the current user or matching their persona.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getStarterTickets(req, res) {
  try {
    const result = await db.query(
      `SELECT t.id, t.title, t.description, t.repository,
              t.acceptance_criteria, t.difficulty, t.status, t.created_at,
              p.name AS persona_name
       FROM tickets t
       LEFT JOIN personas p ON t.persona_id = p.id
       WHERE t.assigned_to = $1 OR (t.assigned_to IS NULL AND t.persona_id = $2)
       ORDER BY t.created_at ASC`,
      [req.user.id, req.user.persona_id]
    );

    res.json({
      success: true,
      data: {
        tickets: result.rows.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          repository: t.repository,
          acceptanceCriteria: t.acceptance_criteria,
          difficulty: t.difficulty,
          status: t.status,
          personaName: t.persona_name,
          createdAt: t.created_at,
        })),
      },
      error: null,
    });
  } catch (err) {
    console.error('[TicketController] Get tickets error:', err.message);
    res.status(500).json({
      success: false,
      data: null,
      error: 'Failed to retrieve starter tickets.',
    });
  }
}

/**
 * PUT /api/tickets/starter/:id
 * Update the status of a starter ticket.
 *
 * @param {import('express').Request} req - Body: { status: 'assigned'|'in_progress'|'completed' }
 * @param {import('express').Response} res
 */
async function updateTicketStatus(req, res) {
  try {
    const { status } = req.body;
    const validStatuses = ['assigned', 'in_progress', 'completed'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        data: null,
        error: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const result = await db.query(
      `UPDATE tickets SET status = $1
       WHERE id = $2 AND assigned_to = $3
       RETURNING id, title, status`,
      [status, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Ticket not found or not assigned to you.',
      });
    }

    // Log event
    await db.query(
      `INSERT INTO progress_logs (user_id, event_type, metadata)
       VALUES ($1, 'ticket_status_changed', $2)`,
      [req.user.id, JSON.stringify({ ticket_id: req.params.id, new_status: status })]
    );

    res.json({
      success: true,
      data: result.rows[0],
      error: null,
    });
  } catch (err) {
    console.error('[TicketController] Update ticket error:', err.message);
    res.status(500).json({
      success: false,
      data: null,
      error: 'Failed to update ticket status.',
    });
  }
}

module.exports = { getStarterTickets, updateTicketStatus };
