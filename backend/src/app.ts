import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env';

// TODO PHASE 2: Import routes
// import authRoutes from './routes/auth.routes';
// import userRoutes from './routes/user.routes';
// import providerRoutes from './routes/provider.routes';
// import requestRoutes from './routes/request.routes';

const app: Application = express();

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// TODO PHASE 2: Register routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/providers', providerRoutes);
// app.use('/api/requests', requestRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

export default app;
