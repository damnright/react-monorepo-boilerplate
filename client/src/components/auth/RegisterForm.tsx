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
import { Email, Person } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { useFormError } from '@/hooks/useFormError';
import { PasswordField } from '@/components/ui/PasswordField';
import { RegisterFormSchema, type RegisterFormData } from '@/schemas/formSchemas';
import { type RegisterDTO } from 'common';

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const { error, isLoading, executeAsync } = useFormError();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterFormSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    await executeAsync(async () => {
      const registerData: RegisterDTO = {
        name: data.name,
        email: data.email,
        password: data.password,
      };
      await registerUser(registerData);
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
        {...register('name')}
        fullWidth
        label="姓名"
        error={!!errors.name}
        helperText={errors.name?.message}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Person />
            </InputAdornment>
          ),
        }}
      />

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

      <PasswordField
        {...register('confirmPassword')}
        fullWidth
        label="确认密码"
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        margin="normal"
      />

      <FormControlLabel
        control={
          <Checkbox
            {...register('agreeToTerms')}
            color={errors.agreeToTerms ? 'error' : 'primary'}
          />
        }
        label="我同意服务条款和隐私政策"
        sx={{ mt: 1 }}
      />
      {errors.agreeToTerms && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {errors.agreeToTerms.message}
        </Alert>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading}
        sx={{ mt: 3, mb: 2 }}
      >
        {isLoading ? '注册中...' : '注册'}
      </Button>
    </Box>
  );
} 