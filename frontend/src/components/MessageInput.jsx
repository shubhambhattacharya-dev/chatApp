import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Loader, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const MessageInput = ({ typingUsers = [] }) => {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { sendMessage, isSendingMessage, startTyping, stopTyping, selectedUser } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) return;

    stopTyping();

    try {
      let imageUrl = null;

      if (imageFile) {
        toast.loading("Uploading image...", { id: "upload" });

        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadRes = await axiosInstance.post('/messages/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadRes.data.imageUrl;

        toast.success("Image uploaded successfully!", { id: "upload" });
      }

      await sendMessage({
        message: text.trim(),
        imageUrl,
      });

      setText("");
      removeImage();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
      toast.dismiss("upload");
    }
  };

  return (
    <div className="p-4 w-full">
      {typingUsers.length > 0 && selectedUser && (
        <div className="mb-2 text-sm text-gray-500 italic">
          {selectedUser.fullName} is typing...
        </div>
      )}

      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            disabled={isSendingMessage}
            onChange={(e) => {
              setText(e.target.value);

              if (e.target.value.trim()) {
                startTyping();
                if (typingTimeoutRef.current) {
                  clearTimeout(typingTimeoutRef.current);
                }
                typingTimeoutRef.current = setTimeout(() => {
                  stopTyping();
                }, 1000);
              } else {
                stopTyping();
              }
            }}
            onBlur={() => {
              stopTyping();
            }}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={isSendingMessage}
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            disabled={isSendingMessage}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type='submit'
          className='btn btn-sm sm:btn-md btn-circle'
          disabled={isSendingMessage || (!text.trim() && !imageFile)}
        >
          {isSendingMessage ? <Loader className='animate-spin' size={22} /> : <Send size={22} />}
        </button>
      </form>
    </div>
  );
};
export default MessageInput;