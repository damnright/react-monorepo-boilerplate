import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  TextField,
  Button,
  Alert,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Email } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { useFormError } from '@/hooks/useFormError';
import { PasswordField } from '@/components/ui/PasswordField';
import { LoginFormSchema, type LoginFormData } from '@/schemas/formSchemas';

export function LoginForm() {
  const { login } = useAuth();
  const { error, isLoading, executeAsync } = useFormError();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginFormSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await executeAsync(async () => {
      await login(data);
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        {...register('email')}
        fullWidth
        label="邮箱地址"
        type="email"
        error={!!errors.email}
        helperText={errors.email?.message}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email />
            </InputAdornment>
          ),
        }}
      />

      <PasswordField
        {...register('password')}
        fullWidth
        label="密码"
        error={!!errors.password}
        helperText={errors.password?.message}
        margin="normal"
      />

      <FormControlLabel
        control={<Checkbox {...register('rememberMe')} />}
        label="记住我"
        sx={{ mt: 1 }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading}
        sx={{ mt: 3, mb: 2 }}
      >
        {isLoading ? '登录中...' : '登录'}
      </Button>
    </Box>
  );
} 