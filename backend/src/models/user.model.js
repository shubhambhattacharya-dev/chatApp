import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    avatar: {
        type: String,
        default: ''
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

// Pre-save middleware for additional validation
userSchema.pre('save', function(next) {
    try {
        // Additional validation logic can be added here
        next();
    } catch (error) {
        next(error);
    }
});

// Static method to find user by email or username
userSchema.statics.findByEmailOrUsername = async function(identifier) {
    try {
        return await this.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { username: identifier }
            ]
        });
    } catch (error) {
        throw new Error('Error finding user: ' + error.message);
    }
};

// Instance method to update last seen
userSchema.methods.updateLastSeen = async function() {
    try {
        this.lastSeen = new Date();
        await this.save();
    } catch (error) {
        throw new Error('Error updating last seen: ' + error.message);
    }
};

const User = mongoose.model('User', userSchema);

export default User;