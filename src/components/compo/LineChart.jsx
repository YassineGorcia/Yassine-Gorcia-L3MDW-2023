import React, { useEffect } from 'react';
import { useTheme } from '@mui/material';
import { Chart, LineController, CategoryScale, LinearScale, PointElement, LineElement, TimeScale } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import { tokens } from '../../components/compo/theme';
import boardApi from '../../api/boardApi';

function formatDate(timestamp) {
  const lastUpdate = new Date(timestamp);
  return format(lastUpdate, 'yyyy, MMM dd, HH:mm a');
}

const LineChart = ({ selectedBoardId }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (selectedBoardId) {
          const sectionsResponse = await boardApi.getOne(selectedBoardId);
          const sections = sectionsResponse.sections;

          const taskNames = [];
          const lastUpdateDates = [];

          sections.forEach((section) => {
            section.tasks.forEach((task) => {
              taskNames.push(task.title);
              const lastUpdate = new Date(task.lastUpdate); // Convert lastUpdate to a Date object
              lastUpdateDates.push(lastUpdate.getTime()); // Push the timestamp of lastUpdate
            });
          });

          Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, TimeScale);

          const minDate = Math.min(...lastUpdateDates);
          const maxDate = Math.max(...lastUpdateDates);

          const ctx = document.getElementById('lineChart').getContext('2d');

          new Chart(ctx, {
            type: 'line',
            data: {
              labels: taskNames,
              datasets: [
                {
                  label: 'Last Update',
                  data: lastUpdateDates.map((value, index) => ({ x: index, y: value })),
                  fill: false,
                  borderColor: '#61affe',
                  tension: 0.2,
                  borderWidth: 2,
                  pointBackgroundColor: '#61affe',
                  pointRadius: 4,
                  pointHoverRadius: 6,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const lastUpdate = context.raw.y;
                      return formatDate(lastUpdate);
                    },
                  },
                },
                interactions: {
                  mode: 'index',
                  intersect: false,
                },
              },
              scales: {
                x: {
                  type: 'category',
                  title: {
                    display: true,
                    text: 'Tasks',
                    font: {
                      size: 16,
                      weight: 'bold',
                      family: 'Arial',
                    },
                    color: colors.greenAccent[500],
                  },
                  ticks: {
                    font: {
                      size: 12,
                      family: 'Arial',
                      weight: 'bold',
                    },
                    color: colors.greenAccent[500],
                  },
                  grid: {
                    display: false,
                  },
                  // Customization for X-axis labels
                  textAlignment: 'center', // Align the labels to the center of the tick
                  padding: 10, // Add padding between the labels and the axis
                },
                y: {
                  type: 'linear',
                  title: {
                    display: true,
                    text: 'Last Update',
                    font: {
                      size: 16,
                      weight: 'bold',
                      family: 'Arial, sans-serif',
                    },
                    color: colors.greenAccent[500],
                  },
                  ticks: {
                    callback: function (value) {
                      return formatDate(value);
                    },
                    font: {
                      size: 12,
                      family: 'Arial',
                      weight: 'bold',
                    },
                    color: colors.greenAccent[500],
                  },
                  grid: {
                    color: '#e0e0e0',
                    lineWidth: 0.5,
                  },
                  min: minDate,
                  max: maxDate,
                },
              },
            },
          });
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchTasks();
  }, [selectedBoardId]);

  return <canvas id="lineChart" width="800" height="300" />;
};

export default LineChart;
