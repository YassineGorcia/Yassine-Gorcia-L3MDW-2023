import React, { useState, useEffect } from 'react';
import {  tokens } from "../../theme";
import { useNavigate, useParams } from 'react-router-dom'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import boardApi from '../../api/boardApi';
import authApi from '../../api/authApi'; // Import the updated authApi
import axios from 'axios';
import { setBoards } from '../../redux/features/boardSlice'
import { useSelector, useDispatch } from 'react-redux'
import { Box, List, ListItemButton, Typography, InputBase, IconButton, useTheme , CircularProgress  } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import { setFavouriteList } from '../../redux/features/favouriteSlice.js'
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Profile from './Profile';
import FilterListIcon from '@mui/icons-material/FilterList';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import sectionApi from '../../api/sectionApi';
import roomApi from '../../api/roomApi';



const EditBar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [searchResults, setSearchResults] = useState([]);
  const [key, setKey] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();
  const boards = useSelector((state) => state.board.value)
  const dispatch = useDispatch()
  const favouriteList = useSelector((state) => state.favourites.value)
  const [isFavourite, setIsFavourite] = useState(false)
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const user = useSelector((state) => state.user.value)
  const [isLoading, setIsLoading] = useState(false);
  const { boardId } = useParams()
  const [boardTitle, setBoardTitle] = useState('');
  const [icon, setIcon] = useState('')

   const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const boardResponse = await boardApi.getOne(boardId); // Fetch board by ID
        const userIds = boardResponse.users; // Extract user IDs from the board response
        const boardTitle = boardResponse.title; // Extract board title from the board response


        const response = await authApi.getAllUsers(); // Fetch all users
        const filteredUsers = response.filter(user => userIds.includes(user.id)); // Filter users by matching IDs
    
        setUsers(filteredUsers);
        setBoardTitle(boardTitle); // Set the board title in state
      
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
    
  }, [boardId]);


  const createSection = async () => {
    try {
      const section = await sectionApi.create(boardId)
      
    } catch (err) {
      alert(err)
    }
  }
 




  const onIconChange = async (newIcon) => {
    let temp = [...boards]
    const index = temp.findIndex(e => e.id === boardId)
    temp[index] = { ...temp[index], icon: newIcon }

    if (isFavourite) {
      let tempFavourite = [...favouriteList]
      const favouriteIndex = tempFavourite.findIndex(e => e.id === boardId)
      tempFavourite[favouriteIndex] = { ...tempFavourite[favouriteIndex], icon: newIcon }
      dispatch(setFavouriteList(tempFavourite))
    }

    setIcon(newIcon)
    dispatch(setBoards(temp))
    try {
      await boardApi.update(boardId, { icon: newIcon })
    } catch (err) {
      alert(err)
    }
  }

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

  const addFavourite = async () => {
    try {
      const board = await boardApi.update(boardId, { favourite: !isFavourite })
      let newFavouriteList = [...favouriteList]
      if (isFavourite) {
        newFavouriteList = newFavouriteList.filter(e => e.id !== boardId)
      } else {
        newFavouriteList.unshift(board)
      }
      dispatch(setFavouriteList(newFavouriteList))
      setIsFavourite(!isFavourite)
    } catch (err) {
      alert(err)
    }
  }



  // buttons effect 
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  


  return (
    <Box display="flex" justifyContent="space-between"  marginTop={0}     sx={{ width: '100%' ,  height: '5.6vh', }}>
        <Box
        display="flex"
        borderRadius="3px">
          <IconButton  sx={{borderRadius: '4px', '&:hover': { borderRadius: '4px'},p: 1,}} >
          <Typography>{boardTitle}</Typography>
          </IconButton>
          <IconButton variant='outlined' onClick={addFavourite}  sx={{borderRadius: '4px', '&:hover': { borderRadius: '4px'}, p: 1, marginLeft:2}} >
          {
            isFavourite ? (
              <StarOutlineIcon color='warning' />
            ) : (
              <StarBorderOutlinedIcon />
            )
          }
        </IconButton>
     
      <IconButton onClick={createSection}   sx={{borderRadius: '4px', '&:hover': { borderRadius: '4px'}, p: 1}}> 
      <Typography>ADD SECTION</Typography>
    </IconButton>
   
        </Box>

        
   
       

      {/* ICONS */}
      <Box display="flex">
  
  
             {/* SEARCH BAR */}
          <List p={1} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 1, marginRight: 1 }}>
  {users.map((member) => (
    <Box
      key={member.id} // Add unique key prop
      onClick={() => handleClickOpen(member.id)}
    >
      <img src={`https://robohash.org/${member.username}`} style={{ width: '30px', borderRadius: '50%', backgroundColor: colors.primary[400] }} alt="User" />
    </Box>
  ))}
</List>


        <IconButton sx={{borderRadius: '4px', '&:hover': { borderRadius: '4px'},p: 1,}}>
          <FilterListIcon />  <Typography>Filter</Typography>
        </IconButton>
        
    
      </Box>

    </Box>
  );
};

export default EditBar;
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