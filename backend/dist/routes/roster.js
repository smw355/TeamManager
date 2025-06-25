"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rosterController_1 = require("../controllers/rosterController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All roster routes require authentication
router.use(auth_1.authenticateToken);
router.get('/:teamId/players', rosterController_1.getPlayers);
router.post('/:teamId/players', rosterController_1.createPlayer);
router.put('/:teamId/players/:playerId', rosterController_1.updatePlayer);
router.delete('/:teamId/players/:playerId', rosterController_1.deletePlayer);
exports.default = router;
//# sourceMappingURL=roster.js.map