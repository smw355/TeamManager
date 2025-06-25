import { Router } from 'express';
import { getPlayers, createPlayer, updatePlayer, deletePlayer } from '../controllers/rosterController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All roster routes require authentication
router.use(authenticateToken);

router.get('/:teamId/players', getPlayers);
router.post('/:teamId/players', createPlayer);
router.put('/:teamId/players/:playerId', updatePlayer);
router.delete('/:teamId/players/:playerId', deletePlayer);

export default router;