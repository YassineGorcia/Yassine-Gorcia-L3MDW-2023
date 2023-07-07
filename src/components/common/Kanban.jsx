import { Box, Button, Typography, Divider, TextField, IconButton, Card ,Select, MenuItem, Chip , Snackbar , Alert, colors} from '@mui/material'
import { useEffect, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import sectionApi from '../../api/sectionApi'
import taskApi from '../../api/taskApi'
import authApi from '../../api/authApi';
import boardApi from '../../api/boardApi'
import { useSelector, useDispatch } from 'react-redux'
import TaskModal from './TaskModal'
import ParticlesBackGround from '../ParticlesBackGround'
import Moment from 'moment';
import Board from '../../pages/Board'

let timer
const timeout = 500

const Kanban = props => {
  const boardId = props.boardId
  const [data, setData] = useState([])
  const [selectedTask, setSelectedTask] = useState(undefined)
  const user = useSelector((state) => state.user.value)
  const [filteredSections, setFilteredSections] = useState([]);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState('all');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filterClicked, setFilterClicked] = useState(false);
  const [users, setUsers] = useState([]);
  const [BoardOwner, setBoardOwner] = useState('');
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  useEffect(() => {
    setData(props.data)
  }, [props.data])

  useEffect(() => {
    setFilteredSections(data);
  }, [data]);

  const onDragEnd = async ({ source, destination }) => {
    if (!destination) return
    const sourceColIndex = data.findIndex(e => e.id === source.droppableId)
    const destinationColIndex = data.findIndex(e => e.id === destination.droppableId)
    const sourceCol = data[sourceColIndex]
    const destinationCol = data[destinationColIndex]

    const sourceSectionId = sourceCol.id
    const destinationSectionId = destinationCol.id

    const sourceTasks = [...sourceCol.tasks]
    const destinationTasks = [...destinationCol.tasks]

    if (source.droppableId !== destination.droppableId) {
      const [removed] = sourceTasks.splice(source.index, 1)
      destinationTasks.splice(destination.index, 0, removed)
      data[sourceColIndex].tasks = sourceTasks
      data[destinationColIndex].tasks = destinationTasks
    } else {
      const [removed] = destinationTasks.splice(source.index, 1)
      destinationTasks.splice(destination.index, 0, removed)
      data[destinationColIndex].tasks = destinationTasks
    }

    try {
      await taskApi.updatePosition(boardId, {
        resourceList: sourceTasks,
        destinationList: destinationTasks,
        resourceSectionId: sourceSectionId,
        destinationSectionId: destinationSectionId
      })
      setData(data)
    } catch (err) {
      alert(err)
      
    }
  }

  const createSection = async () => {
    try {
      const section = await sectionApi.create(boardId)
      setData([...data, section])
    } catch (err) {
      alert(err)
    }
  }

  const deleteSection = async (sectionId) => {
    try {
      await sectionApi.delete(boardId, sectionId)
      const newData = [...data].filter(e => e.id !== sectionId)
      setData(newData)
    } catch (err) {
      alert(err)
    }
  }

  const updateSectionTitle = async (e, sectionId) => {
    clearTimeout(timer)
    const newTitle = e.target.value
    const newData = [...data]
    const index = newData.findIndex(e => e.id === sectionId)
    newData[index].title = newTitle
    setData(newData)
    timer = setTimeout(async () => {
      try {
        await sectionApi.update(boardId, sectionId, { title: newTitle })
      } catch (err) {
        alert(err)
      }
    }, timeout);
  }

  const createTask = async (sectionId) => {
    try {
      const task = await taskApi.create(boardId, { sectionId })
      const newData = [...data]
      const index = newData.findIndex(e => e.id === sectionId)
      newData[index].tasks.unshift(task)
      setData(newData)
    } catch (err) {
      alert(err)
    }
  }

  const onUpdateTask = (task) => {
    const newData = [...data]
    const sectionIndex = newData.findIndex(e => e.id === task.section.id)
    const taskIndex = newData[sectionIndex].tasks.findIndex(e => e.id === task.id)
    newData[sectionIndex].tasks[taskIndex] = task
    setData(newData)
  }

  const onDeleteTask = (task) => {
    const newData = [...data]
    const sectionIndex = newData.findIndex(e => e.id === task.section.id)
    const taskIndex = newData[sectionIndex].tasks.findIndex(e => e.id === task.id)
    newData[sectionIndex].tasks.splice(taskIndex, 1)
    setData(newData)
  }

  const getCardBackgroundColor = (sectionId) => {
    const sectionIndex = data.findIndex((section) => section.id === sectionId);
    const colorIndex = sectionIndex % 4;
  
    const colors = ['#264D58', '#582353', '#2F1D3B', '#637030'];
    const color = colors[colorIndex];
  
    return color;
  };
  
  const handleSectionChange = (event) => {
    const value = event.target.value;
    setSelectedSectionIndex(value);
    if (value === "all") {
      setFilteredSections(data);
    } else {
      filterSections(value);
    }
  };


  const filterSections = (sectionIndex) => {
    const filteredData = data.filter((section, index) => index === sectionIndex);
    setFilteredSections(filteredData);
  };

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
      } catch (error) {
        console.log(error);
      }
    };
 
    fetchUsers();
  }, [boardId]);

  const getTaskMemberUsernames = (memberIds) => {
    const memberUsernames = memberIds.map((memberId) => {
      const member = users.find((user) => user.id === memberId);
      return member ? member.username : memberId;
    });
    return memberUsernames;
  };



const userIsTaskMember = (taskId) => {
  const task = data.flatMap((section) => section.tasks).find((task) => task.id === taskId);
  return task &&  ( (task.members && task.members.length <= 0 ) || task.members.includes(user.id) || user.id === BoardOwner);
};
const handlePopupClose = () => {
  setShowPopup(false);
};

  

  return (
    <>
 
    <Box  sx={{p:1,height: '45px', width: '100%'}} >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Button onClick={createSection}   >
         <Typography fontWeight={'bold'} >Add section</Typography> 
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' , paddingRight:'20px'}}>
   
        <Select
  value={selectedSectionIndex}
  onChange={handleSectionChange}
  size="small" 
  width='50px'
>
  <MenuItem value="all">All</MenuItem>
  {data.map((section, index) => (
    <MenuItem key={section.id} value={index}>{section.title}</MenuItem>
  ))}
</Select>
      </Box>
      </Box>
      </Box>
      <Divider sx={{ margin: '10px 0' }} />
  
    <Box sx={{display:'flex' , maxHeight:'56vh',overflowX: 'auto' , marginLeft:'10px'}}>
  <DragDropContext onDragEnd={onDragEnd} sx={{overflowX: 'auto', }}>
  <Box sx={{
          display: 'flex',
          alignItems: 'flex-start',
          width: 'calc(100% - (100% * 2 / 100))',
          overflowX: 'auto'
        }}>
             {
            filteredSections.map((section) => (
              <div key={section.id} style={{ width: 'auto' }}>
           <Card
                sx={{
                  width: 250,
                  display: 'flex',
                   flexDirection: 'column',
                   marginRight: '20px',
                    padding: '10px',
                   backgroundColor: 'transparent',
                   opacity: 1,
                 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <TextField
                  size="small"
                   defaultValue={section.title}
                    onBlur={(e) => updateSectionTitle(e, section.id)}
                     variant="standard"/>
                    <IconButton size="small" onClick={() => deleteSection(section.id)}>
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Droppable droppableId={section.id} key={section.id}>
                    {(provided, snapshot) => (
                      <Box
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        sx={{
                          minHeight: '80px',
                          marginTop: '10px',
                          borderRadius: '5px'
                        }}
                      >
                        
                       
                        {section.tasks.map((task, index) => (
                          
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  userSelect: 'none',
                                  padding: 16,
                                  margin: '0 0 8px 0',
                                  minHeight: '50px',
                                  borderRadius:'16px',
                                  backgroundColor: getCardBackgroundColor(section.id),
                                  color: 'white',
                                  transition: 'opacity 0.3s ease',
                                 
                                
                                  ...provided.draggableProps.style
                                }}
                                onClick={() => {
                                  if (userIsTaskMember(task.id)) {
                                    setSelectedTask(task);
                                  } else {
                                    setShowWarning(true);
                                  }
                                }}
                              >   

                                  <Typography variant='h5'  >
                                  {task.title === '' ? 'Untitled' : task.title}
                                </Typography>
                                <Typography  variant='caption'  sx={{'& .MuiOutlinedInput-root': { fontSize: '0.5rem' },}}>
                                 {task.deadline === null ? '' : Moment(task.deadline).format('YYYY-MM-DD')  }
                                 </Typography>
                                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', marginTop: '20px' }}>
                                    {getTaskMemberUsernames(task.members).map((username, index) => (
                                       <div key={index}>
                                        <img src={`https://robohash.org/${username}`} style={{ width: '30px', borderRadius: '50%', backgroundColor: 'azure'}} alt="User" />
                                       </div>
                                           ))}
                                        </Box>
                             
                              </div>
                            )}
                          </Draggable>
                        )) }
                        {provided.placeholder}
                        <Button
                          size="small"
                          startIcon={<AddOutlinedIcon />}
                          onClick={() => createTask(section.id)}
                          
                          sx={{ mt: 1 }}
                        >
                          Add Task
                        </Button>
                      </Box>
                    )}
                  </Droppable>
                </Card>
              </div>
            ))
          }
        </Box>
      </DragDropContext>
      </Box> 
      <ParticlesBackGround />
      <TaskModal
        task={selectedTask}
        boardId={boardId}
        onClose={() => setSelectedTask(undefined)}
        onUpdate={onUpdateTask}
        onDelete={onDeleteTask}
      />
      {showWarning && (
  <Snackbar open={true} onClose={() => setShowWarning(false)}>
    <Alert severity="warning" onClose={() => setShowWarning(false)}>
      You are not a member of this task.
    </Alert>
  </Snackbar>
)}
 
    </>
  )
}

export default Kanban