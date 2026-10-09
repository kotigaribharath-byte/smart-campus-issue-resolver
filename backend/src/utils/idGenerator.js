import prisma from '../config/prisma.js';

export const generateComplaintId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `CFX-${currentYear}-`;

  // Find the issue with the highest complaintId for current year
  const latestIssue = await prisma.issue.findFirst({
    where: {
      complaintId: {
        startsWith: prefix,
      },
    },
    orderBy: {
      complaintId: 'desc',
    },
    select: {
      complaintId: true,
    },
  });

  let nextSequenceNumber = 1;

  if (latestIssue && latestIssue.complaintId) {
    const parts = latestIssue.complaintId.split('-');
    if (parts.length === 3) {
      const parsedSeq = parseInt(parts[2], 10);
      if (!isNaN(parsedSeq)) {
        nextSequenceNumber = parsedSeq + 1;
      }
    }
  } else {
    // If none found with prefix, check total count
    const count = await prisma.issue.count();
    nextSequenceNumber = count + 1;
  }

  // Ensure sequence number is unique
  let complaintId = `${prefix}${String(nextSequenceNumber).padStart(4, '0')}`;
  let exists = await prisma.issue.findUnique({
    where: { complaintId },
  });

  while (exists) {
    nextSequenceNumber += 1;
    complaintId = `${prefix}${String(nextSequenceNumber).padStart(4, '0')}`;
    exists = await prisma.issue.findUnique({
      where: { complaintId },
    });
  }

  return complaintId;
};
