import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export default async function SupabaseTestPage() {
  const cookieStore = cookies();
  const supabase = createClient();
  
  // Test the connection by getting the Supabase system time
  const { data, error } = await supabase.rpc('get_system_time');
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error connecting to Supabase</p>
          <p>{error.message}</p>
        </div>
      ) : (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Successfully connected to Supabase!</p>
          <p>Server time: {data ? JSON.stringify(data) : 'No data returned'}</p>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Connection Details</h2>
        <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10)}...</p>
      </div>
    </div>
  );
} 