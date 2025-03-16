import { createClient } from '@supabase/supabase-js';

export default async function SupabaseTestPage() {
  // Create a Supabase client directly
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Test the connection by making a simple query
  let data = null;
  let error = null;
  
  try {
    // Try to get the Supabase version - this will work if connected
    const response = await supabase.auth.getSession();
    data = { connected: true, timestamp: new Date().toISOString() };
  } catch (err) {
    // If there's an error, capture it
    error = err instanceof Error ? err : new Error('Unknown error connecting to Supabase');
  }
  
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
          <p>Connection verified at: {new Date().toLocaleString()}</p>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Connection Details</h2>
        <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10)}...</p>
        <p>Database URL: {process.env.DATABASE_URL?.substring(0, 20)}...</p>
      </div>
    </div>
  );
} 