import { cookies } from 'next/headers';
import { verifyAuthToken } from './auth';

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    const error = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }
  return user;
}
