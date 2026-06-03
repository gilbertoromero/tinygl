import { env } from '../../config/env';
import { UserSchema, UsersResponseSchema } from './schemas/api.schema';

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.VITE_API_URL;
  }

  async fetchUsers() {
    try {
      const response = await fetch(`${this.baseUrl}/users`);
      if (!response.ok) {
        throw new Error(`Error fetching users: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // End-to-end type safety validation via Zod
      return UsersResponseSchema.parse(data);
    } catch (error) {
      console.error('API validation error:', error);
      throw error;
    }
  }

  async fetchUserById(id: string) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${id}`);
      if (!response.ok) {
        throw new Error(`Error fetching user: ${response.statusText}`);
      }

      const data = await response.json();
      return UserSchema.parse(data);
    } catch (error) {
      console.error('API validation error:', error);
      throw error;
    }
  }
}

export const api = new ApiClient();
