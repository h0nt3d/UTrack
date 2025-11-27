import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import React from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ScalingFactorBarChart({ scalingFactors }) {
  if (!scalingFactors || scalingFactors.length === 0) {
    return <div className="text-center text-gray-600 py-8">No scaling factor data available.</div>;
  }

  // Prepare data for chart
  const labels = scalingFactors.map((factor, index) => {
    const date = new Date(factor.eventClosedAt || factor.eventCreatedAt);
    return `Event ${index + 1}\n${date.toLocaleDateString()}`;
  });

  const scalingFactorValues = scalingFactors.map(factor => factor.scalingFactor);
  const totalReceivedValues = scalingFactors.map(factor => factor.totalReceived);

  // Color bars based on scaling factor value
  const backgroundColors = scalingFactorValues.map(value => {
    if (value >= 1.0) return 'rgba(34, 197, 94, 0.7)'; // Green for >= 1.0
    if (value >= 0.8) return 'rgba(59, 130, 246, 0.7)'; // Blue for 0.8-1.0
    if (value >= 0.6) return 'rgba(234, 179, 8, 0.7)'; // Yellow for 0.6-0.8
    return 'rgba(239, 68, 68, 0.7)'; // Red for < 0.6
  });

  const borderColors = scalingFactorValues.map(value => {
    if (value >= 1.0) return 'rgba(34, 197, 94, 1)';
    if (value >= 0.8) return 'rgba(59, 130, 246, 1)';
    if (value >= 0.6) return 'rgba(234, 179, 8, 1)';
    return 'rgba(239, 68, 68, 1)';
  });

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Scaling Factor',
        data: scalingFactorValues,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    maintainAspectRatio: true,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 8,
          font: {
            size: 11,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const factor = scalingFactors[index];
            return [
              `Scaling Factor: ${factor.scalingFactor.toFixed(3)}`,
              `Total Received: ${factor.totalReceived}`,
              `Team Size: ${factor.teamSize}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(1.5, Math.max(...scalingFactorValues) * 1.2),
        title: {
          display: true,
          text: 'Scaling Factor',
          font: {
            size: 11,
          },
        },
        ticks: {
          callback: function (value) {
            return value.toFixed(2);
          },
          font: {
            size: 10,
          },
        },
        grid: {
          color: function (context) {
            if (context.tick.value === 1.0) {
              return 'rgba(0, 0, 0, 0.3)'; // Highlight 1.0 line
            }
            return 'rgba(0, 0, 0, 0.1)';
          },
        },
      },
      x: {
        title: {
          display: true,
          text: 'Events',
          font: {
            size: 11,
          },
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
  };

  return (
    <div className="w-full" style={{ height: '250px' }}>
      <Bar data={chartData} options={options} height={250} />
    </div>
  );
}

