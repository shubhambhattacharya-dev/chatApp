import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import ChatHeader from './ChatHeader'
import MessageInput from './MessageInput'
import MessageSkeleton from './skeletons/MessageSkeleton'
import { formatMessageTime } from '../lib/util'
import { MdDelete } from "react-icons/md";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const {
    getMessages,
    isMessagesLoading,
    selectedUser,
    messages,
    deleteMessage,
    typingUsers,
  } = useChatStore()

  const { authUser, socket } = useAuthStore()
  const messageEndRef = useRef(null)
  const [selectedImage, setSelectedImage] = useState(null)

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    await deleteMessage(messageId);
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // 🟢 Load messages when selectedUser is set and messages is empty
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  useEffect(() => {
    if (socket) {
      const handleTyping = ({ senderId }) => {
        if (selectedUser && senderId === selectedUser._id) {
          useChatStore.getState().handleTyping(senderId);
        }
      };

      const handleStopTyping = ({ senderId }) => {
        if (selectedUser && senderId === selectedUser._id) {
          useChatStore.getState().handleStopTyping(senderId);
        }
      };

      socket.on("typing", handleTyping);
      socket.on("stopTyping", handleStopTyping);

      return () => {
        socket.off("typing", handleTyping);
        socket.off("stopTyping", handleStopTyping);
      };
    }
  }, [socket, selectedUser]);



  // 🟢 Auto-scroll when new messages arrive
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  // 🟡 Loading skeleton
  if (isMessagesLoading) {
    return (
      <div className='flex-1 flex flex-col overflow-auto'>
        <ChatHeader />
        <MessageSkeleton />
      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-gray-500">
          {selectedUser?.fullName} is typing...
        </div>
      )}

      <MessageInput typingUsers={typingUsers} />
    </div>
  )
}

  // 🟢 Main chat UI
  return (
    <div className='flex-1 flex flex-col overflow-auto'>
      <ChatHeader />
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.filter(Boolean).map((message) => (
          <div
            key={message._id || message.tempId}
            className={`chat ${
              message.senderId?._id === authUser._id ? 'chat-end' : 'chat-start'
            }`}
          >
            <div className='chat-image avatar'>
              <div className='size-10 rounded-full border'>
                <img
                  src={
                    message.senderId?._id === authUser._id
                      ? authUser.profilePic || '/avatar.png'
                      : selectedUser.profilePic || '/avatar.png'
                  }
                  alt='profile'
                  className='size-10 object-cover rounded-full'
                />
              </div>
            </div>

            <div className='chat-header mb-1'>
              <time className='text-xs opacity-50 ml-1'>
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            <div className='chat-bubble flex flex-col relative'>
              {message.attachments?.length > 0 && (
                <img
                  src={message.attachments[0].url}
                  alt='attachment'
                  className='sm:max-w-[200px] rounded-md mb-2 cursor-pointer hover:opacity-80 transition-opacity'
                  onClick={() => handleImageClick(message.attachments[0].url)}
                />
              )}
              {message.message && <p>{message.message}</p>}
              {message.senderId?._id === authUser._id && (
                <button
                  className='absolute top-1 right-1 text-white text-xs opacity-50 hover:opacity-100'
                  onClick={() => handleDeleteMessage(message._id)}
                >
                  <MdDelete size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="relative max-w-4xl max-h-full p-4">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <MessageInput typingUsers={typingUsers} />
    </div>
  )
}

export default ChatContainer
