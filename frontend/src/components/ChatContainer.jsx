import React, { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import ChatHeader from './ChatHeader'
import MessageInput from './MessageInput'
import MessageSkeleton from './skeletons/MessageSkeleton'
import { useAuthStore } from '../store/useAuthStore'
import { formatMessageTime } from '../lib/util';

const ChatContainer = React.memo(() => {
  const { isMessagesLoading, selectedUser, messages } = useChatStore()
  const { authUser, onlineUsers } = useAuthStore()
  const messageEndRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when messages change and user is at the bottom
    if (isAtBottom) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 1;
      setIsAtBottom(atBottom);
    }
  };

  if (isMessagesLoading) {
    return (
      <div className='flex-1 flex flex-col overflow-auto'>
        {selectedUser && <ChatHeader />}
        <MessageSkeleton />
        {selectedUser && <MessageInput />}
      </div>
    )
  }

  return (
    <div className='flex-1 flex flex-col overflow-auto' ref={chatContainerRef} onScroll={handleScroll}>
      {selectedUser && <ChatHeader />}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((message) => (
          <div
            key={message._id || `${message.senderId}-${message.createdAt}`}
            className={`chat ${message.senderId?.toString() === authUser._id?.toString() ? 'chat-end' : 'chat-start'}`}
          >
            <div className='chat-image avatar'>
              <div className={`size-10 rounded-full border ${onlineUsers.includes(message.senderId?.toString()) ? 'online' : ''}`}>
                <img
                  src={
                    message.senderId?.toString() === authUser._id?.toString()
                      ? authUser.profilePic || '/avatar.png'
                      : selectedUser?.profilePic || '/avatar.png'
                  }
                  alt='profile pic'
                />
              </div>
            </div>

            <div className='chat-header mb-1'>
              <time className='text-xs opacity-50 ml-1'>
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            <div className='chat-bubble flex flex-col'>
              {message.attachments && message.attachments.length > 0 && (
                <img
                  src={message.attachments[0].url}
                  alt='attachments'
                  className='sm:max-w-[200px] rounded-md mb-2'
                />
              )}
              {message.message && <p>{message.message}</p>}
              {message.imageUrl && (
                <img
                  src={message.imageUrl}
                  alt='message image'
                  className='sm:max-w-[200px] rounded-md mb-2'
                />
              )}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      {selectedUser && <MessageInput />}
    </div>
  )
});

export default ChatContainer
