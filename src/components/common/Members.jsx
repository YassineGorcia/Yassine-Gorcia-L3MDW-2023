import { useSelector, useDispatch } from 'react-redux'
import { Box, Drawer, IconButton, List, ListItem, ListItemButton, Typography , Dialog , DialogContent , useTheme , ListItemText} from '@mui/material'
import {  tokens } from "../../theme";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link, useNavigate, useParams } from 'react-router-dom'
import assets from '../../assets/index'
import { useEffect, useState } from 'react'
import boardApi from '../../api/boardApi'
import { setBoards } from '../../redux/features/boardSlice'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import FavouriteList from './FavouriteList'
import authApi from '../../api/authApi'; // Import the updated authApi
import React from 'react'
import Profile from './Profile';
import { Padding, Style } from '@mui/icons-material';


const Members = () => {
  const sidebarWidth = 250
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
 
  const boards = useSelector((state) => state.board.value)

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { boardId } = useParams()
  const [activeIndex, setActiveIndex] = useState(0)
  const [users, setUsers] = useState([])
  const [open, setOpen] = useState(false);
  const [openUserId, setOpenUserId] = useState(null);
  const connectedUserId = useSelector(state => state.user.value.id);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsers([]); // Reset users array before fetching new users

        const boardResponse = await boardApi.getOne(boardId); // Fetch board by ID
        const userIds = boardResponse.users; // Extract user IDs from the board response

        const response = await authApi.getAllUsers(); // Fetch all users
        const filteredUsers = response.filter(user => userIds.includes(user.id)); // Filter users by matching IDs

        
        const finalUsers = filteredUsers.filter(user => user.id !== connectedUserId);
    
        setUsers(finalUsers);
    

        console.log(filteredUsers.map(user => user.username)); // Show filtered users in the console
      } catch (error) {
        console.log(error);
      }
    };

    fetchUsers();
  }, [boardId]); // Add boardId to the dependency array to rerender when it changes

  const handleClickOpen = (userId) => {
    setOpenUserId(userId);
  };

  const handleClose = () => {
    setOpenUserId(null);
  };

  return (
    <Box>
      <Menu iconShape="square">
        {users.map((user) => (
          <div key={user.id}>
            <MenuItem 
              onClick={() => handleClickOpen(user.id)}
              icon={<img src={`https://robohash.org/${user.username}`} style={{ width: '40px', borderRadius: '50%', backgroundColor: colors.primary[400], }} alt="User" />}
            >
              <ListItemText primary={user.username} secondary={`#${user.role}`} />
            </MenuItem>
            {openUserId === user.id && <Profile userId={user.id} onClose={handleClose} />}
          </div>
        ))}
      </Menu>
    </Box>
  
  );
}

export default Members;
