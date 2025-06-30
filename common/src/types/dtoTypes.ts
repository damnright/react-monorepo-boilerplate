/*
* The reason why using classes instead of interfaces is to ensure that the fields of DTOs can be used for object mapping in api.
*/
import { z } from 'zod';

export class UserResDto {
  id: string | undefined;
  name: string = '';
  email?: string = '';
}

export class UserReqDto {
  id : string;
  constructor(id: string) {
    this.id = id;
  }
}

export class HelloResDto {
  message: string = '';
}

// Authentication DTOs
export const LoginDTOSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
  rememberMe: z.boolean().optional(),
});

export const RegisterDTOSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符').max(50, '姓名最多50个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
});

export const UpdateUserDTOSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符').max(50, '姓名最多50个字符').optional(),
  avatar: z.string().url('请输入有效的头像URL').optional(),
  role: z.enum(['admin', 'user']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export const ChangePasswordDTOSchema = z.object({
  oldPassword: z.string().min(6, '旧密码至少6位'),
  newPassword: z.string().min(6, '新密码至少6位'),
});

// 查询参数 DTO
export const PaginationDTOSchema = z.object({
  page: z.number().min(1, '页码必须大于0').default(1),
  limit: z.number().min(1, '每页数量必须大于0').max(100, '每页数量不能超过100').default(10),
});

export const UserQueryDTOSchema = PaginationDTOSchema.extend({
  role: z.enum(['admin', 'user']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  search: z.string().optional(),
});

export const ActivityQueryDTOSchema = PaginationDTOSchema.extend({
  type: z.string().optional(),
  userId: z.string().optional(),
});

// 导出类型
export type LoginDTO = z.infer<typeof LoginDTOSchema>;
export type RegisterDTO = z.infer<typeof RegisterDTOSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserDTOSchema>;
export type ChangePasswordDTO = z.infer<typeof ChangePasswordDTOSchema>;
export type PaginationDTO = z.infer<typeof PaginationDTOSchema>;
export type UserQueryDTO = z.infer<typeof UserQueryDTOSchema>;
export type ActivityQueryDTO = z.infer<typeof ActivityQueryDTOSchema>;

export class LogoutResDto {
  message: string = '';
}

