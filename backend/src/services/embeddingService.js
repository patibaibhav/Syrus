/**
 * @module services/embeddingService
 * @description Generates text embeddings via OpenAI text-embedding-ada-002
 * and performs pgvector cosine similarity searches against the documents table.
 */

const OpenAI = require('openai');
const db = require('../config/database');

let _openai = null;
function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder' });
  }
  return _openai;
}

/**
 * Generate an embedding vector for the given text.
 * @param {string} text - Input text to embed
 * @returns {Promise<number[]>} 1536-dimensional embedding vector
 */
async function generateEmbedding(text) {
  try {
    const response = await getOpenAI().embeddings.create({
      model: 'text-embedding-ada-002',
      input: text.slice(0, 8000), // Truncate to stay within token limits
    });
    return response.data[0].embedding;
  } catch (err) {
    console.error('[EmbeddingService] Error generating embedding:', err.message);
    throw new Error('Failed to generate embedding.');
  }
}

/**
 * Search the documents table for the most similar documents to the query.
 * Uses pgvector cosine distance operator (<=>).
 * @param {string} queryText - The search query
 * @param {number} [limit=5] - Maximum number of results
 * @returns {Promise<Array<{id: string, title: string, content: string, category: string, similarity: number}>>}
 */
async function searchDocuments(queryText, limit = 5) {
  try {
    const embedding = await generateEmbedding(queryText);
    const embeddingStr = `[${embedding.join(',')}]`;

    const result = await db.query(
      `SELECT id, title, content, category, tags,
              1 - (embedding <=> $1::vector) AS similarity
       FROM documents
       WHERE embedding IS NOT NULL
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      [embeddingStr, limit]
    );

    return result.rows;
  } catch (err) {
    console.error('[EmbeddingService] Error searching documents:', err.message);
    // Fallback: do a text-based search if vector search fails
    return fallbackTextSearch(queryText, limit);
  }
}

/**
 * Fallback text search using ILIKE when vector search is unavailable.
 * @param {string} queryText - The search query
 * @param {number} limit - Maximum results
 * @returns {Promise<Array>} Matching documents
 */
async function fallbackTextSearch(queryText, limit = 5) {
  try {
    const words = queryText.split(/\s+/).filter((w) => w.length > 2).slice(0, 5);
    if (words.length === 0) {
      return [];
    }

    const conditions = words.map((_, i) => `(title ILIKE $${i + 1} OR content ILIKE $${i + 1})`);
    const params = words.map((w) => `%${w}%`);

    const result = await db.query(
      `SELECT id, title, content, category, tags, 0.5 AS similarity
       FROM documents
       WHERE ${conditions.join(' OR ')}
       LIMIT $${params.length + 1}`,
      [...params, limit]
    );

    return result.rows;
  } catch (err) {
    console.error('[EmbeddingService] Fallback search failed:', err.message);
    return [];
  }
}

/**
 * Embed a document and store it in the database.
 * Used during seeding and when adding new documents.
 * @param {string} documentId - UUID of the document to embed
 * @returns {Promise<void>}
 */
async function embedDocument(documentId) {
  try {
    const doc = await db.query('SELECT id, title, content FROM documents WHERE id = $1', [documentId]);
    if (doc.rows.length === 0) {
      throw new Error(`Document ${documentId} not found.`);
    }

    const { title, content } = doc.rows[0];
    const textToEmbed = `${title}\n\n${content}`;
    const embedding = await generateEmbedding(textToEmbed);
    const embeddingStr = `[${embedding.join(',')}]`;

    await db.query('UPDATE documents SET embedding = $1::vector WHERE id = $2', [embeddingStr, documentId]);
  } catch (err) {
    console.error(`[EmbeddingService] Error embedding document ${documentId}:`, err.message);
    throw err;
  }
}

/**
 * Embed all documents that don't have embeddings yet.
 * @returns {Promise<number>} Count of newly embedded documents
 */
async function embedAllDocuments() {
  try {
    const result = await db.query('SELECT id FROM documents WHERE embedding IS NULL');
    let count = 0;

    for (const row of result.rows) {
      await embedDocument(row.id);
      count++;
    }

    console.log(`[EmbeddingService] Embedded ${count} documents.`);
    return count;
  } catch (err) {
    console.error('[EmbeddingService] Error embedding all documents:', err.message);
    return 0;
  }
}

module.exports = {
  generateEmbedding,
  searchDocuments,
  fallbackTextSearch,
  embedDocument,
  embedAllDocuments,
};
