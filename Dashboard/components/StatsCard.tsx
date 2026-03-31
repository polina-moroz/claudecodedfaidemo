import React from 'react';
import { Stat } from '../types/dashboard.types';

interface StatsCardProps {
  stat: Stat;
}

const StatsCard: React.FC<StatsCardProps> = ({ stat }) => {
  const changeSign = stat.changeType === 'increase' ? '+' : '';

  return (
    <div className="stats-card">
      <span className="stats-card__label">{stat.label}</span>
      <strong className="stats-card__value">{stat.value}</strong>
      {stat.change !== undefined && (
        <span className={`stats-card__change stats-card__change--${stat.changeType}`}>
          {changeSign}{stat.change}%
        </span>
      )}
    </div>
  );
};

export default StatsCard;
