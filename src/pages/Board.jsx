import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import { Box, Drawer, IconButton, List, ListItem, ListItemButton, Typography , TextField } from '@mui/material'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import boardApi from '../api/boardApi'
import EmojiPicker from '../components/common/EmojiPicker'
import Kanban from '../components/common/Kanban'
import { setBoards } from '../redux/features/boardSlice'
import { setFavouriteList } from '../redux/features/favouriteSlice.js'
import SearchComponent from '../components/common/SearchComponent';
import Loading from '../components/common/Loading';
import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp';
import axios from 'axios';
import EditBar from '../components/common/EditBar'
import authApi from '../api/authApi';
import axiosClient from '../api/axiosClient';




let timer
const timeout = 500

const Board = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { boardId } = useParams()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sections, setSections] = useState([])
  
  const [icon, setIcon] = useState('')
  const [loading, setLoading] = useState(true)
  const user = useSelector((state) => state.user.value)
  const boards = useSelector((state) => state.board.value)
  const favouriteList = useSelector((state) => state.favourites.value)
  const [isFavourite, setIsFavourite] = useState(false)
  const [boardAdmin, setisboardAdmin] = useState('')


  useEffect(() => {

    const getBoard = async () => {
      try {
        setLoading(true); // Set isLoading to true when starting the data fetching
        const res = await boardApi.getOne(boardId);
        setTitle(res.title);
        setDescription(res.description);
        setSections(res.sections);
        setIsFavourite(res.favourite);
        setisboardAdmin(res.boardAdmin)
        setIcon(res.icon);
      } catch (err) {
        alert(err);
      } finally {
        setLoading(false); // Set isLoading to false regardless of success or failure
      }
    };
  
    getBoard();
  }, [boardId]);

  

  const [results, setResults] = useState([]);


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

  const updateTitle = async (e) => {
    clearTimeout(timer)
    const newTitle = e.target.value
    setTitle(newTitle)

    let temp = [...boards]
    const index = temp.findIndex(e => e.id === boardId)
    temp[index] = { ...temp[index], title: newTitle }

    if (isFavourite) {
      let tempFavourite = [...favouriteList]
      const favouriteIndex = tempFavourite.findIndex(e => e.id === boardId)
      tempFavourite[favouriteIndex] = { ...tempFavourite[favouriteIndex], title: newTitle }
      dispatch(setFavouriteList(tempFavourite))
    }

    dispatch(setBoards(temp))

    timer = setTimeout(async () => {
      try {
        await boardApi.update(boardId, { title: newTitle })
      } catch (err) {
        alert(err)
      }
    }, timeout);
  }

  const updateDescription = async (e) => {
    clearTimeout(timer)
    const newDescription = e.target.value
    setDescription(newDescription)
    timer = setTimeout(async () => {
      try {
        await boardApi.update(boardId, { description: newDescription })
      } catch (err) {
        alert(err)
      }
    }, timeout);
  }

 

  return (
      <>
     <div style={{ height: '100%', width: '100%' }}>
    {loading ? (
      <Loading fullHeight />
    ) : (
      <>
        <EditBar />
        <Box>

          <Box sx={{ padding: '5px 30px' }}>
            {/* emoji picker */}
            <Box style={{ width: '50px', height: '50px' }}>
            <EmojiPicker icon={icon} onChange={onIconChange}  disabled={user.id !== boardAdmin}   sx={{
          width: '20px', // Adjust the width as desired
          height: '20px', // Adjust the height as desired
        }} /></Box>
            <TextField
              value={title}
              onChange={updateTitle}
              placeholder='Untitled'
              variant='outlined'
              fullWidth
              disabled={user.id !== boardAdmin}
              sx={{
                '& .MuiOutlinedInput-input': { padding: 0 },
                '& .MuiOutlinedInput-notchedOutline': { border: 'unset' },
                '& .MuiOutlinedInput-root': { fontSize: '1rem', fontWeight: '500' },
              }}
            />
            <Box sx={{ height: `calc(50px - ${window.innerHeight - document.documentElement.clientHeight}px)`, overflow: 'auto' }}>
            <TextField
  value={description}
  onChange={updateDescription}
  placeholder='Add a description'
  variant='outlined'
  multiline
  fullWidth
  disabled={user.id !== boardAdmin}
  sx={{
    '& .MuiOutlinedInput-input': {
      padding: 0,
      maxHeight: '3em',
      overflow: 'auto',
      wordWrap: 'break-word',
      lineHeight: '1em',
      resize: 'vertical',
    },
    '& .MuiOutlinedInput-notchedOutline': { border: 'unset' },
    '& .MuiOutlinedInput-root': { fontSize: '0.7rem' },
  }}
/></Box>
          </Box>
          <Box >
            {/* Kanban board */}
            
            <Kanban data={sections} boardId={boardId} />
          </Box>
        </Box>
      </>
    )}
    </div>
  </>
  )
}

export default Board