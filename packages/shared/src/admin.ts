import { z } from "zod";
import { idSchema, paginationQuerySchema, roleSchema } from "./common.js";
import { loginSchema, passwordSchema } from "./auth.js";

/**
 * Markaz admini (CENTER_ADMIN) endpointlari: /api/admin/*
 * Hammasi tenant ichida: centerId JWT dan, body'da yo'q.
 */

/** POST /api/admin/users - o'quvchi yoki o'qituvchi yaratish, vaqtinchalik parol bilan */
export const createMemberBodySchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  login: loginSchema,
  temporaryPassword: passwordSchema,
  role: roleSchema.exclude(["CENTER_ADMIN"]),
  groupId: idSchema.optional(),
});
export type CreateMemberBody = z.infer<typeof createMemberBodySchema>;

/** PATCH /api/admin/users/:id */
export const updateMemberBodySchema = z.object({
  fullName: z.string().trim().min(2).max(80).optional(),
  isActive: z.boolean().optional(),
  /** Yangi vaqtinchalik parol: mustChangePassword = true bo'ladi */
  temporaryPassword: passwordSchema.optional(),
});
export type UpdateMemberBody = z.infer<typeof updateMemberBodySchema>;

/** GET /api/admin/users?role=&groupId=&search=&page=&limit= */
export const listMembersQuerySchema = paginationQuerySchema.extend({
  role: roleSchema.optional(),
  groupId: idSchema.optional(),
  search: z.string().trim().max(80).optional(),
});
export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>;

export const memberItemSchema = z.object({
  membershipId: idSchema,
  userId: idSchema,
  fullName: z.string(),
  login: z.string(),
  role: roleSchema,
  isActive: z.boolean(),
  mustChangePassword: z.boolean(),
  groups: z.array(z.object({ id: idSchema, name: z.string() })),
  createdAt: z.string(),
});
export type MemberItem = z.infer<typeof memberItemSchema>;

/** Guruh: bitta o'qituvchi + o'quvchilar */
export const createGroupBodySchema = z.object({
  name: z.string().trim().min(2).max(60),
  teacherUserId: idSchema.optional(),
});
export type CreateGroupBody = z.infer<typeof createGroupBodySchema>;

export const updateGroupBodySchema = createGroupBodySchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateGroupBody = z.infer<typeof updateGroupBodySchema>;

/** POST /api/admin/groups/:id/students { userIds } - qo'shish; DELETE .../students/:userId - olib tashlash */
export const groupStudentsBodySchema = z.object({
  userIds: z.array(idSchema).min(1).max(100),
});
export type GroupStudentsBody = z.infer<typeof groupStudentsBodySchema>;

export const groupItemSchema = z.object({
  id: idSchema,
  name: z.string(),
  isActive: z.boolean(),
  teacher: z.object({ userId: idSchema, fullName: z.string() }).nullable(),
  studentCount: z.number().int(),
  createdAt: z.string(),
});
export type GroupItem = z.infer<typeof groupItemSchema>;

/** GET /api/admin/overview - admin bosh sahifasi uchun raqamlar */
export const adminOverviewSchema = z.object({
  students: z.number().int(),
  teachers: z.number().int(),
  groups: z.number().int(),
  center: z.object({ id: idSchema, name: z.string(), slug: z.string(), isActive: z.boolean() }),
});
export type AdminOverview = z.infer<typeof adminOverviewSchema>;
