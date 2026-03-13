/**
 * @module controllers/authController
 * @description Handles user registration and login. Auto-assigns persona based
 * on role and tech_stack during registration, creates all task instances for
 * the matched persona, and issues JWT tokens.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Auto-match a persona based on the user's role, experience level, and tech stack.
 * Scoring: role match (+3), experience match (+2), tech overlap (+1 per match).
 *
 * @param {string} role - User's declared role (backend/frontend/fullstack)
 * @param {string} experienceLevel - intern/junior/mid/senior
 * @param {string[]} techStack - Array of technologies the user knows
 * @returns {Promise<{persona: Object, matchReason: string}>}
 */
async function autoMatchPersona(role, experienceLevel, techStack) {
  const personas = await db.query('SELECT * FROM personas');

  let bestMatch = null;
  let bestScore = -1;
  let matchReason = '';

  for (const persona of personas.rows) {
    let score = 0;
    const reasons = [];

    // Role match (+3)
    if (persona.role.toLowerCase() === role.toLowerCase()) {
      score += 3;
      reasons.push(`Role match: ${role}`);
    }

    // Experience level match (+2)
    if (persona.experience_level.toLowerCase() === experienceLevel.toLowerCase()) {
      score += 2;
      reasons.push(`Experience match: ${experienceLevel}`);
    }

    // Tech stack overlap (+1 per match)
    const personaTech = Array.isArray(persona.tech_stack) ? persona.tech_stack : [];
    const userTechLower = (techStack || []).map((t) => t.toLowerCase());
    const overlap = personaTech.filter((t) => userTechLower.includes(t.toLowerCase()));
    score += overlap.length;
    if (overlap.length > 0) {
      reasons.push(`Tech overlap: ${overlap.join(', ')}`);
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = persona;
      matchReason = reasons.join(' | ');
    }
  }

  return { persona: bestMatch, matchReason };
}

/**
 * POST /api/auth/register
 * Register a new developer account. Auto-assigns persona, creates task instances.
 *
 * @param {import('express').Request} req - Body: { email, name, password, role, experienceLevel, techStack, team }
 * @param {import('express').Response} res
 */
async function register(req, res) {
  try {
    const { email, name, password, role, experienceLevel, techStack, team } = req.body;

    // Input validation
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Email, name, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Password must be at least 6 characters.',
      });
    }

    // Check for existing user
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        data: null,
        error: 'An account with this email already exists.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Auto-match persona
    const userRole = role || 'developer';
    const userExpLevel = experienceLevel || 'junior';
    const userTechStack = techStack || [];
    const { persona, matchReason } = await autoMatchPersona(userRole, userExpLevel, userTechStack);

    // Create user
    const userResult = await db.query(
      `INSERT INTO users (email, name, password_hash, role, experience_level, tech_stack, team, persona_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, name, role, experience_level, tech_stack, team, persona_id, created_at`,
      [email, name, passwordHash, userRole, userExpLevel, JSON.stringify(userTechStack), team || null, persona ? persona.id : null]
    );

    const user = userResult.rows[0];

    // Create task instances for the matched persona
    if (persona) {
      const personaTasks = await db.query(
        'SELECT task_id, order_index FROM persona_tasks WHERE persona_id = $1 ORDER BY order_index',
        [persona.id]
      );

      for (const pt of personaTasks.rows) {
        await db.query(
          `INSERT INTO task_instances (user_id, task_id, status, order_index)
           VALUES ($1, $2, 'not_started', $3)`,
          [user.id, pt.task_id, pt.order_index]
        );
      }

      // Initialize risk score
      await db.query(
        `INSERT INTO risk_scores (user_id, score, factors, flag_for_manager)
         VALUES ($1, 0.1, $2, FALSE)`,
        [user.id, JSON.stringify({ initial: true })]
      );

      // Log onboarding start
      await db.query(
        `INSERT INTO progress_logs (user_id, event_type, metadata)
         VALUES ($1, 'onboarding_started', $2)`,
        [user.id, JSON.stringify({ persona: persona.name, total_tasks: personaTasks.rows.length })]
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          experienceLevel: user.experience_level,
          techStack: user.tech_stack,
          team: user.team,
          createdAt: user.created_at,
        },
        persona: persona
          ? {
              id: persona.id,
              name: persona.name,
              role: persona.role,
              experienceLevel: persona.experience_level,
              onboardingFocus: persona.onboarding_focus,
              learningObjectives: persona.learning_objectives,
              matchReason,
            }
          : null,
      },
      error: null,
    });
  } catch (err) {
    console.error('[AuthController] Registration error:', err.message);
    res.status(500).json({
      success: false,
      data: null,
      error: 'Registration failed. Please try again.',
    });
  }
}

/**
 * POST /api/auth/login
 * Authenticate a user and return JWT + profile.
 *
 * @param {import('express').Request} req - Body: { email, password }
 * @param {import('express').Response} res
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Email and password are required.',
      });
    }

    // Find user with persona info
    const result = await db.query(
      `SELECT u.*, p.name AS persona_name, p.role AS persona_role,
              p.onboarding_focus, p.learning_objectives
       FROM users u
       LEFT JOIN personas p ON u.persona_id = p.id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Invalid email or password.',
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Invalid email or password.',
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Log login event
    await db.query(
      `INSERT INTO progress_logs (user_id, event_type, metadata)
       VALUES ($1, 'login', $2)`,
      [user.id, JSON.stringify({ timestamp: new Date().toISOString() })]
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          experienceLevel: user.experience_level,
          techStack: user.tech_stack,
          team: user.team,
          createdAt: user.created_at,
        },
        persona: user.persona_name
          ? {
              name: user.persona_name,
              role: user.persona_role,
              onboardingFocus: user.onboarding_focus,
              learningObjectives: user.learning_objectives,
            }
          : null,
      },
      error: null,
    });
  } catch (err) {
    console.error('[AuthController] Login error:', err.message);
    res.status(500).json({
      success: false,
      data: null,
      error: 'Login failed. Please try again.',
    });
  }
}

module.exports = { register, login };
