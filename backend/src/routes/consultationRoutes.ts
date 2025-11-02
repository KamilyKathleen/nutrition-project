import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'consultationRoutes - Em desenvolvimento' });
});

export { router as consultationRoutes };
