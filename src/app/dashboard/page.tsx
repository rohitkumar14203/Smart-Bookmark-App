"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Bookmark,
  Plus,
  LogOut,
  Trash2,
  ExternalLink,
  LayoutList,
} from "lucide-react";

type Bookmark = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  created_at: string;
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  const fetchBookmarks = useCallback(async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookmarks(data);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      // Handle OAuth code exchange
      const code = searchParams.get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
        // Clean up URL
        window.history.replaceState({}, "", "/dashboard");
      }

      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/");
        return;
      }

      setUser({
        id: data.session.user.id,
        email: data.session.user.email,
      });
      await fetchBookmarks();
      setLoading(false);
    };

    initAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          router.push("/");
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, searchParams, fetchBookmarks]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchBookmarks();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchBookmarks]);

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !user) return;

    setAdding(true);
    const { error } = await supabase.from("bookmarks").insert([
      {
        title: title.trim(),
        url: url.trim(),
        user_id: user.id,
      },
    ]);

    if (!error) {
      setTitle("");
      setUrl("");
    }
    setAdding(false);
  };

  const deleteBookmark = async (id: string) => {
    setDeletingId(id);
    await supabase.from("bookmarks").delete().eq("id", id);
    setDeletingId(null);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Smart Bookmark</h1>
              <p className="text-xs text-slate-400 truncate max-w-[150px] sm:max-w-none">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
          >
            <LogOut className="w-5 h-5" />

            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        {/* Add Bookmark Form */}
        <form
          onSubmit={addBookmark}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8 shadow-xl"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-400" />
            Add New Bookmark
          </h2>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={adding || !title.trim() || !url.trim()}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {adding ? (
                <span className="flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5 text-purple-400" />
                  Adding...
                </span>
              ) : (
                "Add Bookmark"
              )}
            </button>
          </div>
        </form>

        {/* Bookmarks List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <LayoutList className="w-5 h-5 text-purple-400" />
              Your Bookmarks
            </h2>
            <span className="text-sm text-slate-400 bg-white/5 px-3 py-1 rounded-full">
              {bookmarks.length} {bookmarks.length === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="grid gap-3">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="group bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate mb-1">
                      {bookmark.title}
                    </h3>

                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 text-sm hover:text-purple-300 transition-colors flex items-start gap-2 break-words"
                    >
                      <ExternalLink className="w-4 h-4 flex-shrink-0 mt-1" />
                      <span className="break-all">{bookmark.url}</span>
                    </a>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteBookmark(bookmark.id)}
                    disabled={deletingId === bookmark.id}
                    className="self-end sm:self-auto flex-shrink-0 p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                    title="Delete bookmark"
                  >
                    {deletingId === bookmark.id ? (
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Realtime indicator */}
        <div className="fixed bottom-4 right-4">
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10 text-sm text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Realtime sync active
          </div>
        </div>
      </main>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <DashboardContent />
    </Suspense>
  );
}
