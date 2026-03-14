/**
 * @module services/embeddingService
 * @description Lightweight local document search used for offline demo mode.
 */

const localStore = require('../data/localStore');

async function generateEmbedding() {
  return [];
}

async function searchDocuments(queryText, limit = 5) {
  try {
    return localStore.searchDocuments(queryText, limit);
  } catch (err) {
    console.error('[EmbeddingService] Error searching documents:', err.message);
    return fallbackTextSearch(queryText, limit);
  }
}

async function fallbackTextSearch(queryText, limit = 5) {
  try {
    return localStore.searchDocuments(queryText, limit);
  } catch (err) {
    console.error('[EmbeddingService] Fallback search failed:', err.message);
    return [];
  }
}

async function embedDocument() {
  return;
}

async function embedAllDocuments() {
  return localStore.getDocuments().length;
}

module.exports = {
  generateEmbedding,
  searchDocuments,
  fallbackTextSearch,
  embedDocument,
  embedAllDocuments,
};
