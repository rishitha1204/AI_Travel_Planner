import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import * as authController from './auth.controller.js';

const router = Router();

router.post('/register', authLimiter, validateRequest(registerSchema), authController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;