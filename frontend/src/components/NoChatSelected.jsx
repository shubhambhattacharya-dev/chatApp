import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="flex flex-1 items-center justify-center w-full bg-base-100/50 p-10">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-bounce shadow-md">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold text-base-content">Welcome to Chatty!</h2>
        <p className="text-base-content/60">
          Select a conversation from the sidebar to start chatting.
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
