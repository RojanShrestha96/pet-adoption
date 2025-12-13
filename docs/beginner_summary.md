# Beginner's Guide: What We Changed & How It Works

Here is a simple breakdown of everything we added and fixed, explained step-by-step.

## 1. The Notification System (New Feature)
**Goal:** Let users know when something important happens (like an adoption update), instead of just showing a static page.

### Step 1: The "Brain" (Backend/Database)
*   **What we did:** We created a new "folder" in the database called `Notifications`.
*   **How it works:** Think of this like an inbox. When an event happens (e.g., "Application Approved"), the system writes a note card and drops it in this folder for the specific user. It writes down: *Who is it for? What does it say? Have they read it yet?*

### Step 2: The "Messenger" (API)
*   **What we did:** We built a bridge between the website and the database.
*   **How it works:** 
    *   **Fetching:** Every 60 seconds, your browser sends a secret signal to the server: *"Any new messages for me?"*
    *   **Marking as Read:** When you click a message, the browser tells the server: *"Okay, I saw this one, mark it as read."*

### Step 3: The "Face" (Frontend/UI)
*   **What we did:**
    *   **The Bell:** Added a bell icon in the top-right Navbar. If you have unread messages, it shows a red badge (like Facebook or Instagram).
    *   **The Dropdown:** Clicking the bell opens a quick list of your recent alert.
    *   **The Profile Tab:** In your **User Profile**, we added a **"Notifications"** tab. This is your "Archive" where you can see *everything*, even old messages.

---

## 2. The Theme System (The "Glitch" Fix)
**Goal:** Make the "Lavender" or "Friendly" theme colors appear *immediately*, without that split-second white/transparent flash (the "glitch").

### The Problem (Before)
The website would load the structure (HTML) first, *then* run the code to paint the colors (Theme Switcher). This gap caused the "flash of unstyled content" (FOUC).

### The Fix (After)
*   **Moved the Logic:** We took the color-picking logic out of the little specific "Theme Switcher" button and moved it to a global "Manager" (called `ThemeContext`).
*   **Blocked the View:** We told the website: *"Do not show anything to the user until you know what color they want."*
*   **Result:** Now, the moment the curtain lifts, the stage is already fully painted. No more flickering.

### Visual Changes
*   **Navbar:** Removed the "Palette" icon. It's cleaner now, just the **Notification Bell**.
*   **Profile Page:** Moved the **Theme Switcher** to the **Preferences** tab. This is a better home for settings that you don't change very often.

---

## Summary of New Files
*   `NotificationCenter.tsx`: The Bell and Dropdown component.
*   `ThemeContext.tsx`: The invisible manager that fixes the colors.
*   `Notification.js` (Backend): The database blueprint for messages.
*   `notificationController.js` (Backend): The logic for saving/reading messages.
