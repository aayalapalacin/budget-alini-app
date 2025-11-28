import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false, // Hides the legend entirely
    },
    title: {
      display: true,
      text: 'Monthly Expenses',
      color: '#000',
      font: {
        size: 18,
        weight: 'bold' as const,
      },
    },
  },
};


interface Totals {
  home: number;
  gasoline: number;
  eatingOut: number;
  groceries: number;
  joaquin: number;
  lina: number;
  alex: number;
}

interface ChartProps {
  totals: Totals;
}

export const Chart: React.FC<ChartProps> = ({ totals }) => {
  const labels = ['Home', 'Gasoline', 'Eating Out', 'Groceries', 'Joaquin', 'Lina','Alex'];

  const data = {
    labels,
    datasets: [
      {
        label: 'Monthly Expenses',
        data: [
          totals.home,
          totals.gasoline,
          totals.eatingOut,
          totals.groceries,
          totals.joaquin,
          totals.lina,
          totals.alex,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',    // Home
          'rgba(54, 162, 235, 0.6)',    // Gasoline
          'rgba(255, 206, 86, 0.6)',    // Eating Out
          'rgba(75, 192, 192, 0.6)',    // Groceries
          'rgba(153, 102, 255, 0.6)',   // Joaquin
          'rgba(255, 159, 64, 0.6)',    // Lina
          'rgba(0, 255, 98, 0.6)',    // Alex
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(0, 145, 2, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return <Bar options={options} data={data} />;
};
