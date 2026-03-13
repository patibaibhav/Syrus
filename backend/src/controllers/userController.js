/**
 * @module controllers/userController
 * @description Handles user profile retrieval and persona assignment.
 */

const db = require('../config/database');

/**
 * GET /api/user/profile
 * Retrieve the current user's profile with persona details.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getProfile(req, res) {
  try {
    const result = await db.query(
      `SELECT u.id, u.email, u.name, u.role, u.experience_level, u.tech_stack,
              u.team, u.created_at,
              p.id AS persona_id, p.name AS persona_name, p.role AS persona_role,
              p.experience_level AS persona_experience, p.tech_stack AS persona_tech,
              p.onboarding_focus, p.learning_objectives
       FROM users u
       LEFT JOIN personas p ON u.persona_id = p.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'User not found.' });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        experienceLevel: user.experience_level,
        techStack: user.tech_stack,
        team: user.team,
        createdAt: user.created_at,
        persona: user.persona_id
          ? {
              id: user.persona_id,
              name: user.persona_name,
              role: user.persona_role,
              experienceLevel: user.persona_experience,
              techStack: user.persona_tech,
              onboardingFocus: user.onboarding_focus,
              learningObjectives: user.learning_objectives,
            }
          : null,
      },
      error: null,
    });
  } catch (err) {
    console.error('[UserController] Get profile error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Failed to retrieve profile.' });
  }
}

/**
 * PUT /api/user/persona
 * Manually assign or change the user's persona. Re-creates task instances.
 *
 * @param {import('express').Request} req - Body: { personaId }
 * @param {import('express').Response} res
 */
async function updatePersona(req, res) {
  try {
    const { personaId } = req.body;

    if (!personaId) {
      return res.status(400).json({ success: false, data: null, error: 'personaId is required.' });
    }

    // Verify persona exists
    const personaResult = await db.query('SELECT * FROM personas WHERE id = $1', [personaId]);
    if (personaResult.rows.length === 0) {
      return res.status(404).json({ success: false, data: null, error: 'Persona not found.' });
    }

    const persona = personaResult.rows[0];

    // Update user's persona
    await db.query('UPDATE users SET persona_id = $1 WHERE id = $2', [personaId, req.user.id]);

    // Remove existing task instances that are not started
    await db.query(
      `DELETE FROM task_instances WHERE user_id = $1 AND status = 'not_started'`,
      [req.user.id]
    );

    // Create new task instances for the new persona
    const personaTasks = await db.query(
      'SELECT task_id, order_index FROM persona_tasks WHERE persona_id = $1 ORDER BY order_index',
      [personaId]
    );

    for (const pt of personaTasks.rows) {
      // Only create if not already existing
      const existing = await db.query(
        'SELECT id FROM task_instances WHERE user_id = $1 AND task_id = $2',
        [req.user.id, pt.task_id]
      );
      if (existing.rows.length === 0) {
        await db.query(
          `INSERT INTO task_instances (user_id, task_id, status, order_index)
           VALUES ($1, $2, 'not_started', $3)`,
          [req.user.id, pt.task_id, pt.order_index]
        );
      }
    }

    // Log event
    await db.query(
      `INSERT INTO progress_logs (user_id, event_type, metadata)
       VALUES ($1, 'persona_changed', $2)`,
      [req.user.id, JSON.stringify({ new_persona: persona.name })]
    );

    res.json({
      success: true,
      data: {
        persona: {
          id: persona.id,
          name: persona.name,
          role: persona.role,
          experienceLevel: persona.experience_level,
          onboardingFocus: persona.onboarding_focus,
          learningObjectives: persona.learning_objectives,
        },
      },
      error: null,
    });
  } catch (err) {
    console.error('[UserController] Update persona error:', err.message);
    res.status(500).json({ success: false, data: null, error: 'Failed to update persona.' });
  }
}

module.exports = { getProfile, updatePersona };
