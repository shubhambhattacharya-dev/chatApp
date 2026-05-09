import { useEffect, useRef, useState, useMemo } from 'react'
import { useChatStore, Message } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import ChatHeader from './ChatHeader'
import MessageInput from './MessageInput'
import MessageSkeleton from './skeletons/MessageSkeleton'
import { formatMessageTime } from '../lib/util'
import { Trash2, Check, CheckCheck, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion'

const ChatContainer = () => {
  const {
    getMessages,
    isMessagesLoading,
    selectedUser,
    messages,
    deleteMessage,
    markMessageAsRead,
    typingUsers,
  } = useChatStore()

  const { authUser, socket } = useAuthStore()
  const messageEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    await deleteMessage(messageId);
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  useEffect(() => {
    if (messageEndRef.current && isAtBottom) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, isAtBottom])

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 50;
    setIsAtBottom(atBottom);
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { [key: string]: Message[] } = {};
    messages.filter(Boolean).forEach((msg) => {
      const date = new Date(msg.createdAt).toLocaleDateString(undefined, { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className='flex-1 flex flex-col overflow-auto bg-base-100'>
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    )
  }

  return (
    <div className='flex-1 flex flex-col h-full bg-base-100 relative overflow-hidden'>
      <ChatHeader />
      
      <div 
        ref={messagesContainerRef} 
        onScroll={handleScroll}
        className='flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar'
      >
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="space-y-6">
            <div className="flex justify-center my-8">
              <span className="px-4 py-1 rounded-full bg-base-300/50 text-[11px] font-bold uppercase tracking-wider text-base-content/60 backdrop-blur-sm">
                {date === new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) ? 'Today' : date}
              </span>
            </div>

            <AnimatePresence initial={false}>
              {msgs.map((message) => {
                const isMine = message.senderId === authUser?._id || (typeof message.senderId === 'object' && message.senderId._id === authUser?._id);
                
                return (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`chat ${isMine ? 'chat-end' : 'chat-start'}`}
                  >
                    <div className='chat-image avatar'>
                      <div className='size-10 rounded-full border-2 border-base-300 shadow-sm'>
                        <img
                          src={isMine ? (authUser?.profilePic || '/avatar.png') : (selectedUser?.profilePic || '/avatar.png')}
                          alt='profile'
                          className='object-cover'
                        />
                      </div>
                    </div>

                    <div className='chat-header mb-1 flex items-center gap-2'>
                      <time className='text-[10px] opacity-50 font-medium'>
                        {formatMessageTime(message.createdAt)}
                      </time>
                    </div>

                    <div 
                      className={`chat-bubble min-h-0 py-2 px-4 shadow-sm relative group/bubble
                        ${isMine ? 'bg-primary text-primary-content rounded-tr-none' : 'bg-base-200 text-base-content rounded-tl-none'}
                      `}
                    >
                      {message.attachments?.map((att, idx) => (
                        <div key={idx} className="mb-2 last:mb-0">
                          <img
                            src={att.url}
                            alt='attachment'
                            className='max-w-[240px] rounded-lg cursor-pointer hover:brightness-90 transition-all shadow-md'
                            onClick={() => setSelectedImage(att.url)}
                          />
                        </div>
                      ))}
                      
                      {message.message && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {message.message}
                        </p>
                      )}

                      {/* Status & Actions */}
                      <div className={`flex items-center gap-1 mt-1 justify-end opacity-0 group-hover/bubble:opacity-100 transition-opacity`}>
                        {isMine && (
                          <>
                            <button
                              onClick={() => handleDeleteMessage(message._id)}
                              className="text-primary-content/50 hover:text-primary-content transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                            {message.isRead ? (
                              <CheckCheck size={14} className="text-primary-content/80" />
                            ) : (
                              <Check size={14} className="text-primary-content/50" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* New Message / Scroll Down Button */}
      <AnimatePresence>
        {!isAtBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-8 btn btn-circle btn-primary shadow-xl z-20"
          >
            <ArrowDown size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4" 
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 btn btn-circle btn-ghost text-white hover:bg-white/10"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <MessageInput typingUsers={typingUsers} />
    </div>
  )
}

export default ChatContainer
