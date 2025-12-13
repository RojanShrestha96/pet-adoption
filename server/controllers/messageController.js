import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

// Create or Get Conversation
export const createOrGetConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user.userId;

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId]
      });
      await conversation.save();
    }

    // Populate participants info
    conversation = await conversation.populate('participants', 'name email role shelterDetails profilePicture');

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Error creating conversation", error: error.message });
  }
};

// Get User Conversations
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await Conversation.find({
      participants: { $in: [userId] }
    })
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .lean();

    // Manually populate participants from both User and Shelter models
    for (const conv of conversations) {
      const populatedParticipants = [];

      for (const participantId of conv.participants) {
        // Try to find in User collection first
        let participant = await User.findById(participantId)
          .select('name email profileImage')
          .lean();

        if (participant) {
          populatedParticipants.push({ ...participant, type: 'user' });
        } else {
          // Try Shelter collection
          const Shelter = (await import('../models/Shelter.js')).default;
          participant = await Shelter.findById(participantId)
            .select('name email logo')
            .lean();

          if (participant) {
            populatedParticipants.push({ ...participant, type: 'shelter' });
          }
        }
      }

      conv.participants = populatedParticipants;
    }

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: "Error fetching conversations", error: error.message });
  }
};

// Get Messages for a Conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Security check: Ensure user is participant? (Optional for now, but good practice)

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
};

// Send Message (HTTP Fallback / Storage)
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const senderId = req.user.userId;

    const newMessage = new Message({
      conversationId,
      sender: senderId,
      text
    });

    const savedMessage = await newMessage.save();

    // Update conversation lastMessage
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: savedMessage._id,
      updatedAt: Date.now()
    });

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
};

// Delete/Close Conversation
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    // Security check: Ensure user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Not authorized to delete this conversation" });
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversationId });

    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId);

    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting conversation", error: error.message });
  }
};
