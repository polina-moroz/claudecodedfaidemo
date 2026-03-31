export interface Stat {
  id: string;
  label: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

export interface TableRow {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  date: string;
  amount: number;
}

export interface DashboardData {
  stats: Stat[];
  rows: TableRow[];
}
