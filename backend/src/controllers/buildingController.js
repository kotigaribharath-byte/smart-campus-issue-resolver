import prisma from '../config/prisma.js';
import { formatEntity } from '../utils/formatHelper.js';

// @desc    Get all buildings with issue statistics
// @route   GET /api/buildings
// @access  Public / Private
export const getBuildings = async (req, res, next) => {
  try {
    const buildings = await prisma.building.findMany({
      orderBy: { name: 'asc' },
    });

    const buildingsWithStats = await Promise.all(
      buildings.map(async (b) => {
        const [totalIssues, pendingIssues, resolvedIssues] = await Promise.all([
          prisma.issue.count({ where: { buildingId: b.id } }),
          prisma.issue.count({
            where: {
              buildingId: b.id,
              status: { in: ['Submitted', 'Assigned', 'In Progress', 'Reopened', 'On Hold'] },
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
          ...formatEntity(b),
          totalIssues,
          pendingIssues,
          resolvedIssues,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: buildingsWithStats.length,
      buildings: buildingsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create building
// @route   POST /api/buildings
// @access  Private (Admin)
export const createBuilding = async (req, res, next) => {
  try {
    const { name, block, floors, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Building name is required.',
      });
    }

    const existing = await prisma.building.findFirst({
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
        message: 'A building with this name already exists.',
      });
    }

    const building = await prisma.building.create({
      data: {
        name: name.trim(),
        block: block || '',
        floors: Array.isArray(floors) && floors.length > 0 ? floors : ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'],
        description: description || '',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Building created successfully.',
      building: formatEntity(building),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update building
// @route   PUT /api/buildings/:id
// @access  Private (Admin)
export const updateBuilding = async (req, res, next) => {
  try {
    const { name, block, floors, description } = req.body;
    const { id } = req.params;

    const existing = await prisma.building.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name.trim();
    if (block !== undefined) dataToUpdate.block = block;
    if (floors && Array.isArray(floors)) dataToUpdate.floors = floors;
    if (description !== undefined) dataToUpdate.description = description;

    const building = await prisma.building.update({
      where: { id },
      data: dataToUpdate,
    });

    res.status(200).json({
      success: true,
      message: 'Building updated successfully.',
      building: formatEntity(building),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete building
// @route   DELETE /api/buildings/:id
// @access  Private (Admin)
export const deleteBuilding = async (req, res, next) => {
  try {
    const buildingId = req.params.id;

    const issuesCount = await prisma.issue.count({
      where: { buildingId },
    });

    if (issuesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete building because ${issuesCount} issues are registered under this building.`,
      });
    }

    await prisma.building.delete({
      where: { id: buildingId },
    });

    res.status(200).json({
      success: true,
      message: 'Building deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
