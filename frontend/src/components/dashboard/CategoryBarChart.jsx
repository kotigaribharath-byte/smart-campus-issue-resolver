import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const CategoryBarChart = ({ data = [] }) => {
  const colors = [
    '#6366f1',
    '#0ea5e9',
    '#10b981',
    '#f59e0b',
    '#f43f5e',
    '#8b5cf6',
    '#14b8a6',
    '#ec4899',
    '#64748b',
  ];

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No category complaint records available.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-800">
          <p className="font-bold">{label}</p>
          <p className="text-indigo-300 font-semibold mt-0.5">
            {payload[0].value} Complaints Logged
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748b' }}
            interval={0}
            angle={-25}
            textAnchor="end"
          />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
