import prisma from '../config/prisma.js';
import { generateComplaintId } from '../utils/idGenerator.js';
import { suggestDepartmentForCategory } from '../utils/smartAssignment.js';
import { emitNotification, broadcastIssueEvent } from '../socket/socketHandler.js';
import { formatEntity } from '../utils/formatHelper.js';

// Common issue include fields for Prisma queries
const issueIncludes = {
  reportedBy: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      studentId: true,
      profileImage: true,
      role: true,
    },
  },
  assignedTo: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      staffId: true,
      profileImage: true,
      role: true,
      department: true,
    },
  },
  department: true,
  building: true,
};

// @desc    Create a new issue/complaint
// @route   POST /api/issues
// @access  Private (Student, Staff, Admin)
export const createIssue = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      building,
      floor,
      location,
      imageUrls,
      departmentId,
    } = req.body;

    const currentUserId = req.user.id || req.user._id;

    if (!title || !description || !category || !building || !floor || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, building, floor, and location.',
      });
    }

    const complaintId = await generateComplaintId();

    // Smart department assignment if not explicitly selected
    let assignedDepartmentId = departmentId;
    if (!assignedDepartmentId) {
      const suggestedDept = await suggestDepartmentForCategory(category);
      if (suggestedDept) {
        assignedDepartmentId = suggestedDept.id;
      }
    }

    const issue = await prisma.issue.create({
      data: {
        complaintId,
        title,
        description,
        category,
        priority: priority || 'Medium',
        status: 'Submitted',
        buildingId: building,
        floor,
        location,
        imageUrls: Array.isArray(imageUrls) ? imageUrls : (imageUrls ? [imageUrls] : []),
        reportedById: currentUserId,
        departmentId: assignedDepartmentId || null,
      },
      include: issueIncludes,
    });

    // Create initial timeline entry
    await prisma.issueUpdate.create({
      data: {
        issueId: issue.id,
        updatedById: currentUserId,
        previousStatus: '',
        newStatus: 'Submitted',
        comment: 'Complaint officially registered in the system.',
        actionType: 'created',
      },
    });

    const formattedIssue = formatEntity(issue);

    // Real-time broadcast
    broadcastIssueEvent('issue_created', formattedIssue, {
      roles: ['admin', 'staff'],
    });

    // In-app notification for the user
    const studentNotif = await prisma.notification.create({
      data: {
        userId: currentUserId,
        issueId: issue.id,
        message: `Your complaint #${complaintId} (${title}) has been registered successfully.`,
        type: 'status_update',
      },
    });

    emitNotification(currentUserId, formatEntity(studentNotif));

    res.status(201).json({
      success: true,
      message: 'Issue submitted successfully.',
      issue: formattedIssue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all issues with dynamic filtering, search & pagination
// @route   GET /api/issues
// @access  Private
export const getIssues = async (req, res, next) => {
  try {
    const {
      status,
      category,
      priority,
      building,
      department,
      assignedTo,
      reportedBy,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      myIssuesOnly,
    } = req.query;

    const currentUserId = req.user.id || req.user._id;
    const where = {};

    // Role-based scoping
    if (req.user.role === 'student' || myIssuesOnly === 'true') {
      where.reportedById = currentUserId;
    } else if (req.user.role === 'staff' && !req.query.allStaffAccess) {
      if (req.query.assignedOnly === 'true') {
        where.assignedToId = currentUserId;
      }
    }

    if (reportedBy && req.user.role === 'admin') {
      where.reportedById = reportedBy;
    }

    if (assignedTo) {
      where.assignedToId = assignedTo;
    }

    // Direct filters
    if (status && status !== 'all') {
      where.status = status;
    }
    if (category && category !== 'all') {
      where.category = category;
    }
    if (priority && priority !== 'all') {
      where.priority = priority;
    }
    if (building && building !== 'all') {
      where.buildingId = building;
    }
    if (department && department !== 'all') {
      where.departmentId = department;
    }

    // Search filter across complaintId, title, description, location, category
    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { complaintId: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const orderBy = {
      [sortBy]: sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc',
    };

    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        include: issueIncludes,
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.issue.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      count: issues.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      issues: formatEntity(issues),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single issue details with timeline & feedback
// @route   GET /api/issues/:id
// @access  Private
export const getIssueById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id || req.user._id;

    let issue = null;
    if (id.startsWith('CFX-')) {
      issue = await prisma.issue.findUnique({
        where: { complaintId: id.toUpperCase() },
        include: issueIncludes,
      });
    } else {
      issue = await prisma.issue.findUnique({
        where: { id },
        include: issueIncludes,
      });
    }

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found.',
      });
    }

    // Student privacy: students can only see their own issues unless admin/staff
    if (req.user.role === 'student' && issue.reportedById !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this complaint.',
      });
    }

    // Fetch timeline updates
    const updates = await prisma.issueUpdate.findMany({
      where: { issueId: issue.id },
      include: {
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profileImage: true,
            staffId: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Fetch feedback if any
    const feedback = await prisma.feedback.findUnique({
      where: { issueId: issue.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      issue: formatEntity(issue),
      timeline: formatEntity(updates),
      feedback: feedback ? formatEntity(feedback) : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update issue details
// @route   PUT /api/issues/:id
// @access  Private (Admin, Staff)
export const updateIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, priority, building, floor, location, department } = req.body;

    const existing = await prisma.issue.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const dataToUpdate = {};
    if (title) dataToUpdate.title = title;
    if (description) dataToUpdate.description = description;
    if (category) dataToUpdate.category = category;
    if (priority) dataToUpdate.priority = priority;
    if (building) dataToUpdate.buildingId = building;
    if (floor) dataToUpdate.floor = floor;
    if (location) dataToUpdate.location = location;
    if (department !== undefined) dataToUpdate.departmentId = department || null;

    const updated = await prisma.issue.update({
      where: { id },
      data: dataToUpdate,
      include: issueIncludes,
    });

    res.status(200).json({
      success: true,
      message: 'Issue details updated successfully.',
      issue: formatEntity(updated),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status
// @route   PUT /api/issues/:id/status
// @access  Private (Staff, Admin)
export const updateIssueStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, comment, imageUrl } = req.body;
    const currentUserId = req.user.id || req.user._id;

    const validStatuses = [
      'Submitted',
      'Assigned',
      'In Progress',
      'On Hold',
      'Resolved',
      'Closed',
      'Reopened',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const issue = await prisma.issue.findUnique({
      where: { id },
    });

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Role check: Staff can only update if assigned to them
    if (req.user.role === 'staff') {
      if (issue.assignedToId && issue.assignedToId !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update status for complaints assigned directly to you.',
        });
      }
    }

    const previousStatus = issue.status;
    let resolvedAt = issue.resolvedAt;

    if (status === 'Resolved' && !issue.resolvedAt) {
      resolvedAt = new Date();
    } else if (status !== 'Resolved' && status !== 'Closed') {
      resolvedAt = null;
    }

    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: {
        status,
        resolvedAt,
      },
      include: issueIncludes,
    });

    // Create timeline update
    const updateRecord = await prisma.issueUpdate.create({
      data: {
        issueId: issue.id,
        updatedById: currentUserId,
        previousStatus,
        newStatus: status,
        comment: comment || `Status updated from ${previousStatus} to ${status}.`,
        imageUrl: imageUrl || '',
        actionType: status === 'Resolved' ? 'resolved' : 'status_change',
      },
      include: {
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profileImage: true,
            staffId: true,
          },
        },
      },
    });

    const formattedIssue = formatEntity(updatedIssue);
    const formattedUpdate = formatEntity(updateRecord);

    // Create Notification for the reporting student
    const notifMessage = `Complaint ${issue.complaintId} status changed to ${status}${comment ? `: "${comment}"` : '.'}`;
    const studentNotification = await prisma.notification.create({
      data: {
        userId: issue.reportedById,
        issueId: issue.id,
        message: notifMessage,
        type: 'status_update',
      },
    });

    emitNotification(issue.reportedById, formatEntity(studentNotification));

    // Broadcast live event via Socket.IO
    broadcastIssueEvent('issue_status_updated', {
      issue: formattedIssue,
      update: formattedUpdate,
      message: notifMessage,
    }, {
      userIds: [issue.reportedById, issue.assignedToId].filter(Boolean),
      roles: ['admin', 'staff'],
    });

    res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status}.`,
      issue: formattedIssue,
      update: formattedUpdate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign issue to staff / department
// @route   PUT /api/issues/:id/assign
// @access  Private (Admin)
export const assignIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { staffId, departmentId, priority, comment } = req.body;
    const currentUserId = req.user.id || req.user._id;

    const issue = await prisma.issue.findUnique({
      where: { id },
    });

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    let staff = null;
    if (staffId) {
      staff = await prisma.user.findUnique({
        where: { id: staffId },
      });
      if (!staff || staff.role !== 'staff') {
        return res.status(400).json({
          success: false,
          message: 'Selected user is not a valid maintenance staff member.',
        });
      }
    }

    const dataToUpdate = {};
    if (staffId) dataToUpdate.assignedToId = staffId;
    if (departmentId) dataToUpdate.departmentId = departmentId;
    if (priority) dataToUpdate.priority = priority;

    const prevStatus = issue.status;
    if (issue.status === 'Submitted') {
      dataToUpdate.status = 'Assigned';
    }

    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: dataToUpdate,
      include: issueIncludes,
    });

    const staffName = staff ? staff.name : 'Staff';
    const deptName = updatedIssue.department ? updatedIssue.department.name : 'Department';
    const updateComment = comment || `Assigned to ${deptName} (${staffName}).`;

    const updateRecord = await prisma.issueUpdate.create({
      data: {
        issueId: issue.id,
        updatedById: currentUserId,
        previousStatus: prevStatus,
        newStatus: updatedIssue.status,
        comment: updateComment,
        actionType: 'assigned',
      },
      include: {
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profileImage: true,
            staffId: true,
          },
        },
      },
    });

    const formattedIssue = formatEntity(updatedIssue);
    const formattedUpdate = formatEntity(updateRecord);

    // Notify assigned staff
    if (staff) {
      const staffNotif = await prisma.notification.create({
        data: {
          userId: staff.id,
          issueId: issue.id,
          message: `New task assigned: ${issue.complaintId} - "${issue.title}" [Priority: ${updatedIssue.priority}]`,
          type: 'assignment',
        },
      });
      emitNotification(staff.id, formatEntity(staffNotif));
    }

    // Notify student
    const studentNotif = await prisma.notification.create({
      data: {
        userId: issue.reportedById,
        issueId: issue.id,
        message: `Complaint ${issue.complaintId} has been assigned to ${staffName} (${deptName}).`,
        type: 'assignment',
      },
    });
    emitNotification(issue.reportedById, formatEntity(studentNotif));

    // Broadcast live event
    broadcastIssueEvent('issue_assigned', {
      issue: formattedIssue,
      update: formattedUpdate,
    }, {
      userIds: [issue.reportedById, staff?.id].filter(Boolean),
      roles: ['admin', 'staff'],
    });

    res.status(200).json({
      success: true,
      message: 'Issue successfully assigned.',
      issue: formattedIssue,
      update: formattedUpdate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment / progress note with optional image
// @route   POST /api/issues/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment, imageUrl } = req.body;
    const currentUserId = req.user.id || req.user._id;

    if (!comment || comment.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty.',
      });
    }

    const issue = await prisma.issue.findUnique({
      where: { id },
    });

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const updateRecord = await prisma.issueUpdate.create({
      data: {
        issueId: issue.id,
        updatedById: currentUserId,
        previousStatus: issue.status,
        newStatus: issue.status,
        comment: comment.trim(),
        imageUrl: imageUrl || '',
        actionType: 'comment',
      },
      include: {
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profileImage: true,
            staffId: true,
          },
        },
      },
    });

    const isReporter = issue.reportedById === currentUserId;
    const targetUserId = isReporter ? issue.assignedToId : issue.reportedById;

    if (targetUserId) {
      const notif = await prisma.notification.create({
        data: {
          userId: targetUserId,
          issueId: issue.id,
          message: `${req.user.name} added a comment on ${issue.complaintId}: "${comment.slice(0, 60)}..."`,
          type: 'comment',
        },
      });
      emitNotification(targetUserId, formatEntity(notif));
    }

    const formattedUpdate = formatEntity(updateRecord);

    broadcastIssueEvent('issue_comment_added', {
      issueId: issue.id,
      comment: formattedUpdate,
    }, {
      userIds: [issue.reportedById, issue.assignedToId].filter(Boolean),
      roles: ['admin'],
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      comment: formattedUpdate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reopen a resolved issue
// @route   POST /api/issues/:id/reopen
// @access  Private (Student, Admin)
export const reopenIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, imageUrl } = req.body;
    const currentUserId = req.user.id || req.user._id;

    const issue = await prisma.issue.findUnique({
      where: { id },
    });

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Only original reporter or admin can reopen
    if (req.user.role === 'student' && issue.reportedById !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'You can only reopen complaints reported by you.',
      });
    }

    if (!['Resolved', 'Closed'].includes(issue.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only resolved or closed complaints can be reopened.',
      });
    }

    const prevStatus = issue.status;
    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: {
        status: 'Reopened',
        resolvedAt: null,
        reopenCount: { increment: 1 },
      },
      include: issueIncludes,
    });

    const updateRecord = await prisma.issueUpdate.create({
      data: {
        issueId: issue.id,
        updatedById: currentUserId,
        previousStatus: prevStatus,
        newStatus: 'Reopened',
        comment: reason ? `Issue reopened by student: "${reason}"` : 'Issue reopened due to unsatisfactory resolution.',
        imageUrl: imageUrl || '',
        actionType: 'reopened',
      },
      include: {
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profileImage: true,
            staffId: true,
          },
        },
      },
    });

    const formattedIssue = formatEntity(updatedIssue);
    const formattedUpdate = formatEntity(updateRecord);

    if (issue.assignedToId) {
      const staffNotif = await prisma.notification.create({
        data: {
          userId: issue.assignedToId,
          issueId: issue.id,
          message: `Complaint ${issue.complaintId} has been REOPENED by student.`,
          type: 'reopened',
        },
      });
      emitNotification(issue.assignedToId, formatEntity(staffNotif));
    }

    broadcastIssueEvent('issue_reopened', {
      issue: formattedIssue,
      update: formattedUpdate,
    }, {
      userIds: [issue.assignedToId].filter(Boolean),
      roles: ['admin', 'staff'],
    });

    res.status(200).json({
      success: true,
      message: 'Issue has been reopened.',
      issue: formattedIssue,
      update: formattedUpdate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private (Admin)
export const deleteIssue = async (req, res, next) => {
  try {
    const { id } = req.params;

    const issue = await prisma.issue.findUnique({
      where: { id },
    });

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    await prisma.issue.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Issue and associated history permanently deleted.',
    });
  } catch (error) {
    next(error);
  }
};
