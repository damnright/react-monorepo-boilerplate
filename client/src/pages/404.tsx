import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h1" component="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'primary.main' }}>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          页面未找到
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          抱歉，您访问的页面不存在或已被移除。
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            onClick={() => navigate({ to: '/' })}
            sx={{ mr: 2 }}
          >
            返回首页
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.history.back()}
          >
            返回上页
          </Button>
        </Box>
      </Box>
    </Container>
  );
} 