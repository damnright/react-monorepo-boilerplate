import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Alert,
} from '@mui/material';
import { UpdateUserDTOSchema, type UserInfo, type UpdateUserDTO } from 'common';

const userFormSchema = UpdateUserDTOSchema.extend({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位').optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: UserInfo | null;
  onSave: (data: UserFormData) => void;
  onClose: () => void;
}

export function UserForm({ user, onSave, onClose }: UserFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        }
      : {
          role: 'user',
          status: 'active',
        },
  });

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onSave(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setIsLoading(false);
    }
  };

  const isEditing = !!user;

  return (
    <>
      <DialogTitle>
        {isEditing ? '编辑用户' : '添加新用户'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
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
          />

          <TextField
            {...register('email')}
            fullWidth
            label="邮箱地址"
            type="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            margin="normal"
            disabled={isEditing} // 编辑时不允许修改邮箱
          />

          {!isEditing && (
            <TextField
              {...register('password')}
              fullWidth
              label="密码"
              type="password"
              error={!!errors.password}
              helperText={errors.password?.message}
              margin="normal"
            />
          )}

          <FormControl fullWidth margin="normal">
            <InputLabel>角色</InputLabel>
            <Select
              {...register('role')}
              value={watch('role')}
              label="角色"
              onChange={(e) => setValue('role', e.target.value as 'admin' | 'user')}
            >
              <MenuItem value="user">普通用户</MenuItem>
              <MenuItem value="admin">管理员</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  {...register('status')}
                  checked={watch('status') === 'active'}
                  onChange={(e) =>
                    setValue('status', e.target.checked ? 'active' : 'inactive')
                  }
                />
              }
              label="激活状态"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            取消
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? '保存中...' : '保存'}
          </Button>
        </DialogActions>
      </form>
    </>
  );
} 