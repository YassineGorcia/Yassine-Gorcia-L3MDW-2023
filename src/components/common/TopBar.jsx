import React, { useState, useEffect, useContext } from 'react';
import {   ColorModeContext,tokens } from "../../theme";
import { useNavigate, useParams  } from 'react-router-dom'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SearchIcon from "@mui/icons-material/Search";
import boardApi from '../../api/boardApi';
import authApi from '../../api/authApi'; 
import {Menu, MenuItem , SubMenu } from "react-pro-sidebar";
import axios from 'axios';
import { setBoards } from '../../redux/features/boardSlice'
import { useSelector, useDispatch } from 'react-redux'
import { Box, List, ListItemButton, Typography, InputBase, IconButton, useTheme , Collapse , ListItemText , ListItemIcon , CircularProgress, Icon } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { setFavouriteList } from '../../redux/features/favouriteSlice.js'
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Profile from './Profile';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import roomApi from '../../api/roomApi';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import animationData from '../../assets/logo.json';
import Lottie from 'react-lottie';
import MessageComponent from './MessageComponent';
import Members from './Members';
import Brightness4Icon from '@mui/icons-material/Brightness4';

const TopBar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [searchResults, setSearchResults] = useState([]);
  const [key, setKey] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const boards = useSelector((state) => state.board.value)
  const dispatch = useDispatch()
  const favouriteList = useSelector((state) => state.favourites.value)
  const [isFavourite, setIsFavourite] = useState(false)
  const [open, setOpen] = useState(false);
  const [BoardOwner, setBoardOwner] = useState('');
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const User = useSelector((state) => state.user.value)
 
  
  const { boardId } = useParams()
  const [expanded, setExpanded] = useState(false);
  const [expandedchat, setExpandedchat] = useState(false);
  const [openUserId, setOpenUserId] = useState(null);
  const { toggleColorMode } = useContext(ColorModeContext);
   const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }


  const handleModeToggle = () => {
    toggleColorMode();
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };
  

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsers([]); // Reset users array before fetching new users

        const boardResponse = await boardApi.getOne(boardId); // Fetch board by ID
        const userIds = boardResponse.users; // Extract user IDs from the board response
        const Owner = boardResponse.boardAdmin;
        const response = await authApi.getAllUsers(); // Fetch all users
        const filteredUsers = response.filter(user => userIds.includes(user.id)); // Filter users by matching IDs

        
        const finalUsers = filteredUsers.filter(user => user.id !== User.id);
    
        setUsers(finalUsers);
        setBoardOwner(Owner);

        console.log(filteredUsers.map(user => user.username)); // Show filtered users in the console
      } catch (error) {
        console.log(error);
      }
    };

    fetchUsers();
  }, [boardId]);


 




  const addBoard = async () => {
    try {
      const res = await boardApi.create();
      const newList = [res, ...boards];
      dispatch(setBoards(newList));
      navigate(`/boards/${res.id}`);
  
      // Create a room for the new board
      await createRoom(res.id, members);
    } catch (err) {
      alert(err);
    }
  };


  const deleteBoard = async () => {
    try {
      await boardApi.delete(boardId)
      if (isFavourite) {
        const newFavouriteList = favouriteList.filter(e => e.id !== boardId)
        dispatch(setFavouriteList(newFavouriteList))
      }

      const newList = boards.filter(e => e.id !== boardId)
      if (newList.length === 0) {
        navigate('/boards')
      } else {
        navigate(`/boards/${newList[0].id}`)
      }
      dispatch(setBoards(newList))
    } catch (err) {
      alert(err)
    }
  }

  const handleMenuItemClick = (boardId) => {
    navigate(`/boards/${boardId}`);
  };

  

  const handleExpand = () => {
    setExpanded(!expanded);
  };

 const handleExpandchat = () => {
    setExpandedchat(!expandedchat);
  };
  // buttons effect 
  const handleClickOpen = (userId) => {
    setOpenUserId(userId);
  };


  const handleClose = () => {
    setOpenUserId(null);
  };




 
  
  const createRoom = async (boardId, members) => {
    try {
      await roomApi.createRoom(boardId, members);
      // Handle room creation success
    } catch (error) {
      // Handle error
      console.log(error);
    }
  };
  
  const handleCreateOrNavigateToRoom = async () => {
    try {
      const roomResponse = await roomApi.getRoomByBoardId(boardId);
     
      navigate(`/boards/${boardId}/room`);
    } catch (error) {
      // Handle error
      console.log('An error occurred while checking the room:', error);
    }
  };
  
  
  
  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setKey('');
    setSearchResults([]);
  
    try {
      if (!user._id) {
        console.error('Invalid user ID');
        console.log('User object:', user);
        return;
      }
  
      const userId = user._id;
      await boardApi.addUserToBoard(boardId, { userId }); // Pass userId as { userId: user._id }
      console.log(`User ${userId} added to board with ID ${boardId}`);
      setIsLoading(true);
      
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };
  

  const handleSearch = async () => {
    try {
      if (!key.trim()) {
        setSearchResults([]);
        return;
      }

      const res = await axios.get('http://localhost:5000/api/v1/auth/search', {
        params: { key: key, limit: 5 }
      });

      if (res.data && Array.isArray(res.data)) {
        const filteredData = res.data.filter((item) =>
          item.username.toLowerCase().includes(key.toLowerCase())
        );
        setSearchResults(filteredData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [key]);
  
  
  
  
  
  
  
  
  
  


  return (
    <>
    <Box  display={"flex"} justifyContent={"space-between"}  marginTop={0}   backgroundColor={colors.primary[400]}    sx={{ width: '100%' ,  height: '5.6vh', }}>
        <Box
        display="flex"
        borderRadius="3px"   justifyContent="space-between">
          <IconButton  sx={{borderRadius: '4px', '&:hover': { borderRadius: '4px'},p: 1,}} >
          <Lottie  options={defaultOptions} width={25} height={25}   />
              <Typography marginLeft={'2px'} >MetaDev</Typography>
          </IconButton>



          <ListItemButton  onClick={handleExpand}  sx={{borderRadius: '4px', '&:hover': { borderRadius: '4px'}, p: 1, marginLeft:2}}>
        <ListItemIcon>
          <DashboardIcon />
          <ListItemText primary="Projets" />
        </ListItemIcon>
        <ExpandMore />
        {expanded && (
          <Box
            display="flex"
            borderRadius="3px"
            sx={{
              backgroundColor: colors.primary[400],
              position: 'fixed',
              zIndex: 9999,
              top: '6vh',
              marginLeft:'-7px'
            }}
          >
            {boards.length > 0 && (
              <List sx={{ height:'100%'}}>
                {boards.map((board) => (
                  <ListItemButton key={board.id} onClick={() => handleMenuItemClick(board.id)} >
                    <ListItemText primary={board.title} />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
        )}
      </ListItemButton>


 





      <ListItemButton sx={{ borderRadius: '4px', '&:hover': { borderRadius: '4px' }, p: 1, marginLeft: 2 }}>
  <ListItemIcon>
    <StarOutlineIcon />
    <ListItemText primary="favorites" />
  </ListItemIcon>
  <ExpandMore />
</ListItemButton>

      <IconButton onClick={addBoard}    sx={{borderRadius: '4px', '&:hover': { borderRadius: '4px'}, p: 1, marginLeft:2}}> 
      <Typography>Créer</Typography>
      <AddBoxOutlinedIcon  />
    </IconButton>
    {BoardOwner === User.id && (
    <IconButton color="error"  onClick={deleteBoard}  sx={{ height:'85%', borderRadius: '4px', '&:hover': { borderRadius: '4px'},  marginTop:'2px' , marginLeft:'15px'}}>
       <DeleteOutlineIcon  />
    </IconButton>

)}

   
        </Box>

      {/* ICONS */}
      <Box display="flex">
      <Box>
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
        height={'85%'}
        width={'auto'}
        marginTop={'2px'}
        marginRight={'20px'}
        
      >

        <InputBase       sx={{ ml: 2, flex: 1 }}
          placeholder="Rechercher"
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)} />
        <IconButton    sx={{ height:'85%',borderRadius: '4px',  '&:hover': {backgroundColor: 'transparent',   color: 'inherit' },  p: 1 ,  cursor: 'default' ,  marginTop:'2px'}}>
    
 
  
          <PersonAddAltOutlinedIcon />
        </IconButton>
      </Box>
      <Box display="flex" borderRadius="3px" sx={{ backgroundColor: colors.primary[400], position: 'fixed', zIndex: 9999, display: 'flex' }}>
  {searchResults.length > 0 && (
    <List>
      {searchResults.map((result) => (
        <ListItemButton
          key={result._id} // Add unique key prop
          onClick={() => handleUserSelect(result)}
          sx={{
            backgroundColor: result === selectedUser ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
          }}
        >
          {isLoading ? (
            <CircularProgress />
          ) : (
            <>
              <IconButton>
                <img src={`https://robohash.org/${result.username}`} style={{ width: '30px', borderRadius: '50%', backgroundColor: 'grey' }} alt="User" />
              </IconButton>
              <Typography>{result.username}</Typography>
            </>
          )}
        </ListItemButton>
      ))}
    </List>
  )}
</Box>

      </Box>

      <IconButton sx={{ height:'85%', borderRadius: '4px', '&:hover': { borderRadius: '4px'},  marginTop:'2px'}}
  
    onClick={handleCreateOrNavigateToRoom}
  >
    <GroupsOutlinedIcon />
  </IconButton>       
        <IconButton sx={{ height:'85%', borderRadius: '4px', '&:hover': { borderRadius: '4px'},  marginTop:'2px'}}>
          <NotificationsOutlinedIcon />
        </IconButton>
        <IconButton sx={{ height:'85%', borderRadius: '4px', '&:hover': { borderRadius: '4px'},  marginTop:'2px'}}>
          
          <ChatOutlinedIcon   onClick={handleExpandchat} />
        
        {expandedchat && (
          <Box
            display="flex"
            borderRadius="15px"
            sx={{
              backgroundColor: colors.primary[400],
              position: 'fixed',
              zIndex: 9999,
              top: '6vh',
              height:'400px',
              width:'200px',
              justifyContent:'center',
              overflow:'auto'
            }}
          >
        

 
        <Menu iconShape="square">
  {users.map((user) => (
    <div key={user.id}>
      <MenuItem
        style={{ listStyle: 'none' , marginRight:'20%'}}
        onClick={() => handleClickOpen(user.id)}
        icon={<img src={`https://robohash.org/${user.username}`} style={{ width: '40px', borderRadius: '50%', backgroundColor: colors.primary[400] }} alt="User" />}
      >
        <ListItemText primary={user.username} secondary={`#${user.role}`} />
      </MenuItem>
      {openUserId === user.id && <Profile userId={user.id} onClose={handleClose} />}
    </div>
  ))}
</Menu>

      
          </Box>
        )}
    
     
        </IconButton>
        <IconButton    sx={{ height:'85%', borderRadius: '4px', '&:hover': { borderRadius: '4px'},  marginTop:'2px'}}>
        <img src={`https://robohash.org/${User.username}`} style={{ width: '30px', borderRadius: '50%', backgroundColor: 'grey' }} alt="User" />
      </IconButton>
      <IconButton onClick={handleModeToggle}> <Brightness4Icon /></IconButton>

        <IconButton color="inherit" onClick={logout}  sx={{ height:'85%', borderRadius: '4px', '&:hover': { borderRadius: '4px'},  marginTop:'2px'}}>
      <LogoutOutlinedIcon />
    </IconButton>
      </Box>

     
        
      
    </Box>

    
    </>
  );
};

export default TopBar;
/*
   <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent:'space-between',
            width: '100%',
          }}
        >
          <Box 
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap : '.5rem',
          }}>
          <IconButton variant='outlined' onClick={addFavourite}>
            {isFavourite ? (
              <ShareIcon color='warning' />
            ) : (
              <ShareIcon />
            )}
          </IconButton>
          <IconButton variant='outlined' color='error' onClick={deleteBoard}>
            <DeleteOutlinedIcon />
          </IconButton>
          </Box>
   
          <Box 
              sx={{
                alignItems: 'center',
                justifyContent:'space-between',
                height: 'auto',
              }}>
         <SearchComponent boardId={boardId} sections={sections} setSections={setSections} />
    
     
         </Box>
 
              
            <Box 
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap : '.5rem',
          }}> 
          <Box   sx={{
            display: 'flex',
            alignItems: 'center',
     
          }}>
            <IconButton>
           <AccountCircleSharpIcon  fontSize='small'  sx={{ marginRight: '8px' }} />
           </IconButton>
            <Typography variant='body2' fontWeight='700'>
              {user.username}
            </Typography>
            <IconButton onClick={logout}>
              <LogoutOutlinedIcon fontSize='small' />
            </IconButton>
            </Box>
          </Box>
        </Box>*/