import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Can refer to 'User' or 'Shelter' depending on your auth setup, usually handled by checking both or a generic reference
    required: true
  },
  recipientType: {
    type: String,
    enum: ['adopter', 'shelter'],
    default: 'adopter'
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'system', 'application', 'pet'],
    default: 'info'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedLink: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for fetching a user's latest notifications quickly
notificationSchema.index({ recipient: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
