import prisma from '../config/prisma.js';
import { formatEntity } from '../utils/formatHelper.js';

// @desc    Get Admin Dashboard Analytics & Aggregated Metrics
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
export const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalIssues,
      submittedCount,
      assignedCount,
      inProgressCount,
      onHoldCount,
      resolvedCount,
      closedCount,
      reopenedCount,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      totalStudents,
      totalStaff,
      totalBuildings,
      totalDepartments,
    ] = await Promise.all([
      prisma.issue.count(),
      prisma.issue.count({ where: { status: 'Submitted' } }),
      prisma.issue.count({ where: { status: 'Assigned' } }),
      prisma.issue.count({ where: { status: 'In Progress' } }),
      prisma.issue.count({ where: { status: 'On Hold' } }),
      prisma.issue.count({ where: { status: 'Resolved' } }),
      prisma.issue.count({ where: { status: 'Closed' } }),
      prisma.issue.count({ where: { status: 'Reopened' } }),
      prisma.issue.count({ where: { priority: 'Critical' } }),
      prisma.issue.count({ where: { priority: 'High' } }),
      prisma.issue.count({ where: { priority: 'Medium' } }),
      prisma.issue.count({ where: { priority: 'Low' } }),
      prisma.user.count({ where: { role: 'student', active: true } }),
      prisma.user.count({ where: { role: 'staff', active: true } }),
      prisma.building.count(),
      prisma.department.count({ where: { active: true } }),
    ]);

    const pendingTotal = submittedCount + assignedCount + inProgressCount + onHoldCount + reopenedCount;
    const resolvedTotal = resolvedCount + closedCount;

    // 1. Complaints by Category
    const categoryGroup = await prisma.issue.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: {
        _count: { id: 'desc' },
      },
    });

    const categoryStats = categoryGroup.map((item) => ({
      name: item.category,
      count: item._count.id,
    }));

    // 2. Complaints by Priority
    const priorityStats = [
      { name: 'Critical', count: criticalCount, color: '#ef4444' },
      { name: 'High', count: highCount, color: '#f97316' },
      { name: 'Medium', count: mediumCount, color: '#eab308' },
      { name: 'Low', count: lowCount, color: '#3b82f6' },
    ];

    // 3. Complaints by Status
    const statusStats = [
      { name: 'Submitted', count: submittedCount, color: '#94a3b8' },
      { name: 'Assigned', count: assignedCount, color: '#6366f1' },
      { name: 'In Progress', count: inProgressCount, color: '#0ea5e9' },
      { name: 'On Hold', count: onHoldCount, color: '#f59e0b' },
      { name: 'Resolved', count: resolvedCount, color: '#10b981' },
      { name: 'Reopened', count: reopenedCount, color: '#f43f5e' },
      { name: 'Closed', count: closedCount, color: '#64748b' },
    ];

    // 4. Complaints by Building
    const buildings = await prisma.building.findMany({
      orderBy: { name: 'asc' },
    });

    const buildingStats = await Promise.all(
      buildings.map(async (b) => {
        const [count, pending, resolved] = await Promise.all([
          prisma.issue.count({ where: { buildingId: b.id } }),
          prisma.issue.count({
            where: {
              buildingId: b.id,
              status: { in: ['Submitted', 'Assigned', 'In Progress', 'On Hold', 'Reopened'] },
            },
          }),
          prisma.issue.count({
            where: {
              buildingId: b.id,
              status: { in: ['Resolved', 'Closed'] },
            },
          }),
        ]);

        return {
          name: b.name,
          count,
          pending,
          resolved,
        };
      })
    );
    buildingStats.sort((a, b) => b.count - a.count);

    // 5. Average Resolution Time (in hours)
    const resolvedIssuesWithDates = await prisma.issue.findMany({
      where: {
        status: { in: ['Resolved', 'Closed'] },
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    });

    let avgResolutionHours = 14.5;
    if (resolvedIssuesWithDates.length > 0) {
      const totalHours = resolvedIssuesWithDates.reduce((acc, issue) => {
        const diffMs = new Date(issue.resolvedAt).getTime() - new Date(issue.createdAt).getTime();
        return acc + diffMs / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = parseFloat((totalHours / resolvedIssuesWithDates.length).toFixed(1));
    }

    // 6. Monthly / Timeline Trends
    const allIssuesForTrends = await prisma.issue.findMany({
      select: {
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const trendMap = {};
    allIssuesForTrends.forEach((issue) => {
      const d = new Date(issue.createdAt);
      const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!trendMap[period]) {
        trendMap[period] = { period, submitted: 0, resolved: 0 };
      }
      trendMap[period].submitted += 1;
      if (['Resolved', 'Closed'].includes(issue.status)) {
        trendMap[period].resolved += 1;
      }
    });

    const monthlyTrends = Object.values(trendMap).sort((a, b) => a.period.localeCompare(b.period));

    // 7. Staff Performance Leaderboard
    const staffList = await prisma.user.findMany({
      where: { role: 'staff', active: true },
      include: { department: true },
    });

    const staffPerformance = await Promise.all(
      staffList.map(async (st) => {
        const [assignedTotal, resolvedTasks] = await Promise.all([
          prisma.issue.count({ where: { assignedToId: st.id } }),
          prisma.issue.count({
            where: {
              assignedToId: st.id,
              status: { in: ['Resolved', 'Closed'] },
            },
          }),
        ]);

        const staffFeedbackAgg = await prisma.feedback.aggregate({
          where: {
            issue: {
              assignedToId: st.id,
            },
          },
          _avg: { rating: true },
          _count: { rating: true },
        });

        const avgRating = staffFeedbackAgg._avg.rating || 5.0;
        const feedbackCount = staffFeedbackAgg._count.rating || 0;

        return {
          id: st.id,
          name: st.name,
          email: st.email,
          staffId: st.staffId,
          department: st.department ? st.department.name : 'General',
          profileImage: st.profileImage,
          assignedTotal,
          resolvedCount: resolvedTasks,
          resolutionRate: assignedTotal > 0 ? Math.round((resolvedTasks / assignedTotal) * 100) : 0,
          averageRating: parseFloat(avgRating.toFixed(1)),
          feedbackCount,
        };
      })
    );

    staffPerformance.sort((a, b) => b.resolvedCount - a.resolvedCount);

    // 8. Recent 6 Critical / High / general issues
    const recentIssues = await prisma.issue.findMany({
      include: {
        reportedBy: { select: { id: true, name: true, email: true, studentId: true } },
        assignedTo: { select: { id: true, name: true, email: true, staffId: true } },
        department: { select: { id: true, name: true } },
        building: { select: { id: true, name: true, block: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    // 9. Overall Feedback Stats
    const feedbackSummary = await prisma.feedback.aggregate({
      _avg: { rating: true },
      _count: { rating: true },
    });

    const overallRating = feedbackSummary._avg.rating
      ? parseFloat(feedbackSummary._avg.rating.toFixed(1))
      : 4.6;

    res.status(200).json({
      success: true,
      stats: {
        totalIssues,
        pendingIssues: pendingTotal,
        inProgressIssues: inProgressCount,
        resolvedIssues: resolvedTotal,
        criticalIssues: criticalCount,
        highIssues: highCount,
        avgResolutionHours,
        overallRating,
        totalStudents,
        totalStaff,
        totalBuildings,
        totalDepartments,
        mostCommonCategory: categoryStats[0]?.name || 'Electrical',
        mostProblematicBuilding: buildingStats[0]?.name || 'Engineering Block A',
      },
      charts: {
        categoryStats,
        priorityStats,
        statusStats,
        buildingStats,
        monthlyTrends,
      },
      staffPerformance,
      recentIssues: formatEntity(recentIssues),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Student Dashboard Data
// @route   GET /api/dashboard/student
// @access  Private (Student)
export const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user.id || req.user._id;

    const [
      totalReported,
      submittedCount,
      inProgressCount,
      resolvedCount,
      reopenedCount,
      recentIssues,
    ] = await Promise.all([
      prisma.issue.count({ where: { reportedById: studentId } }),
      prisma.issue.count({
        where: {
          reportedById: studentId,
          status: { in: ['Submitted', 'Assigned'] },
        },
      }),
      prisma.issue.count({
        where: {
          reportedById: studentId,
          status: { in: ['In Progress', 'On Hold'] },
        },
      }),
      prisma.issue.count({
        where: {
          reportedById: studentId,
          status: { in: ['Resolved', 'Closed'] },
        },
      }),
      prisma.issue.count({
        where: {
          reportedById: studentId,
          status: 'Reopened',
        },
      }),
      prisma.issue.findMany({
        where: { reportedById: studentId },
        include: {
          assignedTo: { select: { id: true, name: true, email: true, phone: true, staffId: true } },
          department: true,
          building: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Issues pending rating/feedback
    const resolvedWithoutFeedback = await prisma.issue.findMany({
      where: {
        reportedById: studentId,
        status: { in: ['Resolved', 'Closed'] },
        feedback: null,
      },
      select: {
        id: true,
        title: true,
        complaintId: true,
        category: true,
        resolvedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      stats: {
        totalReported,
        submittedCount,
        inProgressCount,
        resolvedCount,
        reopenedCount,
      },
      recentIssues: formatEntity(recentIssues),
      awaitingFeedback: formatEntity(resolvedWithoutFeedback),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Staff Dashboard Data
// @route   GET /api/dashboard/staff
// @access  Private (Staff)
export const getStaffDashboard = async (req, res, next) => {
  try {
    const staffId = req.user.id || req.user._id;

    const [
      totalAssigned,
      assignedCount,
      inProgressCount,
      onHoldCount,
      resolvedCount,
      criticalAssigned,
      highAssigned,
      recentTasks,
    ] = await Promise.all([
      prisma.issue.count({ where: { assignedToId: staffId } }),
      prisma.issue.count({ where: { assignedToId: staffId, status: 'Assigned' } }),
      prisma.issue.count({ where: { assignedToId: staffId, status: 'In Progress' } }),
      prisma.issue.count({ where: { assignedToId: staffId, status: 'On Hold' } }),
      prisma.issue.count({
        where: {
          assignedToId: staffId,
          status: { in: ['Resolved', 'Closed'] },
        },
      }),
      prisma.issue.count({
        where: {
          assignedToId: staffId,
          priority: 'Critical',
          status: { notIn: ['Resolved', 'Closed'] },
        },
      }),
      prisma.issue.count({
        where: {
          assignedToId: staffId,
          priority: 'High',
          status: { notIn: ['Resolved', 'Closed'] },
        },
      }),
      prisma.issue.findMany({
        where: { assignedToId: staffId },
        include: {
          reportedBy: { select: { id: true, name: true, email: true, phone: true, studentId: true } },
          building: true,
          department: true,
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        take: 6,
      }),
    ]);

    // Average staff feedback rating
    const ratingAgg = await prisma.feedback.aggregate({
      where: {
        issue: {
          assignedToId: staffId,
        },
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const performanceRating = ratingAgg._avg.rating ? parseFloat(ratingAgg._avg.rating.toFixed(1)) : 5.0;
    const totalFeedbacks = ratingAgg._count.rating || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalAssigned,
        pendingTasks: assignedCount + inProgressCount + onHoldCount,
        inProgressCount,
        resolvedCount,
        criticalAssigned,
        highAssigned,
        performanceRating,
        totalFeedbacks,
      },
      recentTasks: formatEntity(recentTasks),
    });
  } catch (error) {
    next(error);
  }
};
