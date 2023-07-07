import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme, ListItem, ListItemAvatar, Avatar, ListItemText, List, Divider, IconButton, Modal, Fade } from '@mui/material';
import { ColorModeContext, tokens } from "../../theme";
import WorkIcon from '@mui/icons-material/Work';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import authApi from '../../api/authApi';
import MessageComponent from './MessageComponent';
import CloseIcon from '@mui/icons-material/Close';

const Profile = ({ userId, onClose }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [user, setUser] = useState(null);
  const [receiver, setReceiver] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authApi.getUserById(userId);
        setUser(response);
        setReceiver(response);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, [userId]);

  if (!user) {
    return null; // Render nothing or a loading indicator while user data is being fetched
  }

  const modalStyle = {
    display: 'flex',
    width: '50vw',
    minHeight: '50vh',
    mx: 'auto',
    my: '5vh',
    p: 2,
    backgroundColor: colors.primary[400],
    boxShadow: 24,
    borderRadius: 4,
    outline: 'none',
    overflow:'auto',
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <Modal open={user !== null} closeAfterTransition>
        <Box sx={modalStyle}>
          {/* Profile content here */}
     
        
           <List  sx={{ width: '50%', height:'100%', }}>
            {/* Render user profile data */}
         <Box display="flex" justifyContent="space-between" justifyItems={'center'} width={'100%'} height={'100%'}>
          <img src={`https://robohash.org/${user.username}`} style={{ backgroundColor: colors.primary[300], width: '80px', borderRadius: '50%', objectFit: 'cover' }} alt="User" />
          <IconButton disableRipple><AddBoxOutlinedIcon fontSize="large" /></IconButton>
        </Box>
        <Divider component="li" />
        <li>
          <Typography sx={{ mt: 0.5, ml: 2 }} color="text.secondary" display="block" variant="body1">
            {user.username}
          </Typography>
        </li>
        <ListItem>
          <ListItemText primary="Number" secondary={user.number} />
        </ListItem>
        <Divider component="li" variant="inset" />
        <li>
          <Typography sx={{ mt: 0.5, ml: 9 }} color="text.secondary" display="block" variant="caption">
            {user.role}
          </Typography>
        </li>
        <ListItem>
          <ListItemAvatar>
            <Avatar>
              <WorkIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Email" secondary={user.email} />
        </ListItem>
      </List>
      <Box  sx={{ width: '50%', height:'80vh', overflow:'auto'}} >
      <MessageComponent receiver={receiver}  />
      </Box>
      <Box>
          <IconButton
           
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton></Box>
        </Box>
      </Modal>
    </>
  );
};

export default Profile;
/*    <Box  sx={{
              marginLeft:'95%',
              marginBottom:'50%',
              color: theme.palette.grey[500],
            }}>
          <IconButton
           
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton></Box>*/