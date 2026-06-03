import { z } from 'zod';

// Example Schema for user data
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  isActive: z.boolean(),
});

export type User = z.infer<typeof UserSchema>;

export const UsersResponseSchema = z.array(UserSchema);
