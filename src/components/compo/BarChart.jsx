import { useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import boardApi from "../../api/boardApi";
import authApi from "../../api/authApi";
import taskApi from "../../api/taskApi";
import { tokens } from '../../components/compo/theme';
import moment from 'moment';

const BarChart = ({ selectedBoardId }) => {
  const theme = useTheme();
  const { primary, secondary, text } = theme.palette;
  const [chartData, setChartData] = useState([]);
  const [minDuration, setMinDuration] = useState(0);
  const [maxDuration, setMaxDuration] = useState(0);

  const colors = tokens(theme.palette.mode);
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        if (selectedBoardId) {
          const boardResponse = await boardApi.getOne(selectedBoardId);
          const sections = boardResponse.sections;
          const userIds = boardResponse.users;

          const response = await authApi.getAllUsers();
          const filteredUsers = response.filter(user =>
            userIds.includes(user.id)
          );

          const data = [];

          sections.forEach(section => {
            section.tasks.forEach(task => {
              if (
                task.members &&
                task.members.length > 0 &&
                task.duration > 0
              ) {
                const assignedUsers = task.members.map(memberId => {
                  const assignedUser = filteredUsers.find(user => user.id === memberId);
                  return assignedUser ? assignedUser.username : "";
                });

                const durationInSeconds = task.duration;
                const hours = Math.floor(durationInSeconds / 3600);
                const minutes = Math.floor(
                  (durationInSeconds % 3600) / 60
                );
                const seconds = durationInSeconds % 60;
                const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                data.push({
                  name: task.title,
                  durationInSeconds: durationInSeconds,
                  assignedUsers: assignedUsers,
                  formattedDuration: formattedDuration
                });
              }
            });
          });

          const durations = data.map(entry => entry.durationInSeconds);
          const min = Math.min(...durations);
          const max = Math.max(...durations);

          setChartData(data);
          setMinDuration(min);
          setMaxDuration(max);
        }
      } catch (error) {
        console.log(error);
      }
    };

    // Fetch chart data initially
    fetchChartData();
    const interval = setInterval(fetchChartData, 3000);

    // Clean up the interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, [selectedBoardId]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box p={1} borderRadius={4} boxShadow={1} sx={{ backgroundColor: colors.greenAccent[500] }}>
          <Typography variant="body2" fontWeight="bold">
            {data.name}
          </Typography>
          <Typography variant="body2" color="white">
            Assigned Users: {data.assignedUsers.join(", ")}
          </Typography>
          <Typography variant="body2" color="white">
            Duration: {data.formattedDuration}
          </Typography>
        </Box>
      );
    }
    
    return null;
  };

  return (
    <Box textAlign="center" >
      <Typography variant="h3" fontWeight="bold" sx={{
        color: colors.greenAccent[500],
        textAlign: "center",
        marginLeft: "auto",
      }}>
        Members Time Duration
      </Typography>
     
      <Box maxWidth={800} mx="auto" p={3} borderRadius={8}>
        <RechartsBarChart width={800} height={264} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" stroke={secondary.main} tick={{ fontSize: 12 }} />
          <YAxis
            stroke={secondary.main}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const duration = moment.duration(value, 'seconds');
              return `${duration.hours().toString().padStart(2, '0')}:${duration.minutes().toString().padStart(2, '0')}:${duration.seconds().toString().padStart(2, '0')}`;
            }}
            domain={[minDuration, maxDuration]}
          />
          <Legend wrapperStyle={{ color: text.primary, fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />}cursor={{ fill: 'transparent' }} offset={-20} />
          <Bar
          label="Duration"
            dataKey="durationInSeconds"
            fill={secondary.main}
            radius={[6, 6, 0, 0]}
            barSize={30}
            isAnimationActive={false}
            minPointSize={30}
          />
        </RechartsBarChart>
      </Box>
    </Box>
  );
};

export default BarChart;
