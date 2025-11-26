import { Router } from 'express';
import { UserModel } from '../models/User';

const router = Router();

// Endpoint temporário para debug
router.get('/debug/users', async (req, res) => {
  try {
    const users = await UserModel.find({}).limit(10);
    const emails = users.map(user => user.email);
    
    res.json({
      totalUsers: await UserModel.countDocuments(),
      emails: emails,
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/debug/check/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const user = await UserModel.findOne({ email });
    
    res.json({
      email: email,
      exists: !!user,
      user: user ? { id: user._id, email: user.email, name: user.name } : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as debugRoutes };