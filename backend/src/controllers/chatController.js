/**
 * @module controllers/chatController
 * @description Handles the AI chat endpoint (RAG-powered) and chat history retrieval.
 */

const ragService = require('../services/ragService');
const db = require('../config/database');

/**
 * POST /api/chat
 * Send a message to the Axiom AI assistant. Uses RAG pipeline.
 *
 * @param {import('express').Request} req - Body: { message: string }
 * @param {import('express').Response} res
 */
async function sendMessage(req, res) {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Message is required.',
      });
    }

    const result = await ragService.chat(req.user.id, message.trim());

    res.json({
      success: true,
      data: {
        reply: result.reply,
        sources: result.sources,
        confidence: result.confidence,
      },
      error: null,
    });
  } catch (err) {
    console.error('[ChatController] Send message error:', err.message);
    res.status(500).json({
      success: false,
      data: null,
      error: 'Failed to process your message. Please try again.',
    });
  }
}

/**
 * GET /api/chat/history
 * Return the last 20 messages for the current user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getHistory(req, res) {
  try {
    const result = await db.query(
      `SELECT id, role, content, sources, created_at
       FROM chat_history
       WHERE user_id = $1
       ORDER BY created_at ASC
       LIMIT 50`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        messages: result.rows.map((row) => ({
          id: row.id,
          role: row.role,
          content: row.content,
          sources: row.sources || [],
          createdAt: row.created_at,
        })),
      },
      error: null,
    });
  } catch (err) {
    console.error('[ChatController] Get history error:', err.message);
    res.status(500).json({
      success: false,
      data: null,
      error: 'Failed to retrieve chat history.',
    });
  }
}

module.exports = { sendMessage, getHistory };
