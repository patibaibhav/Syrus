/**
 * @module server
 * @description Entry point for the Onboarding Agent API server.
 * Loads environment variables, initializes the Express app, and starts listening.
 */

require('dotenv').config();

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 Onboarding Agent API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});
