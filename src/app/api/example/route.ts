import { getEnvContext } from '@/lib/getEnvContext';

export async function GET() {
  const { env } = getEnvContext();
  
  // This will work in both production and local environments
  const aiResponse = await env.AI.run('Hello');
  const dbResult = await env.DB.query('SELECT * FROM table');
  
  return Response.json({ aiResponse, dbResult });
} 