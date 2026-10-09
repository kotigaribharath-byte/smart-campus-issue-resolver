import prisma from '../config/prisma.js';
import { formatEntity } from '../utils/formatHelper.js';

// @desc    Get logged in user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      include: {
        issue: {
          select: {
            id: true,
            complaintId: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    // Remap issue to issueId for frontend compatibility if needed
    const formattedNotifications = notifications.map((n) => {
      const formatted = formatEntity(n);
      return {
        ...formatted,
        issueId: formatted.issue || formatted.issueId,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedNotifications.length,
      unreadCount,
      notifications: formattedNotifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      notification: formatEntity(updated),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Notification deleted.',
    });
  } catch (error) {
    next(error);
  }
};
