import express from "express";
import { 
    getUsersForSidebar, 
    getMessagesBetweenUsers, 
    createMessage, 
    uploadImage, 
    deleteMessage, 
    markMessageAsRead 
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
    validateGetMessagesBetweenUsers, 
    validateSendMessage, 
    validateDeleteMessage, 
    validateMarkMessageAsRead 
} from "../middleware/validation.middleware.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, validateGetMessagesBetweenUsers, getMessagesBetweenUsers);

router.post("/send/:id", protectRoute, validateSendMessage, createMessage);
router.post("/upload", protectRoute, upload.single("image"), uploadImage);

router.delete("/:id", protectRoute, validateDeleteMessage, deleteMessage);
router.patch("/read/:id", protectRoute, validateMarkMessageAsRead, markMessageAsRead);

export default router;
