import { getAllUsers, getUserById } from '../../../lib/db-helpers';
import { requireAuth } from '../../../lib/auth-server';

export async function GET(req) {
  try {
    await requireAuth();
    const users = await getAllUsers();
    return Response.json({ success: true, data: users });
  } catch (error) {
    if (error.status === 401) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
