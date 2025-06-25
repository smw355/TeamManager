"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messageController_1 = require("../controllers/messageController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All message routes require authentication
router.use(auth_1.authenticateToken);
router.get('/:teamId', messageController_1.getMessages);
router.post('/:teamId', messageController_1.createMessage);
exports.default = router;
//# sourceMappingURL=messages.js.map