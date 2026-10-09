import prisma from '../config/prisma.js';
import { formatEntity } from '../utils/formatHelper.js';

// @desc    Get all staff members with department and active workload count
// @route   GET /api/staff
// @access  Private (Admin, Staff)
export const getStaffMembers = async (req, res, next) => {
  try {
    const { department } = req.query;
    const where = { role: 'staff', active: true };

    if (department && department !== 'all') {
      where.departmentId = department;
    }

    const staffList = await prisma.user.findMany({
      where,
      include: { department: true },
      orderBy: { name: 'asc' },
    });

    // Calculate active assigned issues for each staff member
    const staffWithWorkload = await Promise.all(
      staffList.map(async (staff) => {
        const [activeCount, resolvedCount] = await Promise.all([
          prisma.issue.count({
            where: {
              assignedToId: staff.id,
              status: { in: ['Assigned', 'In Progress', 'Reopened', 'On Hold'] },
            },
          }),
          prisma.issue.count({
            where: {
              assignedToId: staff.id,
              status: { in: ['Resolved', 'Closed'] },
            },
          }),
        ]);

        const { password, ...staffData } = staff;
        return {
          ...formatEntity(staffData),
          activeIssuesCount: activeCount,
          resolvedIssuesCount: resolvedCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: staffWithWorkload.length,
      staff: staffWithWorkload,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get issues assigned to a specific staff member
// @route   GET /api/staff/:id/issues
// @access  Private (Staff, Admin)
export const getStaffIssues = async (req, res, next) => {
  try {
    const staffId = req.params.id;
    const { status, priority } = req.query;

    const where = { assignedToId: staffId };
    if (status && status !== 'all') where.status = status;
    if (priority && priority !== 'all') where.priority = priority;

    const issues = await prisma.issue.findMany({
      where,
      include: {
        reportedBy: { select: { id: true, name: true, email: true, phone: true, studentId: true, profileImage: true } },
        building: true,
        department: true,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    res.status(200).json({
      success: true,
      count: issues.length,
      issues: formatEntity(issues),
    });
  } catch (error) {
    next(error);
  }
};
