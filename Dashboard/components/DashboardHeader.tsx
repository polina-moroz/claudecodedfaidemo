import React from 'react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="dashboard-header">
      <h1>{title}</h1>
      {subtitle && <p className="dashboard-header__subtitle">{subtitle}</p>}
    </header>
  );
};

export default DashboardHeader;
