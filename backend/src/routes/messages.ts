import { Router } from 'express';
import { getMessages, createMessage } from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All message routes require authentication
router.use(authenticateToken);

router.get('/:teamId', getMessages);
router.post('/:teamId', createMessage);

export default router;