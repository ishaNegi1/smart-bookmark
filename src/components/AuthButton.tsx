"use client";

import { useSupabase } from "@/components/SupabaseProvider";

export function AuthButton() {
  const { supabase, session, loading, signupCompleted } = useSupabase();

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}`,
        queryParams: {
          prompt: "select_account" // Always show Google account picker
        }
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

  if (!session || !signupCompleted) {
    if (!session) return (
      <div className="flex flex-col sm:flex-row gap-2 sm:mt-0 mt-2">
        <button
          onClick={handleSignIn}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow hover:bg-slate-100"
        >
          Sign in with Google
        </button>
        <button
          onClick={handleSignIn}
          className="rounded-md border border-slate-500 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
        >
          Sign up with Google
        </button>
      </div>
    );
    return null;
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

