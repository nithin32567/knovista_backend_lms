import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './shared/middleware/errorHandler';
import { sendSuccess } from './shared/utils/response';
import { createAuthRouter } from './modules/auth/presentation/routes/authRoutes';
import { createDashboardRouter } from './modules/dashboard/presentation/routes/dashboardRoutes';
import { createStudentRouter } from './modules/students/presentation/routes/studentRoutes';
import { createInstitutionUserRouter } from './modules/users/presentation/routes/institutionUserRoutes';
import { createCurriculumRouter } from './modules/curriculum/presentation/routes/curriculumRoutes';
import { createBatchRouter } from './modules/batch/presentation/routes/batchRoutes';
import { createNotificationRouter } from './modules/notification/presentation/routes/notificationRoutes';
import { createProgressRouter } from './modules/progress/presentation/routes/progressRoutes';

export function createApp(): Express {
  const app = express();

  app.use(helmet());

  const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.get('/health', (_req: Request, res: Response) => {
    sendSuccess(
      res,
      {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
      'Service healthy'
    );
  });

  const authRouter = createAuthRouter();
  app.use(`${env.API_PREFIX}/auth`, authRouter);
  app.use(env.API_PREFIX, authRouter);
  app.use('/api', authRouter);

  const dashboardRouter = createDashboardRouter();
  app.use(`${env.API_PREFIX}/dashboard`, dashboardRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/dashboard', dashboardRouter);

  const studentRouter = createStudentRouter();
  app.use(`${env.API_PREFIX}/students`, studentRouter);
  app.use('/api/students', studentRouter);
  app.use('/students', studentRouter);
  app.use(`${env.API_PREFIX}/student`, studentRouter);
  app.use('/api/student', studentRouter);
  app.use('/student', studentRouter);

  const institutionUserRouter = createInstitutionUserRouter();
  app.use(env.API_PREFIX, institutionUserRouter);
  app.use('/api', institutionUserRouter);
  app.use('/', institutionUserRouter);

  const curriculumRouter = createCurriculumRouter();
  app.use(env.API_PREFIX, curriculumRouter);
  app.use('/api', curriculumRouter);
  app.use('/', curriculumRouter);

  const batchRouter = createBatchRouter();
  app.use(env.API_PREFIX, batchRouter);
  app.use('/api', batchRouter);
  app.use('/', batchRouter);

  const notificationRouter = createNotificationRouter();
  app.use(env.API_PREFIX, notificationRouter);
  app.use('/api', notificationRouter);
  app.use('/', notificationRouter);

  const progressRouter = createProgressRouter();
  app.use(env.API_PREFIX, progressRouter);
  app.use('/api', progressRouter);
  app.use('/', progressRouter);

  app.use(errorHandler);

  return app;
}

export const app = createApp();
