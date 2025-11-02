import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'dietPlanRoutes - Em desenvolvimento' });
});

export { router as dietPlanRoutes };
