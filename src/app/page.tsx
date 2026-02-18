"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { AuthButton } from "@/components/AuthButton";

type Bookmark = {
  id: string;
  url: string;
  title: string;
  created_at: string;
  user_id: string;
};

export default function HomePage() {
  const { supabase, session, loading } = useSupabase();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  useEffect(() => {
    if (!session) {
      setBookmarks([]);
      return;
    }

    const load = async () => {
      setInitialLoading(true);
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setBookmarks(data as Bookmark[]);
      } else if (error) {
        console.error(error);
      }

      setInitialLoading(false);
    };

    void load();
  }, [session, supabase]);

  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        payload => {
          setBookmarks(current => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as Bookmark;
              return [row, ...current];
            }

            if (payload.eventType === "DELETE") {
              const row = payload.old as Bookmark;
              return current.filter(b => b.id !== row.id);
            }

            if (payload.eventType === "UPDATE") {
              const row = payload.new as Bookmark;
              return current.map(b => (b.id === row.id ? row : b));
            }

            return current;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, supabase]);

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();

    if (!session || !url.trim() || !title.trim()) return;

    setSubmitting(true);

    const { error } = await supabase.from("bookmarks").insert({
      url: url.trim(),
      title: title.trim(),
      user_id: session.user.id
    });

    if (error) {
      console.error(error);
    } else {
      setUrl("");
      setTitle("");
    }

    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);

    if (error) {
      console.error(error);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900/70 p-6 shadow-xl ring-1 ring-slate-800 sm:my-3">
        <header className="mb-6 flex sm:flex-row flex-col items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Smart Bookmark App
            </h1>
            <p className="text-sm text-slate-400">
              Save bookmarks, synced live across tabs.
            </p>
          </div>
          <AuthButton />
        </header>

        {loading ? (
          <p className="text-sm text-slate-400">Checking session...</p>
        ) : !session ? (
          <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
            Sign in with Google to start managing your bookmarks.
          </div>
        ) : (
          <>
            <form
              onSubmit={handleAdd}
              className="mb-5 flex flex-col gap-3 rounded-lg bg-slate-900/70 p-4"
            >
              <h2 className="text-sm font-medium text-slate-200">
                Add a bookmark
              </h2>
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={event => setUrl(event.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={event => setTitle(event.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white shadow hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-500/60"
              >
                {submitting ? "Adding..." : "Add bookmark"}
              </button>
            </form>

            <section className="space-y-3">
              <h2 className="text-sm font-medium text-slate-200">
                Your bookmarks
              </h2>
              {initialLoading ? (
                <p className="text-sm text-slate-400">Loading bookmarks...</p>
              ) : bookmarks.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No bookmarks yet. Add your first one above.
                </p>
              ) : (
                <ul className="space-y-2">
                  {bookmarks.map(bookmark => (
                    <li
                      key={bookmark.id}
                      className="flex items-center justify-between gap-3 min-w-0 rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium text-slate-100">
                          {bookmark.title}
                        </div>
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noreferrer"
                          className=" block truncate text-xs  text-indigo-300 hover:underline"
                        >
                          {bookmark.url}
                        </a>
                        <div className="mt-0.5 text-[11px] text-slate-500">
                          {new Date(bookmark.created_at).toLocaleString()}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(bookmark.id)}
                        className="shrink-0 rounded-md border border-red-500/60 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

