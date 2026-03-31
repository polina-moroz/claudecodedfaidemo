import { DashboardData } from '../types/dashboard.types';

export const dashboardMock: DashboardData = {
  stats: [
    { id: '1', label: 'Total Users', value: 12_430, change: 8.2, changeType: 'increase' },
    { id: '2', label: 'Revenue', value: '$48,295', change: 3.1, changeType: 'increase' },
    { id: '3', label: 'Active Sessions', value: 1_847, change: -2.4, changeType: 'decrease' },
    { id: '4', label: 'Conversion Rate', value: '4.6%', change: 0, changeType: 'neutral' },
  ],
  rows: [
    { id: 'r1', name: 'Alice Johnson', status: 'active', date: '2026-03-28', amount: 320 },
    { id: 'r2', name: 'Bob Smith', status: 'pending', date: '2026-03-29', amount: 150 },
    { id: 'r3', name: 'Carol White', status: 'inactive', date: '2026-03-25', amount: 0 },
    { id: 'r4', name: 'David Lee', status: 'active', date: '2026-03-30', amount: 540 },
    { id: 'r5', name: 'Eva Brown', status: 'active', date: '2026-03-31', amount: 210 },
  ],
};
