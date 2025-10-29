import { useEffect, useRef } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import ChatHeader from './ChatHeader'
import MessageInput from './MessageInput'
import MessageSkeleton from './skeletons/MessageSkeleton'
import { formatMessageTime } from '../lib/util'

const ChatContainer = () => {
  const {
    getMessages,
    isMessagesLoading,
    selectedUser,
    messages,
    unsubscribeFromMessage,
    subscribeToMessage,
  } = useChatStore()

  const { authUser } = useAuthStore()
  const messageEndRef = useRef(null)

  // 🟢 Fetch and subscribe to messages
  useEffect(() => {
    if (!selectedUser?._id) return

    const controller = new AbortController()
    const signal = controller.signal

    getMessages(selectedUser._id, { signal })
    subscribeToMessage(selectedUser._id)

    return () => {
      unsubscribeFromMessage()
      controller.abort()
    }
  }, [selectedUser?._id, getMessages, subscribeToMessage, unsubscribeFromMessage])

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
        <MessageInput />
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
                />
              </div>
            </div>

            <div className='chat-header mb-1'>
              <time className='text-xs opacity-50 ml-1'>
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            <div className='chat-bubble flex flex-col'>
              {message.attachments?.length > 0 && (
                <img
                  src={message.attachments[0].url}
                  alt='attachment'
                  className='sm:max-w-[200px] rounded-md mb-2'
                />
              )}
              {message.message && <p>{message.message}</p>}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  )
}

export default ChatContainer
