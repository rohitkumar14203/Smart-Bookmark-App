# 📘 Smart Bookmark App

A simple bookmark manager built as part of a technical assessment.

------------------------------------------------------------------------

## 🚀 Live Demo

🔗 **Live URL:**\
[https://smart-bookmark-app-one-eta.vercel.app](https://smart-bookmark-app-one-eta.vercel.app/dashboard)

------------------------------------------------------------------------

# 📋 Project Requirements (Completed)

### ✅ 1. Google Authentication (OAuth Only)

-   Users can sign up and log in using **Google OAuth**
-   No email/password authentication
-   Implemented using Supabase Auth

------------------------------------------------------------------------

### ✅ 2. Add Bookmark

-   Logged-in users can add a bookmark
-   Each bookmark contains:
    -   Title
    -   URL

------------------------------------------------------------------------

### ✅ 3. Private Bookmarks (User Isolation)

-   Bookmarks are private per user
-   Implemented using:
    -   `user_id` column
    -   Supabase Row Level Security (RLS)
-   A user cannot see another user's bookmarks

------------------------------------------------------------------------

### ✅ 4. Real-time Updates

-   Bookmark list updates instantly:
    -   When a bookmark is added
    -   When a bookmark is deleted
-   Implemented using:
    -   Supabase Realtime
    -   `postgres_changes` subscription
-   Verified across multiple tabs

------------------------------------------------------------------------

### ✅ 5. Delete Bookmark

-   Users can delete only their own bookmarks
-   UI updates in real-time without refresh

------------------------------------------------------------------------

### ✅ 6. Deployment

-   Deployed on **Vercel**
-   Production OAuth redirect configured properly

------------------------------------------------------------------------

# 🛠 Tech Stack

-   **Next.js (App Router)**
-   **Supabase**
    -   Authentication (Google OAuth)
    -   PostgreSQL Database
    -   Realtime subscriptions
-   **Tailwind CSS**
-   **lucide-react (icons)**

------------------------------------------------------------------------

# 🔐 Row Level Security (RLS)

Enabled on `bookmarks` table.

Policies:

-   Users can SELECT their own bookmarks
-   Users can INSERT their own bookmarks
-   Users can DELETE their own bookmarks

This ensures full user data isolation.

------------------------------------------------------------------------

# ⚙️ How to Run Locally

``` bash
git clone <repo-url>
cd smart-bookmark
npm install
npm run dev
```

Create a `.env` file:

    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

------------------------------------------------------------------------

# 🎯 Final Notes

-   The application strictly follows the given requirements.
-   No additional features were added.
-   Fully functional with:
    -   Authentication
    -   Private data
    -   Realtime updates
    -   Production deployment

------------------------------------------------------------------------

## 👨‍💻 Created By

**Rohit Kumar**
