import React from 'react';
import { TableRow } from '../types/dashboard.types';

interface DataTableProps {
  rows: TableRow[];
}

const DataTable: React.FC<DataTableProps> = ({ rows }) => {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th>Date</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.id} className={`data-table__row data-table__row--${row.status}`}>
            <td>{row.name}</td>
            <td>{row.status}</td>
            <td>{row.date}</td>
            <td>${row.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
