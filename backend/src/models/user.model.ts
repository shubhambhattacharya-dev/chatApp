import mongoose, { Document, Model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  fullName: string;
  email: string;
  password: string;
  profilePic: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
  updateLastSeen(): Promise<void>;
}

interface IUserModel extends Model<IUser> {
  findByEmailOrUsername(identifier: string): Promise<IUser | null>;
}

const userSchema = new mongoose.Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50,
        index: true
    },
    fullName: {
        type: String,
        required: true,
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
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
        index: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    profilePic: {
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

// Static method to find user by email or username
userSchema.statics.findByEmailOrUsername = async function(identifier: string) {
    return await this.findOne({
        $or: [
            { email: identifier.toLowerCase() },
            { username: identifier }
        ]
    });
};

// Instance method to update last seen
userSchema.methods.updateLastSeen = async function() {
    this.lastSeen = new Date();
    await this.save();
};

const User = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;
