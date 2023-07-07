import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './css/custom-scrollbar.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';
import Home from './pages/Home';
import Board from './pages/Board';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Room from './pages/room';
import ChatRoom from './components/common/MessageComponent';
import { useState } from 'react';
import { useMode } from './theme';
import Dashboard from './pages/dashboard';

function App() {
  const [theme, colorMode] = useMode();

  const themeConfig = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return (
    <ThemeProvider theme={themeConfig}>
      <CssBaseline />

          <Routes>
            <Route path="/" element={<AuthLayout colorMode={colorMode} />}>
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
            </Route>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="boards" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard/>}/>
              <Route path="boards/:boardId" element={<Board />} />
              <Route path="boards/:boardId/Room" element={<Room />} />
         
            </Route>
          </Routes>
    </ThemeProvider>
  );
}

export default App;
