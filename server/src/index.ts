import http from 'http';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import { initSocketServer } from './sockets/socketManager.js';
import routes from './routes/index.js';
import { setupSwagger } from './swagger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app: Express = express();
const httpServer = http.createServer(app);

// 1. Security & Core Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allows Swagger UI to load inline styles/scripts
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: '*', // Allows all origins for local development and deployed frontend
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. HTTP Request Logger
if (config.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 3. Initialize WebSocket / Real-time Engine
initSocketServer(httpServer);

// 4. Mount Interactive Swagger Documentation
setupSwagger(app);

// 5. Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'AutoMotion - Live Operations API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/api/health',
  });
});

// 6. Mount REST API Routes
app.use('/api', routes);

// 7. Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// 8. Start HTTP + WebSocket Server
const PORT = config.port;
httpServer.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 AutoMotion API Server running on port ${PORT}`);
  console.log(`📡 WebSocket server active and ready for live events`);
  console.log(`📖 Swagger API Docs available at: http://localhost:${PORT}/api/docs`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});

export default app;
