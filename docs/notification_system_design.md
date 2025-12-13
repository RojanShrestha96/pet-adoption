# Notification System Design & Guide

You asked for a "Senior Mentor" guide to building a professional notification system. Here is the step-by-step breakdown.

## 1. Simple vs. Full System
| Feature | Simple (Polling/Toasts) | Full Management System (Database + Websockets) |
| :--- | :--- | :--- |
| **Persistence** | None (disappears on refresh) | **Permanent** (Available on login/history) |
| **Delivery** | Only if user is online | **Guaranteed** (Stored in DB) |
| **Complexity** | Low (React State) | **Medium/High** (DB, API, Real-time) |
| **Use Case** | Error messages, "Saved" success | **Adoption updates, System alerts, User interactions** |

## 2. Recommendation
For **PetMate**, you need a **Full Management System** (Database-backed) but without the complexity of WebSockets initially.
*   **Why?** Users need to see "Adoption Request Approved" even if they were offline when it happened.
*   **Approach**: **Database + Polling** (Check every minute) or **Invalidation** (Fetch on page load). This is "Lightweight Professional". WebSockets are overkill for V1 unless you need instant chat.

## 3. Database Schema (MongoDB)
We need a robust schema to track who gets what and if they read it.

```javascript
const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['info', 'success', 'warning', 'error', 'adoption_update'], 
    default: 'info' 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  relatedLink: { type: String }, // e.g., "/applications/123"
  createdAt: { type: Date, default: Date.now }
});
// Index for fast queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
```

## 4. Required Backend Endpoints
1.  `GET /api/notifications` - Fetch user's notifications (Standard limit: 20-50).
2.  `PUT /api/notifications/:id/read` - Mark specific notification as read.
3.  `PUT /api/notifications/read-all` - Mark *all* as read (Crucial UX feature).
4.  `DELETE /api/notifications/:id` - Cleanup.

## 5. Example Backend Code (Controller)
```javascript
// Get User Notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user.userId, 
      read: false 
    });
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
};
```

## 6. Frontend Notification Bell UI
You already have a `NotificationCenter.tsx` shell using mock data! We will upgrade it to:
1.  Fetch real data from API on mount.
2.  Poll every 60 seconds (simple "real-time").
3.  Optimistically update UI when marking read.

## 7. Dropdown Design & Logic
-   **Unread Count**: Red badge. Hidden if 0.
-   **List**: Scrollable area (max-height).
-   **Visuals**: Different icons/colors for different types (Green for Success, Blue for Info).

## 8. Triggering Notifications (Events)
Do **not** have the client trigger notifications. Notifications should be a side-effect of backend actions.

**Example**: When an Admin approves a request (`adoptionController.js`):
```javascript
// ... update adoption status ...
await application.save();

// TRIGGER NOTIFICATION
await Notification.create({
  recipient: application.userId,
  type: 'success',
  title: 'Application Approved!',
  message: `Your request for ${pet.name} has been approved.`,
  relatedLink: `/applications/${application._id}`
});
```

## 9. Real-time (Optional)
For now, we will skip `Socket.io` to keep it "lightweight". We will use **Polling** (auto-refetching) or **SWR/React Query** to keep data fresh without managing socket connections. This is standard for 90% of CRUD apps.

## 10. Scaling
-   **Archives**: Move old notifications to a separate collection after 30 days.
-   **Push**: Add Web Push API later for browser/mobile notifications.
-   **Aggregation**: Group similar notifications ("5 people liked your post").

---
**Next Step**: I will verify your approval and then Implement the Backend (Model/Routes) and upgrade the Frontend `NotificationCenter.tsx` to use the live API.
