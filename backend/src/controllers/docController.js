/**
 * @module controllers/docController
 * @description Handles document search using embedding similarity and text fallback.
 */

const embeddingService = require('../services/embeddingService');

/**
 * GET /api/docs/search?q=
 * Search the knowledge base by semantic similarity.
 *
 * @param {import('express').Request} req - Query: { q: string }
 * @param {import('express').Response} res
 */
async function searchDocs(req, res) {
  try {
    const query = req.query.q;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Search query (q) is required.',
      });
    }

    const results = await embeddingService.searchDocuments(query.trim(), 5);

    res.json({
      success: true,
      data: {
        query: query.trim(),
        results: results.map((doc) => ({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          category: doc.category,
          tags: doc.tags || [],
          similarity: parseFloat((doc.similarity || 0).toFixed(3)),
        })),
      },
      error: null,
    });
  } catch (err) {
    console.error('[DocController] Search error:', err.message);
    res.status(500).json({
      success: false,
      data: null,
      error: 'Failed to search documentation.',
    });
  }
}

module.exports = { searchDocs };
