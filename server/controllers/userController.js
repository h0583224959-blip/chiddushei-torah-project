import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { timingSafeEqual } from 'node:crypto';
import { createHttpError } from '../middlewares/httpError.js';

const configuredAdmins = () => [1, 2].map((number) => ({
  number,
  email: (process.env[`ADMIN_EMAIL_${number}`] || '').trim().toLowerCase(),
  password: process.env[`ADMIN_PASSWORD_${number}`] || ''
})).filter((admin) => admin.email);

const matchesSecret = (provided, expected) => {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
};

// פונקציית רישום משתמש חדש
export const register = async (req, res) => {
  const { username, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createHttpError('משתמש עם כתובת אימייל זו כבר קיים במערכת', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ username, email, password: hashedPassword, role: 'user' });

  res.status(201).json({
    message: 'המשתמש נרשם בהצלחה',
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    }
  });
};


// פונקציית התחברות משתמש קיים
export const login = async (req, res) => {
  const { email, password } = req.body;
  const adminAccount = configuredAdmins().find((admin) => admin.email === email);
  let user;

  if (adminAccount) {
    if (!adminAccount.password || !matchesSecret(password, adminAccount.password)) {
      throw createHttpError('פרטי התחברות שגויים', 401);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.findOne({ email });
    if (user) {
      user.username = user.username || email;
      user.password = hashedPassword;
      user.role = 'admin';
      await user.save();
    } else {
      user = await User.create({ username: email, email, password: hashedPassword, role: 'admin' });
    }
  } else {
    user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw createHttpError('פרטי התחברות שגויים', 401);
    }

    if (user.role === 'admin') {
      user.role = 'user';
      await user.save();
    }
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(200).json({
    message: 'התחברת בהצלחה',
    token,
    user: {
      id: user._id,
      username: user.username,
      greetingName: adminAccount ? `מנהל ${adminAccount.number}` : user.username,
      email: user.email,
      role: user.role
    }
  });
};