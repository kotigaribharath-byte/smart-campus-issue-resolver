import prisma from '../config/prisma.js';

// Mapping from Category to Department keywords / name
const categoryToDeptMap = {
  'Electrical': ['Electrical', 'Electric'],
  'Plumbing': ['Plumbing', 'Water'],
  'Wi-Fi/Network': ['IT/Network', 'IT', 'Network'],
  'Furniture': ['Maintenance', 'Carpentry', 'General'],
  'Air Conditioning': ['Maintenance', 'HVAC', 'Electrical'],
  'Cleanliness': ['Cleaning', 'Housekeeping', 'Sanitation'],
  'Laboratory Equipment': ['Laboratory', 'Lab', 'IT'],
  'Classroom Equipment': ['IT/Network', 'Maintenance', 'General'],
  'Security': ['Security', 'Safety', 'General'],
  'Other': ['General', 'Maintenance'],
};

export const suggestDepartmentForCategory = async (category) => {
  const possibleNames = categoryToDeptMap[category] || ['General'];

  for (const name of possibleNames) {
    const dept = await prisma.department.findFirst({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
        active: true,
      },
    });
    if (dept) {
      return dept;
    }
  }

  // Fallback to any active department
  return await prisma.department.findFirst({
    where: { active: true },
  });
};
