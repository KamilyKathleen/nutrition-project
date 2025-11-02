import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'blogRoutes - Em desenvolvimento' });
});

export { router as blogRoutes };
