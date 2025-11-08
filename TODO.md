# Image Upload Issues Fix TODO

## Issues Identified
- **Profile Picture Upload**: Frontend sends FormData to updateProfile, but useAuthStore treats it as object and sends empty sanitizedData, not the FormData.
- **Message Image Send**: Frontend tries to upload to /messages/upload-image, but route is missing in message.route.js. uploadImage controller exists but not routed.
- ERR_CONNECTION_RESET: Likely due to failed uploads causing connection issues.
- **Mark Message as Read**: Missing API endpoint for marking messages as read. ✅ Implemented PUT /api/messages/read/:id endpoint, added markMessageAsRead function, validation, socket event, frontend handler, UI indicator, and click-to-mark functionality.

## Plan
1. Fix updateProfile in useAuthStore.js to detect FormData and send it directly for image uploads.
2. Add /upload-image route in message.route.js using the existing uploadImage controller.
3. Add PUT /read/:id route for marking messages as read.
4. Test profile upload and message image send in local environment.
5. Test mark as read functionality.
6. Test in render environment.
7. Verify no ERR_CONNECTION_RESET after fixes.

## Dependent Files
- chatApp/frontend/src/store/useAuthStore.js
- chatApp/backend/src/routes/message.route.js
- chatApp/backend/src/controllers/message.controller.js
- chatApp/backend/src/middleware/validation.middleware.js

## Followup
- Run backend and frontend locally.
- Test profile picture upload.
- Test sending image in messages.
- Test marking messages as read.
- Deploy to render and test there.
- Check console for errors.
