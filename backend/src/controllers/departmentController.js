import prisma from '../config/prisma.js';
import { formatEntity } from '../utils/formatHelper.js';

// @desc    Get all departments with staff and issue counts
// @route   GET /api/departments
// @access  Public / Private
export const getDepartments = async (req, res, next) => {
  try {
    const departments = await prisma.department.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    const deptsWithStats = await Promise.all(
      departments.map(async (dept) => {
        const [staffCount, pendingIssues, resolvedIssues] = await Promise.all([
          prisma.user.count({
            where: { departmentId: dept.id, role: 'staff', active: true },
          }),
          prisma.issue.count({
            where: {
              departmentId: dept.id,
              status: { in: ['Submitted', 'Assigned', 'In Progress', 'Reopened', 'On Hold'] },
            },
          }),
          prisma.issue.count({
            where: {
              departmentId: dept.id,
              status: { in: ['Resolved', 'Closed'] },
            },
          }),
        ]);

        return {
          ...formatEntity(dept),
          staffCount,
          pendingIssues,
          resolvedIssues,
          totalIssues: pendingIssues + resolvedIssues,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: deptsWithStats.length,
      departments: deptsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private (Admin)
export const createDepartment = async (req, res, next) => {
  try {
    const { name, description, categoryKey } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required.',
      });
    }

    const existing = await prisma.department.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A department with this name already exists.',
      });
    }

    const department = await prisma.department.create({
      data: {
        name: name.trim(),
        description: description || '',
        categoryKey: categoryKey || '',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      department: formatEntity(department),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin)
export const updateDepartment = async (req, res, next) => {
  try {
    const { name, description, categoryKey, active } = req.body;
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name.trim();
    if (description !== undefined) dataToUpdate.description = description;
    if (categoryKey !== undefined) dataToUpdate.categoryKey = categoryKey;
    if (active !== undefined) dataToUpdate.active = active;

    const updated = await prisma.department.update({
      where: { id },
      data: dataToUpdate,
    });

    res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      department: formatEntity(updated),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
export const deleteDepartment = async (req, res, next) => {
  try {
    const deptId = req.params.id;

    // Check if issues exist under this department
    const issuesCount = await prisma.issue.count({
      where: { departmentId: deptId },
    });

    if (issuesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department because ${issuesCount} complaints are linked to it. You may deactivate it instead.`,
      });
    }

    await prisma.department.delete({
      where: { id: deptId },
    });

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
