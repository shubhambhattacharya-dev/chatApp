# TODO: Fix Real-Time Chat Issues

## Tasks
- [x] Remove redundant socket.emit("sendMessage") in useChatStore.js sendMessage function, as backend already emits "newMessage"
- [x] Adjust subscribeToMessage logic in useChatStore.js to ensure messages are added for both sender and receiver without duplication
- [x] Ensure imageUrl is correctly handled in message data in MessageInput.jsx
- [x] Add logging to debug socket events in socket.js and useChatStore.js
- [x] Verify CORS and socket connection in server.js and useAuthStore.js
- [x] Add detailed logging to message.controller.js for debugging
- [x] Test sending text messages from both users via API - messages are saved and retrievable
- [x] Add imageUrl support in ChatContainer.jsx for displaying images
- [x] Update sendMessage controller to include imageUrl in socket emissions
- [x] Add enhanced socket logging in useAuthStore.js for debugging
- [x] Clean up redundant socket listeners in socket.js
- [x] Test real-time socket events in browser
- [x] Check browser console for socket events
- [x] Verify messages appear in real-time without page refresh
- [x] Add optimistic updates to sendMessage in useChatStore.js to show messages immediately in sender's chat box
- [x] Remove setOnlineUsers([]) from disconnectSocket to allow proper online status updates
