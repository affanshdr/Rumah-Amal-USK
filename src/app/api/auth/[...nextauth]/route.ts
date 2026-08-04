import { handlers } from '@/lib/auth';

// bcryptjs requires Node.js runtime (not Edge)
export const runtime = 'nodejs';

export const { GET, POST } = handlers;
