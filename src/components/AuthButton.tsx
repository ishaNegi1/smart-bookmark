"use client";

import { useSupabase } from "@/components/SupabaseProvider";

export function AuthButton() {
  const { supabase, session, loading } = useSupabase();

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}`
      }
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <button
        className="rounded-md bg-slate-700 px-4 py-2 text-sm text-slate-100"
        disabled
      >
        Loading...
      </button>
    );
  }

  if (!session) {
    return (
      <button
        onClick={handleSignIn}
        className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow hover:bg-slate-100 sm:mt-0 mt-2"
      >
        Sign in with Google
      </button>
    );
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-md border border-slate-500 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700 sm:mt-0 mt-2"
    >
      Sign out
    </button>
  );
}

