import { useEffect, useState, useMemo } from "react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const { getUsers, selectedUser, setSelectedUser, isUsersLoading, users, onlineUsers } = useChatStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const matchesOnline = !showOnlineOnly || onlineUsers?.includes(user._id);
        const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesOnline && matchesSearch;
      })
      .sort((a, b) => {
        const aOnline = onlineUsers?.includes(a._id);
        const bOnline = onlineUsers?.includes(b._id);
        if (aOnline && !bOnline) return -1;
        if (!aOnline && bOnline) return 1;
        return a.fullName.localeCompare(b.fullName);
      });
  }, [users, showOnlineOnly, onlineUsers, searchQuery]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-80 border-r border-base-300 flex flex-col transition-all duration-300 bg-base-100/50 backdrop-blur-sm">
      {/* Header */}
      <div className="p-5 border-b border-base-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <span className="font-bold text-lg hidden lg:block">Messages</span>
          </div>
          <div className="badge badge-primary badge-outline hidden lg:flex">
            {onlineUsers.length - 1 > 0 ? onlineUsers.length - 1 : 0} online
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative hidden lg:block mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="size-4 text-base-content/40" />
          </div>
          <input
            type="text"
            placeholder="Search contacts..."
            className="input input-bordered w-full pl-10 pr-10 input-sm rounded-xl focus:input-primary transition-all duration-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Online Filter */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              className="checkbox checkbox-primary checkbox-sm rounded-md transition-all duration-300 group-hover:scale-110"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
            />
            <span className="text-sm font-medium hidden lg:block text-base-content/70">Show online only</span>
            <span className="text-xs lg:hidden font-medium">Online</span>
          </label>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredUsers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-40 text-base-content/50 px-4 text-center"
            >
              <Search className="size-10 mb-2 opacity-20" />
              <p className="text-sm">No results found</p>
            </motion.div>
          ) : (
            filteredUsers.map((user) => (
              <motion.button
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`w-full p-4 flex items-center gap-4 hover:bg-base-200/80 transition-all duration-200 relative group
                  ${selectedUser?._id === user._id ? "bg-base-200 ring-1 ring-inset ring-primary/20" : ""}
                `}
              >
                {/* Active Indicator */}
                {selectedUser?._id === user._id && (
                  <motion.div
                    layoutId="active-bg"
                    className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                  />
                )}

                <div className="relative flex-shrink-0">
                  <div className={`size-12 rounded-full ring-2 ring-offset-2 ring-offset-base-100 transition-all duration-300 
                    ${onlineUsers?.includes(user._id) ? "ring-success" : "ring-base-300"}`}>
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="size-full object-cover rounded-full"
                    />
                  </div>
                  {onlineUsers?.includes(user._id) && (
                    <span className="absolute bottom-0 right-0 size-3.5 bg-success rounded-full ring-2 ring-base-100 shadow-sm" />
                  )}
                </div>

                {/* User Info */}
                <div className="hidden lg:block text-left flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {user.fullName}
                    </p>
                    {onlineUsers?.includes(user._id) && (
                      <span className="text-[10px] text-success font-medium">Online</span>
                    )}
                  </div>
                  <p className="text-xs text-base-content/50 truncate">
                    {onlineUsers?.includes(user._id) ? "Active now" : "Offline"}
                  </p>
                </div>
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
};

export default Sidebar;
