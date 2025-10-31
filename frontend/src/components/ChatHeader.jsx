import { X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, onlineUsers = [] } = useChatStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} className="w-full h-full object-cover rounded-full" />
            <span
              className={`absolute bottom-0 right-0 size-3 rounded-full ring-2 ring-zinc-900 ${
                onlineUsers.includes(selectedUser._id) ? "bg-green-500" : "bg-gray-500"
              }`}
            />
            </div>
          </div>

          {/* User info */}
          {selectedUser && (
            <div>
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser?._id) ? "Online" : "Offline"}
              </p>
            </div>
          )}
        </div>

        {/* Close button */}
        <button className='btn btn-ghost btn-circle' onClick={() => setSelectedUser(null)}>
          <X size={24} />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;