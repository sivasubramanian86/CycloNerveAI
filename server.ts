/**
 * CycloNerveAI - Full-Stack Express Server Entry Point
 * Mounts server-side REST API endpoints for cloud & mock adapters,
 * and attaches Vite development middleware or static production client.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/routes/apiRouter.ts';
import { serverConfig } from './src/server/config/serverConfig.ts';
import { securityHeadersMiddleware } from './src/server/security/securityHeaders.ts';
import { safeErrorHandler } from './src/server/security/safeErrorHandler.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createServer() {
  const app = express();
  const isProd = process.env.NODE_ENV === 'production';

  // Apply defensive HTTP security headers
  app.use(securityHeadersMiddleware());

  // Body parser with strict size ceiling
  app.use(express.json({ limit: '15mb' }));

  // Mount server-side API routes
  app.use('/api', apiRouter);

  // Safe error handling for internal errors
  app.use(safeErrorHandler());

  if (!isProd) {
    // Development mode: mount Vite dev middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built assets from dist directory
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  return app;
}

// Start server if directly invoked
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  const PORT = serverConfig.port;
  createServer()
    .then((app) => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`[CycloNerveAI] Server listening on http://0.0.0.0:${PORT} [${serverConfig.globalAdapterMode} mode]`);
      });
    })
    .catch((err) => {
      console.error('[CycloNerveAI] Server failed to start:', err);
      process.exit(1);
    });
}
