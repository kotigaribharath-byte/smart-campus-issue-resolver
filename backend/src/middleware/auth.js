import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { formatEntity } from '../utils/formatHelper.js';

export const authenticateUser = async (req, res, next) => {
  let token = null;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is missing. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'campusfix_jwt_super_secret_key_2026_secure'
    );

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { department: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact campus admin.',
      });
    }

    req.user = formatEntity(user);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user ? req.user.role : 'anonymous'}) is not authorized to access this resource.`,
      });
    }
    next();
  };
};
