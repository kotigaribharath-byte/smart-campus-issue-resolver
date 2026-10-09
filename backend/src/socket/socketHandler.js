let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // console.log(`Socket connected: ${socket.id}`);

    // Join specific user private room
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        // console.log(`Socket ${socket.id} joined user_${userId}`);
      }
    });

    // Join role-based room (e.g. 'admin_room', 'staff_room', 'student_room')
    socket.on('join_role_room', (role) => {
      if (role) {
        socket.join(`${role}_room`);
        // console.log(`Socket ${socket.id} joined ${role}_room`);
      }
    });

    // Join specific issue room for live chat/updates
    socket.on('join_issue_room', (issueId) => {
      if (issueId) {
        socket.join(`issue_${issueId}`);
      }
    });

    socket.on('leave_issue_room', (issueId) => {
      if (issueId) {
        socket.leave(`issue_${issueId}`);
      }
    });

    socket.on('disconnect', () => {
      // console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized!');
  }
  return ioInstance;
};

// Real-time notification helper
export const emitNotification = (userId, notificationData) => {
  if (ioInstance && userId) {
    ioInstance.to(`user_${userId}`).emit('notification_received', notificationData);
  }
};

// Real-time issue event broadcaster
export const broadcastIssueEvent = (eventName, data, { userIds = [], roles = [] } = {}) => {
  if (!ioInstance) return;

  // Broadcast to specific issue room if issue ID is available
  if (data && data._id) {
    ioInstance.to(`issue_${data._id}`).emit(eventName, data);
  }

  // Broadcast to target roles
  roles.forEach((role) => {
    ioInstance.to(`${role}_room`).emit(eventName, data);
  });

  // Broadcast to individual users
  userIds.forEach((userId) => {
    if (userId) {
      ioInstance.to(`user_${userId}`).emit(eventName, data);
    }
  });
};
