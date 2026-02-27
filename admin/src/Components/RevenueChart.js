import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const RevenueChart = () => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Income',
        data: [40, 50, 45, 60, 65],
        backgroundColor: '#4CAF50',
        barThickness: 20,
      },
      {
        label: 'Expenses',
        data: [20, 25, 30, 35, 40],
        backgroundColor: '#FF9800',
        barThickness: 20,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { boxWidth: 12 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 20 }
      }
    }
  };

  return <Bar data={data} options={options} />;
};

export default RevenueChart;
