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
            enum: ['image', 'file']
        },
        url: {
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

// Add indexes for better performance
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });
messageSchema.index({ receiverId: 1, senderId: 1, createdAt: 1 });

// Virtual for conversation ID (to group messages between two users)
messageSchema.virtual('conversationId').get(function() {
    return [this.senderId, this.receiverId].sort().join('_');
});

// Static method to get conversation between two users
messageSchema.statics.getConversation = function(userId1, userId2, limit = 50) {
    return this.find({
        $or: [
            { senderId: userId1, receiverId: userId2 },
            { senderId: userId2, receiverId: userId1 }
        ]
    })
    .sort({ createdAt: 1 }) // Sort messages from oldest to newest
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