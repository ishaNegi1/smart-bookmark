<h1>Real Development Challenges Faced During Building Smart Bookmark Manager</h1> <p>This project used Next.js App Router + Supabase Auth + Google OAuth + Realtime database. The main challenge was not implementing features, but keeping authentication, session persistence, and UI state synchronized.</p> <p>Below are real problems faced and how they were solved.</p>
<h2>1. Could Not Switch Google Accounts</h2> <h3>Problem</h3> Clicking “Sign in with Google” always logged into the previously used Gmail automatically. <h3>Cause</h3> Google reuses the existing login session silently for faster authentication. <h3>Solution</h3> Forced Google account chooser: <pre>queryParams: { prompt: "select_account" }</pre>
<h2>2. Sign In and Sign Up Behaved Identically</h2> <h3>Problem</h3> Both buttons performed the same action, causing confusion in UI logic. <h3>Cause</h3> OAuth does not distinguish between signup and login. The identity provider only confirms identity; the backend decides whether the user already exists. <h3>Solution</h3> Handled onboarding using user metadata: <pre> signup_completed: true </br> If false → show onboarding </br> If true → open dashboard </pre>
<h2>3. OAuth Redirect Completed but UI Still Showed “Sign in”</h2> <h3>Problem</h3> After Google login, Supabase authenticated the user but the UI still showed “Sign in” until refresh. <h3>Cause</h3> OAuth works through a full page redirect, so `signInWithOAuth()` does not return a session and React state did not update automatically. <h3>Solution</h3> Added authentication state listener: <pre> supabase.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession ?? null); }); </pre>

UI now updates immediately after login.

<h2>4. Long URLs Breaking UI Layout</h2> <h3>Problem</h3> Long bookmark URLs overflowed outside the card layout. <h3>Cause</h3> Flex items use `min-width: auto` by default, preventing text from shrinking inside the container. <h3>Solution</h3> Applied Tailwind fix: <pre>min-w-0 truncate break-all</pre>

Links now stay properly inside the card.

<h2>Final Understanding</h2>

The hardest part of the project was synchronizing OAuth identity verification, Supabase session persistence, and the React rendering lifecycle.
