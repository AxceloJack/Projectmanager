import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import taskRoutes from './routes/tasks.js';
import publicRoutes from './routes/public.js';
import slackRoutes from './routes/slack.js';
import adminRoutes from './routes/admin.js';
import formsRoutes from './routes/forms.js';
import financeRoutes from './routes/finance.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// This is a live dashboard — never let the browser serve stale API reads
// from cache (that showed up as "I have to refresh to see my changes").
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/slack', slackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/forms', formsRoutes);
app.use('/api/finance', financeRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
