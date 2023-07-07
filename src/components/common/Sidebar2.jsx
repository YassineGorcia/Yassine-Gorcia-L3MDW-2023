import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ProSidebar, Menu, MenuItem , SubMenu } from "react-pro-sidebar";
import { Box, Drawer, IconButton, List, ListItem, ListItemButton, Typography ,useTheme , Divider , Button , Snackbar} from '@mui/material'
import { tokens } from "../../theme";
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { Link, useNavigate, useParams } from 'react-router-dom'
import "../../css/styles.css"
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import boardApi from '../../api/boardApi'
import authApi from '../../api/authApi'; // Import the updated authApi
import assets from '../../assets'
import FavouriteList from './FavouriteList'
import { setBoards } from '../../redux/features/boardSlice'
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined'
import Members from './Members';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupsIcon from '@mui/icons-material/Groups';
import SpeedSharpIcon from '@mui/icons-material/SpeedSharp';
import ShareIcon from '@mui/icons-material/Share';
import Profile from './Profile';




const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
 
  return (
    
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selected, setSelected] = useState("Dashboard");
  const user = useSelector((state) => state.user.value)
  const boards = useSelector((state) => state.board.value)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { boardId } = useParams()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeUserIndex, setActiveUserIndex] = useState(0);
  const [users, setUsers] = useState([]);
  const [BoardOwner, setBoardOwner] = useState('');

  const [ws, setWs] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
 
  

  const sidebarWidth = 200

    useEffect(() => {
    const fetchUsers = async () => {
      try {
        const boardResponse = await boardApi.getOne(boardId); // Fetch board by ID
        const userIds = boardResponse.users; // Extract user IDs from the board response
        const Owner = boardResponse.boardAdmin;
        const response = await authApi.getAllUsers(); // Fetch all users
        const filteredUsers = response.filter(user => userIds.includes(user.id)); // Filter users by matching IDs
    
        setUsers(filteredUsers);
        setBoardOwner(Owner);
                   // Establish WebSocket connection
    const clientId = user.id; // Replace with the actual client ID
    const socket = new WebSocket('ws://localhost:5000', clientId);

    socket.onopen = () => {
      console.log('WebSocket connection established');
      setWs(socket);
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
      setShowPopup(true);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
      
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
    
    
  }, [boardId]);

  useEffect(() => {
    const getBoards = async () => {
      try {
        const res = await boardApi.getAll()
        dispatch(setBoards(res))
      } catch (err) {
        alert(err)
      }
    }
    getBoards()
  }, [dispatch])




  const handleDashboardClick = () => {
    if (selected === "Dashboard") {
      return; // Return early if already on the dashboard
    }

    navigate(`/dashboard`);
    setSelected("Dashboard");
  };


  const handleMenuItemClick = (boardId) => {
    navigate(`/boards/${boardId}`);
     // Disconnect from the room when navigating to another board

     return () => {
   
     };
  };


  const handlePopupClose = () => {
    setShowPopup(false);
  };


  return (
    <Box
      sx={{
      
        height: '100%',
        '& > div': { borderRight: 'none' },
        
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 10px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
        
      }}
    >
      <ProSidebar collapsed={isCollapsed} sx={{ width: '200px' }}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
             
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box display="flex" justifyContent="space-between" alignItems="center"  >
                <Typography variant='body2' fontWeight='700'>
              {user.role}
              
            </Typography>
            
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />

                </IconButton>
                
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
              <img src={`https://robohash.org/${user.username}` }  style={{ width: '100px', borderRadius: '50%', backgroundColor: colors.primary[400] }} alt='app logo' />

              </Box>
              <Box textAlign="center">
              <Typography variant='body2' fontWeight='700'>
              {user.username}
            </Typography>
            
                <Typography variant='body2' fontWeight='700' color={colors.greenAccent[500]}>
                {user.email}
                
                </Typography>
                
              </Box>
            </Box>
          )}
            
          <Box>
          {BoardOwner === user.id && (
        <Item
          title="Dashboard"
          to={`/dashboard`}
          icon={<SpeedSharpIcon />}
          selected={selected}
          onClick={handleDashboardClick}
          setSelected={setSelected}
          sx={{ display: 'flex', justifyContent: 'center'}}
        />
        )}
           <Divider  />
           
             <SubMenu  icon={<DashboardIcon />}  title="Projets">
                   {boards.map((board) => (
        <ListItemButton key={board.id} onClick={() => handleMenuItemClick(board.id)}>
          {isCollapsed ? board.icon : (
              <>
            {board.icon} {board.title}
                 </>
                )}
           </ListItemButton>
      
               ))} 
           </SubMenu> 
           <Divider  />   
           <SubMenu icon={<GroupsIcon />}  title="Membres de l'équipe" >
       
        <Members  />   
             </SubMenu>
          </Box>
        </Menu>
      </ProSidebar>
      <Snackbar
        open={showPopup}
        autoHideDuration={3000}
        onClose={handlePopupClose}
        message={`New message received: ${messages[messages.length - 1]?.content}`}
        action={
          <Button color="inherit" size="small" onClick={handlePopupClose}>
            Close
          </Button>
         
          
        }
      />
    </Box>
    
  );
};

export default Sidebar;