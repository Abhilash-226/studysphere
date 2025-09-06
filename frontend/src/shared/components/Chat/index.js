// Chat Components Index
// Export all chat-related components for easy importing

// Common components
export { default as Avatar } from "./common/Avatar";
export { default as ConversationItem } from "./common/ConversationItem";
export { default as MessageBubble } from "./common/MessageBubble";

// Main components
export { default as ConversationList } from "./components/ConversationList";
export { default as MessageList } from "./components/MessageList";
export { default as MessageInput } from "./components/MessageInput";
export { default as ChatHeader } from "./components/ChatHeader";

// Contexts and hooks
export { ChatContext, ChatProvider } from "./contexts/ChatContext";
export { default as useChatService } from "./hooks/useChatService";

// Utils
export * from "./utils/formatters";

// Pages
export { default as ChatPage } from "./pages/ChatPage";
