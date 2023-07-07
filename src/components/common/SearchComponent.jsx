import React, { useState, useEffect } from 'react';
import { Box, List, ListItemButton, Typography, InputBase, IconButton } from '@mui/material';
import assets from '../../assets/index';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import AccountCircleSharpIcon from '@mui/icons-material/AccountCircleSharp';
import boardApi from '../../api/boardApi';
import authApi from '../../api/authApi';
import axios from 'axios';

const SearchComponent = ({ boardId }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [key, setKey] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

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
    <Box>
      <Box display="flex" borderRadius="3px" sx={{ backgroundColor: assets.colors.secondary }}>
        <InputBase
          sx={{ ml: 2, flex: 1 }}
          placeholder="Search"
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          fullWidth
          size="small"
        />
        <IconButton type="button" sx={{ p: 1 }}>
          <PersonSearchIcon />
        </IconButton>
      </Box>
      <Box display="flex" borderRadius="3px" sx={{ backgroundColor: assets.colors.secondary, position: 'fixed', zIndex: 9999, display: 'flex' }}>
        {searchResults.length > 0 && (
          <List>
            {searchResults.map((result) => (
              <ListItemButton
                key={result._id}
                onClick={() => handleUserSelect(result)}
                sx={{
                  backgroundColor: result === selectedUser ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
                }}
              >
                <IconButton>
                  <AccountCircleSharpIcon fontSize="small" sx={{ marginRight: '8px' }} />
                </IconButton>
                <Typography>{result.username}</Typography>
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default SearchComponent;
