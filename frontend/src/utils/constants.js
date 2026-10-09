export const ISSUE_CATEGORIES = [
  'Electrical',
  'Plumbing',
  'Wi-Fi/Network',
  'Furniture',
  'Air Conditioning',
  'Cleanliness',
  'Laboratory Equipment',
  'Classroom Equipment',
  'Security',
  'Other',
];

export const ISSUE_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const ISSUE_STATUSES = [
  'Submitted',
  'Assigned',
  'In Progress',
  'On Hold',
  'Resolved',
  'Closed',
  'Reopened',
];

export const CATEGORY_DEPARTMENT_SUGGESTION = {
  'Electrical': 'Electrical Department',
  'Plumbing': 'Plumbing Department',
  'Wi-Fi/Network': 'IT/Network Department',
  'Furniture': 'Maintenance Department',
  'Air Conditioning': 'Maintenance Department',
  'Cleanliness': 'Cleaning & Housekeeping',
  'Laboratory Equipment': 'Laboratory Equipment',
  'Classroom Equipment': 'IT/Network Department',
  'Security': 'Security Department',
  'Other': 'General Campus Services',
};

export const STATUS_COLORS = {
  'Submitted': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', dot: 'bg-slate-500' },
  'Assigned': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-600' },
  'In Progress': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
  'On Hold': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  'Resolved': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'Closed': { bg: 'bg-zinc-100', text: 'text-zinc-600', border: 'border-zinc-300', dot: 'bg-zinc-400' },
  'Reopened': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
};

export const PRIORITY_COLORS = {
  'Low': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  'Medium': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  'High': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  'Critical': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-600', ring: 'ring-2 ring-red-400 animate-pulse' },
};
