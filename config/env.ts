import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url().default('https://api.example.com/v1'),
  VITE_ENVIRONMENT: z.enum(['development', 'production', 'test']).default('development'),
});

const getEnvVars = () => {
  // Using import.meta.env for Vite environment variables
  const parsed = envSchema.safeParse({
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_ENVIRONMENT: import.meta.env.MODE,
  });

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
};

export const env = getEnvVars();
