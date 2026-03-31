import { DashboardData, Stat, TableRow } from '../types/dashboard.types';
import { dashboardMock } from './dashboard.mock';

export function fetchDashboardData(): Promise<DashboardData> {
  return new Promise(resolve => setTimeout(() => resolve(dashboardMock), 500));
}

export function fetchStats(): Promise<Stat[]> {
  return new Promise(resolve => setTimeout(() => resolve(dashboardMock.stats), 500));
}

export function fetchTableRows(): Promise<TableRow[]> {
  return new Promise(resolve => setTimeout(() => resolve(dashboardMock.rows), 500));
}
