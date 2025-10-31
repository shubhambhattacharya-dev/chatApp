import { useEffect, useState } from "react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore"

const Sidebar = () => {
  const { getUsers, selectedUser, setSelectedUser, isUsersLoading, users } = useChatStore();
  const { onlineUsers } = useChatStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contact</span>
        </div>
      </div>

      {/* Online filter toggle */}
      <div className="border-b border-base-300 w-full p-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={showOnlineOnly}
            onChange={(e) => setShowOnlineOnly(e.target.checked)}
          />
          <span className="text-sm font-medium hidden lg:block">Show online only</span>
          <span className="text-xs lg:hidden">Online</span>
        </label>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {users.length === 0 ? (
          <div className='flex items-center justify-center h-full text-sm text-base-content/60 px-4 text-center'>
            <p className='hidden lg:block'>No other users found. Invite someone to chat!</p>
            <p className='lg:hidden'>No users.</p>
          </div>
        ) : (
          users
            .filter((user) => !showOnlineOnly || onlineUsers?.includes(user._id))
            .sort((a, b) => {
              const aOnline = onlineUsers?.includes(a._id);
              const bOnline = onlineUsers?.includes(b._id);
              if (aOnline && !bOnline) return -1;
              if (!aOnline && bOnline) return 1;
              return a.fullName.localeCompare(b.fullName);
            })
            .map((user) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""
              }`}
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="size-12 object-cover rounded-full"
                />
                {onlineUsers?.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                )}
              </div>
              <span className="hidden lg:block">{user.fullName}</span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
