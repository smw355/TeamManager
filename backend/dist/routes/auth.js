"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.post('/demo-login', authController_1.demoLogin);
router.get('/me', authController_1.getCurrentUser);
exports.default = router;
//# sourceMappingURL=auth.js.map