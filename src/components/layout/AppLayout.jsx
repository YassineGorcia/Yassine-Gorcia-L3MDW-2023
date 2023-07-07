import { Box } from '@mui/material'
import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import authUtils from '../../utils/authUtils'
import Loading from '../common/Loading'
import Sidebar from '../common/Sidebar2' 
import { setUser } from '../../redux/features/userSlice'
import { ColorModeContext, useMode } from "../../theme";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TopBar from '../common/TopBar'


const AppLayout = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const themeConfig = createTheme(theme);
  useEffect(() => {
    const checkAuth = async () => {
      const user = await authUtils.isAuthenticated()
      if (!user) {
        navigate('/login')
      } else {
        // save user
        dispatch(setUser(user))
        setLoading(false)
      }
    }
    checkAuth()
  }, [navigate])

  return (
    
    loading ? (
      <Loading fullHeight />
    ) : (
      <ThemeProvider theme={themeConfig}>
      <ColorModeContext.Provider value={colorMode}>
         <TopBar />
      <Box sx={{
        display: 'flex',
        height:'94.4vh',
        overflow:'auto',
      }}>
        <Sidebar isSidebar={isSidebar} />
       
        <Box sx={{
          flexGrow: 1,
          width:'80vw',
          overflow:'auto'

        }}>
          <Outlet setIsSidebar={setIsSidebar} />
        </Box>
      </Box>
      </ColorModeContext.Provider></ThemeProvider>
    )
  )
}

export default AppLayout