import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userController.js';
import { validate, registerSchema, loginSchema } from '../middlewares/validationMiddleware.js';

// נתיב רישום משתמש חדש
router.post('/register', validate(registerSchema), userController.register);

// נתיב התחברות משתמש קיים
router.post('/login', validate(loginSchema), userController.login);

export default router;