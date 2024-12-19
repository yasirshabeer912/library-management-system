import jwt from 'jsonwebtoken';
import { User } from '../models/mysql/index.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

export const authorizeLibrarian = (req, res, next) => {
  if (req.user.role !== 'librarian') {
    return res.status(403).json({ message: 'Access denied. Librarian role required.' });
  }
  next();
};

