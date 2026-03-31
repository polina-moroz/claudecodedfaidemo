import React, { useEffect, useState } from 'react';
import { Stat, TableRow } from './types/dashboard.types';
import { fetchStats, fetchTableRows } from './api/dashboard.service';
import DashboardHeader from './components/DashboardHeader';
import StatsCard from './components/StatsCard';
import DataTable from './components/DataTable';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [rows, setRows] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchStats(), fetchTableRows()])
      .then(([statsData, rowsData]) => {
        setStats(statsData);
        setRows(rowsData);
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const handleRowClick = (id: string) => {
    console.log('Row clicked:', id);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="dashboard">
      <DashboardHeader title="Dashboard" subtitle="Overview of key metrics" />
      <section className="dashboard__stats">
        {stats.map(stat => (
          <StatsCard key={stat.id} stat={stat} />
        ))}
      </section>
      <section className="dashboard__table">
        <DataTable rows={rows} />
      </section>
    </div>
  );
};

export default DashboardPage;
