import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'reportRoutes - Em desenvolvimento' });
});

export { router as reportRoutes };
