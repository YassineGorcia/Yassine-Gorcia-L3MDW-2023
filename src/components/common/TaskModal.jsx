import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import {
  Backdrop,
  Box,
  Button,
  Fade,
  IconButton,
  Modal,
  TextField,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Input,
  CardMedia,
  useTheme ,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Select
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CodeIcon from '@mui/icons-material/Code';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Moment from 'moment';
import taskApi from '../../api/taskApi';
import commentApi from '../../api/commentApi';
import CodeEditor from '@monaco-editor/react';


import {  tokens } from "../../theme";
import authApi from '../../api/authApi';
import boardApi from '../../api/boardApi';
import { useSelector, useDispatch } from 'react-redux'

import { Send } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';





let timer;
const timeout = 5000;
let isModalClosed = false;

const TaskModal = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const boardId = props.boardId;
  const [task, setTask] = useState(props.task);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [etiquettes, setEtiquettes] = useState([]);
  const [members, setMembers] = useState([]);
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [comment, setComment] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const editorRef = useRef();
  const [searchResults, setSearchResults] = useState([]);
  const [users, setUsers] = useState([]);
  const user = useSelector((state) => state.user.value)
  const [selectedMedia, setSelectedMedia] = useState(null);
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [duration, setDuration] = useState(0);
  const [chartData, setChartData] = useState(null);

  const modalStyle = {
  
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '70%',
    minHeight: '50%',
    mx: 'auto',
    my: '5vh',
    p: 2,
    backgroundColor: colors.primary[400],
    boxShadow: 24,
    borderRadius: 4,
    outline: 'none',
    overflow:'auto',
  };
  useEffect(() => {
    setTask(props.task);
   
    setTitle(props.task !== undefined ? props.task.title : '');
    setContent(props.task !== undefined ? props.task.content : '???');
    setEtiquettes(props.task !== undefined ? props.task.etiquettes : []);
    setMembers(props.task !== undefined ? props.task.members : []);
    setDeadline(props.task !== undefined ? props.task.deadline : '');
    setDescription(props.task !== undefined ? props.task.description : '');
    setDuration(props.task !== undefined ? props.task.duration : '');
    
    if (props.task !== undefined) {
      isModalClosed = false;
      updateEditorHeight();
      fetchComments(props.task.id);
    }

  }, [props.task]);

  

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const boardResponse = await boardApi.getOne(boardId); // Fetch board by ID
        const userIds = boardResponse.users; // Extract user IDs from the board response


        const response = await authApi.getAllUsers(); // Fetch all users
        const filteredUsers = response.filter(user => userIds.includes(user.id)); // Filter users by matching IDs
    
        setUsers(filteredUsers);
      
      } catch (error) {
        console.log(error);
      }
    };
 
    fetchUsers();
    
  }, [boardId, task]);

  const updateEditorHeight = () => {
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    }, timeout);
  };

  const onClose = () => {
    isModalClosed = true;
    props.onUpdate(task);
    setComment(null);
    props.onClose();
  };

  const deleteTask = async () => {
    try {
      await taskApi.delete(boardId, task.id);
      props.onDelete(task);
      setTask(undefined);
    } catch (err) {
      alert(err);
    }
  };
  const countDuration = () => {
    setDuration((prevDuration) => prevDuration + 1 + duration);
  };
  
  useEffect(() => {
    if (!isModalClosed) {
    
        timer = setInterval(countDuration, 1000);
      
    } else {
      // Clear the interval when the modal is closed
      clearInterval(timer);
    }
  
    // Clear the interval when the component unmounts
    return () => clearInterval(timer);
  }, [isModalClosed, chartData]);
  
  const updateTitle = async (e) => {
    clearTimeout(timer);
    const newTitle = e.target.value;
    timer = setTimeout(async () => {
      try {
        await taskApi.update(boardId, task.id, { title: newTitle });
      } catch (err) {
        alert(err);
      }
    }, timeout);

    task.title = newTitle;
    setTitle(newTitle);
    props.onUpdate(task);
  };

  const updateContent = (value) => {
    clearTimeout(timer);
    const data = value;

    if (!isModalClosed) {
      timer = setTimeout(async () => {
        try {
          await taskApi.update(boardId, task.id, { content: data });
        } catch (err) {
          alert(err);
        }
      }, timeout);

      task.content = data;
      setContent(data);
      props.onUpdate(task);
    }
  };

  const handleAddEtiquette = (e) => {
    const newEtiquette = e.target.value;
    setEtiquettes((prevEtiquettes) => [...prevEtiquettes, newEtiquette]);
    e.target.value = '';
  };

  const handleDeleteEtiquette = (index) => {
    const updatedEtiquettes = [...etiquettes];
    updatedEtiquettes.splice(index, 1);
    setEtiquettes(updatedEtiquettes);
  };

  const handleAddMember = (selectedUser) => {
    // Check if the selected user is already in the task's user list
    const isUserAlreadyAdded = members.includes(selectedUser.id);
    
    if (isUserAlreadyAdded) {
      // User is already added, display a message or handle it as needed
      console.log("User is already added to the task.");
    } else {
      // User is not added, add them to the task's user list by their ID
      setMembers(prevMembers => [...prevMembers, selectedUser.id]);
    }
  };
  
  const handleDeleteMember = (index) => {
    const updatedMembers = [...members];
    updatedMembers.splice(index, 1);
    setMembers(updatedMembers);
  };

  const handleDateChange = (date) => {
    setDeadline(new Date(date));
  };

  const handleMediaUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedMedia(file);
    } else {
      setSelectedMedia(null);
    }
  };

  const handleMediaRead = () => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedMedia(e.target.result);
    };
    reader.readAsDataURL(selectedMedia);
  };

  const handleSave = async () => {
    try {
      const currentDate = Moment().format('YYYY-MM-DD HH:mm');// Get the current date and time
      const updatedTask = {
        ...task,
        title,
       
        etiquettes,
        members,
        deadline,
        description,
        comment,
        mediaFile,
        lastUpdate: currentDate, // Add the current date and time to the updated task
        duration,
      };
      await taskApi.update(boardId, task.id, updatedTask);
      setTask(updatedTask);
      props.onUpdate(updatedTask);
    } catch (err) {
      alert(err);
    }
  };
  



  

  const fetchComments = async (taskId) => {
    try {
      const response = await commentApi.getCommentsByTaskId(taskId);
      console.log('Response:', response);
  
      if (Array.isArray(response)) {
        // Response is an array of comments
        const commentsData = response;
        console.log('Comments:', commentsData);
  
        // Fetch comment owners for each comment
        const updatedCommentsData = await Promise.all(commentsData.map(async (comment) => {
          const commentOwner = await authApi.getUserById(comment.user);
          return {
            ...comment,
            commentOwner: commentOwner.username
          };
        }));
  
        setComments(updatedCommentsData);
      } else if (response && response.data) {
        // Response is an object with data property
        const commentsData = response.data;
        console.log('Comments:', commentsData);
  
        // Fetch comment owners for each comment
        const updatedCommentsData = await Promise.all(commentsData.map(async (comment) => {
          const commentOwner = await authApi.getUserById(comment.user);
          return {
            ...comment,
            commentOwner: commentOwner.username
          };
        }));
  
        setComments(updatedCommentsData);
      } else {
        console.log('Invalid response data:', response);
      }
    } catch (error) {
      console.error('Error retrieving comments:', error);
    }
  };

  
  
  
  
  
  

  

    
  
  const handleCommentSubmit = async (boardId, taskId, user) => {
    try {
      const newComment = await commentApi.createComment(taskId, user.id, comment);
  
      console.log('Comment:', newComment.content);
      console.log('Task ID:', newComment.task);
      console.log('User ID:', newComment.user);
  
      setComment('');
      
      // Fetch updated comments after adding a new comment
      fetchComments(task.id);
    } catch (error) {
      console.log(error);
    }
  };
  
  
  
  const [showCodeEditor, setShowCodeEditor] = useState(false);

  const handleCodeIconClick = () => {
    setShowCodeEditor(true);
  };

  const handleClose = () => {
    setShowCodeEditor(false);
  };
  
  const [language, setLanguage] = useState('javascript');

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const languageOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    // Add more language options as needed
  ];


  return (
    <Modal
      open={task !== undefined}
      onClose={onClose}
      closeAfterTransition >
    
      <Fade  in={task !== undefined}>
  
        
        <Box   sx={modalStyle}>
        {showCodeEditor ? (
          <>
        <Box
  sx={{
    display: 'flex',
    height: '85vh',
    width: '100vw',
    flexDirection: 'column',
    padding: '0rem 0rem 3rem'
  }}
>
  <CodeEditor
    language={language} // Pass the selected language as the language prop
    value={content}
    onChange={updateContent}
    options={{
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: {
        enabled: false,
      },
      fontSize: 14,
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      wrappingIndent: 'same',
      folding: false,
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      renderIndentGuides: true,
      selectionHighlight: true,
      readOnly: false,
      fontFamily: 'Consolas, Menlo, "Courier New", monospace',
    }}
  />

 

  <Box display="flex" justifyContent="flex-end" marginTop={'5px'}>
  <Select
    value={language}
    onChange={handleLanguageChange}
    sx={{ mr:'10px' }}
  >
    {languageOptions.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
  </Select>
    <Button variant="contained" onClick={handleClose}>
      Back
    </Button>
  </Box>
</Box>
         </>
          ) : (
            <>
       
     
          <Box
            sx={{
              display: 'flex',
              height: '89vh',
              width:'100vw',
              flexDirection: 'column',
              padding: '0.1rem 2rem 0rem'
              
            }}
          >
            <Box display={'flex'} pl={'95%'}>
              <IconButton  variant="outlined" color="error" onClick={deleteTask}>
              <DeleteOutlinedIcon />
            </IconButton>
            </Box>
            <TextField
            
              value={title}
              onChange={updateTitle}
              placeholder="Untitled"
              variant="outlined"
              fullWidth
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-input': { padding: 0 },
                '& .MuiOutlinedInput-notchedOutline': { border: 'unset ' },
                '& .MuiOutlinedInput-root': {
                  fontSize: '2.5rem',
                  fontWeight: '700'
                },
                marginBottom: '5px'
              }}
            />
            <Typography variant="body2" fontWeight="700">
            Created Date:  {task !== undefined
                ? Moment(task.createdAt).format('YYYY-MM-DD')
                : ''}
            </Typography>
            <Typography variant="body2" fontWeight="700">
            Deadline :  {task !== undefined
                ? Moment(deadline).format('YYYY-MM-DD')
                : ''}
            </Typography>
       
            <Divider sx={{ margin: '1.5rem 0' }} />
            <Box  display="flex" alignItems="flex-start"    sx={{height: '100%',overflow: 'auto',}}  >
                  
         
              <Box display={'flex'} sx={{  width:'80%' , flexWrap: 'wrap', }} >
       
      
              {etiquettes.map((etiquette, index) => (
                <Box
                  key={index}
                  display="flex"
                  alignItems="center"
                  height={'40px'}
                  border="1px solid"
                  mt={1}
                  mr={1}
                  p={1}
                  borderRadius={16}
                  borderColor="primary.main"
                  width="fit-content"
                  
                >
                  <Typography variant="body2">{etiquette}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteEtiquette(index)}
                  >
                    <DeleteOutlinedIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
        <Box display={'flex'} sx={{ width:'80%', flexWrap: 'wrap' }}>
  {members.map((memberId, index) => {
    const member = users.find(user => user.id === memberId);
    return (
      <Box
        key={index}
        display="flex"
        alignItems="center"
        height={'40px'}
        border="1px solid"
        mt={1}
        mr={1}
        p={1}
        borderRadius={16}
        borderColor="primary.main"
        width="fit-content"
      >
        <img src={`https://robohash.org/${member ? member.username : memberId}`} style={{ width: '30px', borderRadius: '50%', backgroundColor: 'grey' }} alt="User" />
        <Typography variant="body2" pl={1}>{member ? member.username : memberId}</Typography>
        <IconButton
          size="small"
          onClick={() => handleDeleteMember(index)}
        >
          <ClearIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  })}
</Box>
<Box >
{selectedMedia && (
        <Box marginTop="1rem">
          <InputLabel>Preview img</InputLabel>
          <CardMedia component="img" src={URL.createObjectURL(selectedMedia)} alt="Selected Image" sx={{  width: '150px', height: '150px' }} />
        </Box>
      )} </Box>
  

<TextField
                  label="Description"
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={5} // Set the maximum number of visible rows
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{
                    top:'10px',
                  maxWidth: '90%',
                  maxHeight: '10rem', // Set the maximum height in any unit you prefer
                  overflow: 'inherit', // Enable vertical scrolling if the content exceeds the height
                  paddingRight:'20px',
                 
                      }}
                />
<Box
  variant="standard"
  display="flex"
  flexDirection="column"
 
  sx={{
    top: '50px',
    maxHeight: '10rem',
    overflow: 'inherit',
    paddingTop: '5%'
  }}
>
  <Box
    display="flex"
    alignItems="center"
    sx={{
      paddingBottom: '20px',
    }}
  >
    <TextField
      label="Comment"
      variant="standard"
      fullWidth
      value={comment}
      onChange={(e) => setComment(e.target.value)}
    />
    <IconButton variant="contained" onClick={() => handleCommentSubmit(boardId, task, user)}>
      <Send />
    </IconButton>
  </Box>

  <Box variant="standard" alignItems="flex-start" >
  {comments.length > 0 ? (
    <List>
      {comments.map((comment, index) => (
        <ListItem pr={5} key={index}>
            <img  src={`https://robohash.org/${comment.commentOwner}`} style={{ width: '30px', borderRadius: '50%', backgroundColor:'azure' , marginRight:'5px'}} alt="User" />
          <ListItemText  primary={comment.content} />
        </ListItem>
      ))}
    </List>
  ) : (
    <p></p>
  )}
</Box>

</Box>

    


             </Box>
         
   

           
                  <Box  display={'flex'}  flexDirection="column"   sx={{ marginLeft: 'auto',
                width: '20%' ,height: '100%'
                }}>
                  
          

       
                <List  sx={{ 
                    paddingBottom:'20px',
                    }}>
                   {users.map(user => (
                   <ListItem key={user.id}  onClick={() => handleAddMember(user)}>
                    <img src={`https://robohash.org/${user.username}`} style={{ width: '30px', borderRadius: '50%', backgroundColor:'azure'  , marginRight:'5px'  }} alt="User" />
                    <ListItemText  secondary={user.username} />
                    </ListItem>
                  ))}
                </List>

                <TextField
                  label="Etiquettes"
                  variant="outlined"
                  fullWidth
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddEtiquette(e);
                    }
                  }}
                  sx={{ 
               paddingBottom:'20px',
                }}
                />




 
      <LocalizationProvider dateAdapter={AdapterDayjs}>
<DatePicker
  label="Select a date"

  onChange={handleDateChange}
  renderInput={(params) => <TextField {...params} />}
/>
</LocalizationProvider>

<Box display="flex" alignItems="center">
      
      <InputLabel htmlFor="upload-media">
        <IconButton component="span">
          <AttachFileIcon />
        </IconButton>
        Select Media
      </InputLabel>
      <Input
        id="upload-media"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleMediaUpload}
      />
     
    </Box>
    <Box display="flex" alignItems="center">
      
      <InputLabel>
        <IconButton component="span">
         <CodeIcon onClick={handleCodeIconClick} />
        </IconButton>
        Add Script
      </InputLabel>
    </Box>
            
              </Box>
        
              </Box>
              
              <Box  display="flex" justifyContent="flex-end">
                <Button variant="contained" onClick={handleSave}>
                  Save
                </Button>
              </Box>
          </Box>
          </>
          )}
        </Box>
      
        
      </Fade>
  
    </Modal>
  );
};

export default TaskModal;
