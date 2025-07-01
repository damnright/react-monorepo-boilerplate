import { z } from 'zod';
import { RegisterDTOSchema, LoginDTOSchema, UpdateUserDTOSchema } from 'common';

/**
 * 注册表单schema - 扩展基础RegisterDTO
 */
export const RegisterFormSchema = RegisterDTOSchema.extend({
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: '请同意服务条款',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

/**
 * 登录表单schema - 直接使用基础LoginDTO
 */
export const LoginFormSchema = LoginDTOSchema;

/**
 * 用户表单schema - 扩展基础UpdateUserDTO
 */
export const UserFormSchema = UpdateUserDTOSchema.extend({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位').optional(),
});

/**
 * 密码修改表单schema
 */
export const ChangePasswordFormSchema = z.object({
  currentPassword: z.string().min(6, '当前密码至少6位'),
  newPassword: z.string().min(6, '新密码至少6位'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '两次输入的新密码不一致',
  path: ['confirmPassword'],
});

// 导出类型
export type RegisterFormData = z.infer<typeof RegisterFormSchema>;
export type LoginFormData = z.infer<typeof LoginFormSchema>;
export type UserFormData = z.infer<typeof UserFormSchema>;
export type ChangePasswordFormData = z.infer<typeof ChangePasswordFormSchema>; 