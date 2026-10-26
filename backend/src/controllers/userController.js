import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { formatEntity } from '../utils/formatHelper.js';
import { sendTechnicianWelcomeEmail } from '../utils/mailer.js';

// @desc    Get all users with role filtering & search
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
  try {
    const { role, search, department } = req.query;
    const where = {};

    if (role && role !== 'all') {
      where.role = role;
    }
    if (department && department !== 'all') {
      where.departmentId = department;
    }
    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { studentId: { contains: q, mode: 'insensitive' } },
        { staffId: { contains: q, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: { department: true },
      orderBy: { createdAt: 'desc' },
    });

    const sanitizedUsers = users.map((u) => {
      const { password, ...safeUser } = u;
      return formatEntity(safeUser);
    });

    res.status(200).json({
      success: true,
      count: sanitizedUsers.length,
      users: sanitizedUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin)
export const getUserById = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { department: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password, ...safeUser } = user;
    res.status(200).json({ success: true, user: formatEntity(safeUser) });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new user (Staff, Admin, Student)
// @route   POST /api/users
// @access  Private (Admin)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, department, studentId, staffId } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required.',
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'Campus@123', salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'student',
        phone: phone || '',
        departmentId: department || null,
        studentId: studentId || '',
        staffId: staffId || '',
        profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4f46e5,0ea5e9,10b981`,
      },
      include: {
        department: true,
      },
    });

    const { password: _, ...safeUser } = user;

    // Send onboarding credentials email to technician
    if (user.role === 'staff') {
      sendTechnicianWelcomeEmail({
        toEmail: user.email,
        name: user.name,
        staffId: user.staffId || 'STF-GEN',
        departmentName: user.department?.name || 'General Maintenance',
        temporaryPassword: password || 'Staff@123',
        phone: user.phone || '',
      }).catch((err) => console.error('Failed to dispatch technician onboarding email:', err));
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: formatEntity(safeUser),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res, next) => {
  try {
    const { name, role, phone, department, active, studentId, staffId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (role) dataToUpdate.role = role;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (department !== undefined) dataToUpdate.departmentId = department || null;
    if (active !== undefined) dataToUpdate.active = active;
    if (studentId !== undefined) dataToUpdate.studentId = studentId;
    if (staffId !== undefined) dataToUpdate.staffId = staffId;

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: dataToUpdate,
      include: { department: true },
    });

    const { password: _, ...safeUser } = updated;

    res.status(200).json({
      success: true,
      message: 'User details updated successfully.',
      user: formatEntity(safeUser),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const currentAdminId = req.user.id || req.user._id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting self
    if (user.id === currentAdminId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrative account.',
      });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({
      success: true,
      message: 'User account removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
