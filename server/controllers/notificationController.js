import Notification from '../models/Notification.js';

// GET USER NOTIFICATIONS
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 to keep payload light

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// MARK AS READ
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
};

// MARK ALL AS READ
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ message: 'Error updating notifications' });
  }
};

// DELETE NOTIFICATION
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
};

// INTERNAL HELPER: CREATE NOTIFICATION
export const createNotification = async (recipientId, recipientType, type, title, message, relatedLink = null) => {
  try {
    await Notification.create({
      recipient: recipientId,
      recipientType,
      type,
      title,
      message,
      relatedLink
    });
  } catch (error) {
    console.error('Create notification error:', error);
    // Don't crash the app if notification fails
  }
};
