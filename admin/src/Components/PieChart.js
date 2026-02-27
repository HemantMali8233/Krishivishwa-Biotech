import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = () => {
  const data = {
    labels: ['View Count', 'Percentage', 'Sales'],
    datasets: [
      {
        data: [16, 23, 68],
        backgroundColor: ['#FFC107', '#4CAF50', '#2196F3'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { boxWidth: 12 }
      }
    }
  };

  return <Pie data={data} options={options} />;
};

export default PieChart;
