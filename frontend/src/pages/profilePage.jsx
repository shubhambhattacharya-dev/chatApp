import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Camera, User, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, isCheckingAuth } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || "",
    email: authUser?.email || "",
  });

  // Update form data when authUser changes (e.g., after initial fetch or successful update)
  useEffect(() => {
    if (authUser) {
      setFormData({
        fullName: authUser.fullName || "",
        email: authUser.email || "",
      });
    }
  }, [authUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Only send fields that have changed or are explicitly being updated
    const dataToUpdate = {};
    if (formData.fullName !== authUser.fullName) {
      dataToUpdate.fullName = formData.fullName;
    }
    if (formData.email !== authUser.email) {
      dataToUpdate.email = formData.email;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      toast("No changes to save.", { type: "info" });
      return;
    }

    try {
      await updateProfile(dataToUpdate);
      toast("Profile updated successfully!", { type: "success" }); // Add success toast here
    } catch (error) {
      console.error("Error updating profile:", error);
      toast(error.message || "Failed to update profile.", { type: "error" }); // Explicitly show error toast
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast('Please select a valid image file', { type: 'error' });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast('Image size must be less than 5MB', { type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image); // Show preview immediately

      // Create FormData to send the file
      const formData = new FormData();
      formData.append('profilePic', file);

      try {
        const res = await updateProfile(formData);
        // Update preview with the actual uploaded image URL from response
        if (res?.user?.profilePic) {
          setSelectedImg(res.user.profilePic);
        }
      } catch (error) {
        console.error('Profile update failed:', error);
        // Reset to original image on error
        setSelectedImg(authUser?.profilePic || "/avatar.png");
      }
    };

    reader.onerror = () => {
      toast('Failed to read the selected file', { type: 'error' });
    };
  };

  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-400">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-wide">Profile</h1>
            <p className="mt-2 text-gray-400">Your profile information</p>
          </div>

          {/* Avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 border-zinc-700 shadow-md"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* User info */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className="input input-bordered w-full bg-base-200"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isUpdatingProfile}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="input input-bordered w-full bg-base-200"
                value={formData.email}
                onChange={handleChange}
                disabled={isUpdatingProfile}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? "Saving..." : "Save Changes"}
            </button>
          </form>

          {/* Account info */}
          <div className="mt-6 bg-base-300 rounded-xl p-6 border border-zinc-700">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>
                  {authUser?.createdAt
                    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date(authUser.createdAt))
                    : "Unknown"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;