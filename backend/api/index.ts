import app from '../src/app';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default app;

// Handler para Vercel Serverless Functions
export const handler = (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};
