module.exports = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Anthropic
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,

  // Rate limiting
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 min
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // File generation
  maxProjectSizeMB: parseInt(process.env.MAX_PROJECT_SIZE_MB) || 50,
  tempDir: process.env.TEMP_DIR || './temp',
  outputDir: process.env.OUTPUT_DIR || './generated_projects',
};
