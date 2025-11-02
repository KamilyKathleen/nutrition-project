import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'nutritionalAssessmentRoutes - Em desenvolvimento' });
});

export { router as nutritionalAssessmentRoutes };
