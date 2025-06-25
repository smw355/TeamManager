import { Router } from 'express';
import { register, login, demoLogin, getCurrentUser } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.get('/me', getCurrentUser);

export default router;