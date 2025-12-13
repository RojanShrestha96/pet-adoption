import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // [adopterId, shelterId]
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  updatedAt: { type: Date, default: Date.now } // For sorting
});

// Index for faster lookups of user conversations
ConversationSchema.index({ participants: 1 });

export default mongoose.model('Conversation', ConversationSchema);
