import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    attachments: [{
        type: {
            type: String,
            enum: ['image', 'file'],
            required: true
        },
        url: {
            type: String,
            required: true
        },
        mimeType: {
            type: String,
            required: true
        },
        fileName: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true,
            min: 0
        },
        cloudinaryId: {
            type: String
        }
    }],
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Add compound indexes for better performance
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, senderId: 1, createdAt: -1 });
messageSchema.index({ createdAt: -1 }); // For general sorting
messageSchema.index({ senderId: 1, createdAt: -1 }); // For user's sent messages
messageSchema.index({ receiverId: 1, createdAt: -1 }); // For user's received messages

// Virtual for conversation ID (to group messages between two users)
messageSchema.virtual('conversationId').get(function() {
    return [this.senderId, this.receiverId].sort().join('_');
});

// Static method to get conversation between two users with pagination
messageSchema.statics.getConversation = function(userId1, userId2, limit = 50, skip = 0) {
    return this.find({
        $or: [
            { senderId: userId1, receiverId: userId2 },
            { senderId: userId2, receiverId: userId1 }
        ]
    })
    .sort({ createdAt: 1 }) // Sort messages from oldest to newest
    .skip(skip)
    .limit(limit)
    .populate('senderId', 'username fullName profilePic')
    .populate('receiverId', 'username fullName profilePic');
};

// Static method to get conversation with cursor-based pagination
messageSchema.statics.getConversationPaginated = function(userId1, userId2, before, limit = 50) {
    const query = {
        $or: [
            { senderId: userId1, receiverId: userId2 },
            { senderId: userId2, receiverId: userId1 }
        ]
    };

    if (before) {
        query.createdAt = { $lt: before };
    }

    return this.find(query)
        .sort({ createdAt: -1 }) // Newest first for pagination
        .limit(limit)
        .populate('senderId', 'username fullName profilePic')
        .populate('receiverId', 'username fullName profilePic');
};

// Instance method to mark as read
messageSchema.methods.markAsRead = function() {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

const Message = mongoose.model('Message', messageSchema);

export default Message;