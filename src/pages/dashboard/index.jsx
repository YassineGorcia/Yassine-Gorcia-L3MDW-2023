import React, { useEffect, useState } from 'react';
import { Box, Button, IconButton, Typography, useTheme } from '@mui/material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { tokens } from '../../components/compo/theme';
import { mockTransactions } from '../../components/compo/mockData';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import Header from '../../components/compo/Header';
import LineChart from '../../components/compo/LineChart';
import { People, Task  } from "@mui/icons-material";
import { ListAlt } from "@mui/icons-material";
import ArticleSharpIcon from '@mui/icons-material/ArticleSharp';
import Team from '../../components/team';
import BarChart from '../../components/compo/BarChart';
import StatBox from '../../components/compo/StatBox';
import ProgressCircle from '../../components/compo/ProgressCircle';
import { Link, useParams } from 'react-router-dom';
import { ColorModeContext, useMode } from "../../theme";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import boardApi from '../../api/boardApi';
import authApi from '../../api/authApi';
import { useSelector} from 'react-redux'
import {  useNavigate } from 'react-router-dom'
import { css } from "@emotion/react";

import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
const Dashboard = () => {

  const boards = useSelector((state) => state.board.value)
  const [activeIndex, setActiveIndex] = useState(0);
  const [them, colorMode] = useMode();
  const theme = useTheme();
  const themeConfig = createTheme(theme);
  const colors = tokens(theme.palette.mode);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate()
  const { boardId } = useParams();
  const [filteredUserCount, setFilteredUserCount] = useState(0);
  const [totalTaskCount, setTotalTaskCount] = useState(0);
  const [totalTaskCountInSection, setTotalTaskCountInSection] = useState(0);
  const [TotalTaskNotDoneCountInSection, setTotalTaskNotDoneCountInSection] = useState(0);
  const [activities, setActivities] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
const handleClick = (boardId) => {
  setSelectedBoardId(boardId);
};


const buttonStyle = css`
  display: flex;
  align-items: center;
  height: 50px;
  border: 1px solid;
  margin-top: 1px;
  margin-right: 1px;
  padding: 10px;
  border-radius: 20px;
  font-size: 18px;
  cursor: pointer;

  &:hover {
    background-color: lightgray;
  }

  &.selected {
    background-color: #e0e0e0;
  }
`;

const containerStyle = css`
  height: 94vh;

  & > div {
    border-right: none;
  }

  & .pro-sidebar-inner {
    background: ${colors.primary[600]} !important;
  }

  & .pro-icon-wrapper {
    background-color: transparent !important;
  }

  & .pro-inner-item {
    padding: 5px 35px 5px 10px !important;
  }

  & .pro-inner-item:hover {
    color: #868dfb !important;
  }

  & .pro-menu-item.active {
    color: #6870fa !important;
  }
`;


useEffect(() => {
  const fetchTasks = async () => {
    try {
      if (selectedBoardId) {
        const sectionsResponse = await boardApi.getOne(selectedBoardId);
        const sections = sectionsResponse.sections;
        let totalTaskCount = 0;
        sections.forEach((section) => {
          totalTaskCount += section.tasks.length;
        });

        // Set the total task count state variable
        setTotalTaskCount(totalTaskCount);
      }
    } catch (error) {
      console.log(error);
    }
  };

  fetchTasks();
  const interval = setInterval(fetchTasks, 3000);

  // Clean up the interval on component unmount
  return () => {
    clearInterval(interval);
  };
}, [selectedBoardId]);

useEffect(() => {
  const fetchTotalTasksInSection = async () => {
    try {
      if (selectedBoardId) {
        const sectionsResponse = await boardApi.getOne(selectedBoardId);
        const sections = sectionsResponse.sections;

        // Find the third section and calculate the total task count
        const thirdSection = sections[2]; // Assuming the third section is at index 2
        const totalTaskCountInSection = thirdSection.tasks.length;

        // Set the total task count state variable
        setTotalTaskCountInSection(totalTaskCountInSection);
      }
    } catch (error) {
      console.log(error);
    }
  };

  fetchTotalTasksInSection();
  const interval = setInterval(fetchTotalTasksInSection, 3000);

  // Clean up the interval on component unmount
  return () => {
    clearInterval(interval);
  };
}, [selectedBoardId]);
useEffect(() => {
  const fetchTotalTasksNotDoneInSection = async () => {
    try {
      if (selectedBoardId) {
        const sectionsResponse = await boardApi.getOne(selectedBoardId);
        const sections = sectionsResponse.sections;

        // Calculate the total task count for all sections except the third section
        let totalTaskCount = 0;
        sections.forEach((section, index) => {
          if (index !== 2) { // Skip the third section
            totalTaskCount += section.tasks.length;
          }
        });

        // Set the total task count state variable
        setTotalTaskNotDoneCountInSection(totalTaskCount);
      }
    } catch (error) {
      console.log(error);
    }
  };

  fetchTotalTasksNotDoneInSection();
  const interval = setInterval(fetchTotalTasksNotDoneInSection, 3000);

  // Clean up the interval on component unmount
  return () => {
    clearInterval(interval);
  };
}, [selectedBoardId]);

useEffect(() => {
  const fetchUsers = async () => {
    try {
      setUsers([]); // Reset users array before fetching new users

      if (selectedBoardId) {
        const boardResponse = await boardApi.getOne(selectedBoardId); // Fetch board by ID
        const userIds = boardResponse.users; // Extract user IDs from the board response

        const response = await authApi.getAllUsers(); // Fetch all users
        const filteredUsers = response.filter(user => userIds.includes(user.id)); // Filter users by matching IDs

        setUsers(filteredUsers);
        setFilteredUsers(filteredUsers);

        console.log(filteredUsers.map(user => user)); // Show filtered users in the console

        setFilteredUserCount(filteredUsers.length); // Update filteredUserCount with the total number of filtered users
      }
    } catch (error) {
      console.log(error);
    }
  };
  

  // Fetch users initially
  fetchUsers();

  // Set up an interval to fetch users every 3 seconds (adjust as needed)
  const interval = setInterval(fetchUsers, 3000);

  // Clean up the interval on component unmount
  return () => {
    clearInterval(interval);
  };
}, [selectedBoardId]);
const handleDownloadReports = () => {
  const element = document.getElementById('dashboard');

  if (!element) {
    console.error("Dashboard element not found");
    return;
  }

  // Create a new jsPDF instance
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
  });

  // Convert the element to canvas using html2canvas
  html2canvas(element, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Adjust the size of the PDF document
    pdf.internal.pageSize.setHeight(pdfHeight);

    // Add the image to the PDF document
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    // Save the PDF document
    pdf.save('dashboard.pdf');
  });
};

  return (
   <Box sx={{display:'flex', overflow:'inherit', height:'auto'}}>
    <div id="dashboard">
     <ThemeProvider theme={themeConfig}>
      <ColorModeContext.Provider value={colorMode}>
    <CssBaseline />
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />

        <Box>
          <Button
          onClick={handleDownloadReports}
            sx={{
              color: colors.grey[100],
            }}
          >
            <DownloadOutlinedIcon  sx={{width:'3vw'}} />
          </Button>
        </Box>
      </Box>
    

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        <Box
  gridColumn="span 12"
  backgroundColor={colors.primary[400]}
  
>


<div sx={containerStyle}>
  {boards.map((board) => (
    <Button
      key={board.id}
      onClick={() => handleClick(board.id)}
      css={[
        buttonStyle,
        board.id === selectedBoardId && css`
          background-color: #e0e0e0;
        `
      ]}
      className={board.id === selectedBoardId ? "selected" : ""}
    >
      <Box
        display="flex"
        alignItems="center"
        sx={{ fontSize: '18px' }}
      >
        {board.icon}
        <Typography variant="body1" sx={{ fontSize: "26px", color: colors.greenAccent[600], ml: 1 }}>
          {board.title}
        </Typography>
      </Box>
    </Button>
  ))}
</div>

</Box>
        {/* ROW 1 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
               <StatBox
            title={filteredUserCount.toString()} // Set the title with the filteredUserCount as a string
            
            subtitle="Membres of the Team project"
            icon={
              <People
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={totalTaskCount.toString()} 
            subtitle="Total number of tasks"
            
            icon={
              <ListAlt
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={totalTaskCountInSection.toString()}
            subtitle="Completed Task"
            

            icon={
              <Task
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={TotalTaskNotDoneCountInSection.toString()}
            subtitle="Incompleted Task"
           
            icon={
              <ArticleSharpIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        {/* ROW 2 */}
        <Box gridColumn="span 8" gridRow="span 2" backgroundColor={colors.primary[400]}>
  <Box mt="25px" p="0 30px" display="flex" justifyContent="space-between" alignItems="center">
    <Box>{/* Your content */}</Box>
  </Box>
  <Box height="300px" m="-20px 0 0 0" width="100%">
    <LineChart key={selectedBoardId} selectedBoardId={selectedBoardId} />
    
  </Box>
</Box>


<Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography 
            variant="h3"
            fontWeight="bold"
            sx={{
              color: colors.greenAccent[500],
              textAlign: "left",
              marginLeft: "auto",
            }}>
            Project Progress :
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="25px"
          >
             <ProgressCircle size="125" progress={(totalTaskCountInSection/totalTaskCount).toString()}/>
      
            <Typography
             
            >
            <StatBox
             
             progress={(totalTaskCountInSection / totalTaskCount).toFixed(2)}
            increase={`+${((totalTaskCountInSection / totalTaskCount) * 100).toFixed(2)}%`}

              />
            </Typography>
          </Box>
        </Box>
         
        <Box
       
        gridColumn="span 6" gridRow="span 2" backgroundColor={colors.primary[400]}>
 
  
 <Team users={filteredUsers} selectedBoardId={selectedBoardId}/>
  
         </Box>


        <Box
          gridColumn="span 6"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
         
          sx={{ overflowY: 'hidden' }}
        >
         <Box width='400px'height="100%" >
          
          {selectedBoardId && <BarChart  selectedBoardId={selectedBoardId}  />}
          </Box>
    
           
          </Box>

        {/* ROW 3 */}
      
       

       
      </Box>
    </Box>
    </ColorModeContext.Provider>
    </ThemeProvider>
    </div>
    </Box>
  );
};

export default Dashboard;