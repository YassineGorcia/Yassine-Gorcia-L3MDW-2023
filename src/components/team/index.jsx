import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  useTheme,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import DeveloperBoardOutlinedIcon from "@mui/icons-material/DeveloperBoardOutlined";
import MobileFriendlyOutlinedIcon from "@mui/icons-material/MobileFriendlyOutlined";
import WebOutlinedIcon from "@mui/icons-material/WebOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import SportsEsportsOutlinedIcon from "@mui/icons-material/SportsEsportsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import CancelIcon from "@mui/icons-material/Cancel";
import Header from "../../components/compo/Header";
import boardApi from "../../api/boardApi";
import authApi from "../../api/authApi";
import { tokens } from "../../components/compo/theme";

const Team = ({ users,selectedBoardId }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selectedDeveloperType, setSelectedDeveloperType] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);


  useEffect(() => {
    // Update teamMembers state based on the users prop
    const formattedTeamMembers = users.map((user, index) => ({
      id: user._id, // Assuming the user object has an "_id" property
      username: user.username,
      number: user.number,
      email: user.email,
    }));
    setTeamMembers(formattedTeamMembers);
  }, [users]);

  const handleChange = async (event, row) => {
    const newRole = event.target.value;
    try {
      // Send a request to update the user's role
      await authApi.updateUser(row.id, { role: newRole });
      // Update the selectedDeveloperType state or any other relevant state with the updated role
      setSelectedDeveloperType((prevState) => ({
        ...prevState,
        [row.id]: newRole,
      }));
    } catch (error) {
      // Handle any errors that occur during the API request
      console.error('Failed to update user role:', error);
      // You can display an error message or perform any other error handling logic here
    }
  };

  const handleRemoveUser = async (row) => {
    try {
      // Get the user ID from the row data
      const userId = row.id;
  
      // Make an API request to remove the user from the board
      await boardApi.removeUserFromBoard(selectedBoardId, userId);
  
      // Update the teamMembers state by filtering out the removed user
      setTeamMembers((prevTeamMembers) =>
        prevTeamMembers.filter((member) => member.id !== userId)
      );
  
      console.log(`User ${userId} removed from board with ID ${selectedBoardId}`);
    } catch (error) {
      console.log('Error removing user:', error);
    }
  };
  
  






  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    {
      field: "username",width: 100 ,
      headerName: "Username",
      flex: 1,
      cellClassName: "username-column--cell",
    },
    {
      field: "number",width: 100 ,
      headerName: "Phone Number",
      flex: 1,
    },
    {
      field: "email",width: 100 ,
      headerName: "Email",
      flex: 1,
    },
    {
      field: "developerType",width: 100 ,
      headerName: "Developer Type",
      flex: 1,
      renderCell: (params) => {
        const rowData = params.row;
        const selectedType = selectedDeveloperType[rowData.id] || "";
        return (
          <FormControl variant="outlined" size="small">
            <Select
              value={selectedType}
              onChange={(event) => handleChange(event, rowData)}
              displayEmpty
              sx={{
                color:
                  selectedType === ""
                    ? colors.textSecondary
                    : colors.textPrimary,
                "& .MuiSelect-outlined.MuiSelect-outlined": {
                  paddingRight: "24px",
                },
              }}
              inputProps={{ "aria-label": "Developer Type" }}
            >
              <MenuItem value="" disabled>
                Select Type
              </MenuItem>
              <MenuItem value="backend">
                <CodeOutlinedIcon sx={{ mr: 1 }} />
                Backend
              </MenuItem>
              <MenuItem value="frontend">
                <WebOutlinedIcon sx={{ mr: 1 }} />
                Frontend
              </MenuItem>
              <MenuItem value="mobile">
                <MobileFriendlyOutlinedIcon sx={{ mr: 1 }} />
                Mobile
              </MenuItem>
              <MenuItem value="game">
                <SportsEsportsOutlinedIcon sx={{ mr: 1 }} />
                Game
              </MenuItem>
              <MenuItem value="fullstack">
                <DeveloperBoardOutlinedIcon sx={{ mr: 1 }} />
                Full Stack
              </MenuItem>
              <MenuItem value="system">
                <SettingsOutlinedIcon sx={{ mr: 1 }} />
                System
              </MenuItem>
              <MenuItem value="other">
                <AccountTreeOutlinedIcon sx={{ mr: 1 }} />
                Other
              </MenuItem>
            </Select>
          </FormControl>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: 50,
      renderCell: (params) => {
        const rowData = params.row;
        return (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <CancelIcon
              onClick={() => handleRemoveUser(params.row)}
              sx={{
                cursor: "pointer",
                color: theme.palette.error.main,
                "&:hover": {
                  color: theme.palette.error.dark,
                },
              }}
            />
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
     <Header
    title={
      
      <Typography variant="h3" fontWeight="bold" sx={{ color: colors.greenAccent[500] }}>
        Team
      </Typography>
    }
  />
    <Box
        m="40px 0 0 0"
        height="auto"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[500],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.greenAccent[500],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.greenAccent[500],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
  
        <DataGrid
          rows={teamMembers}
          columns={columns}
        height={'400px'}
          disableSelectionOnClick
        />
      </Box>
      
    </Box>
  );
};

export default Team;
