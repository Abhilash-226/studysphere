// Export all chat components for easy imports
export { default as Avatar } from "./common/Avatar";
export { default as ChatHeader } from "./common/ChatHeader";
export { default as MessageBubble } from "./common/MessageBubble";
export { default as DateSeparator } from "./common/DateSeparator";
export { default as ChatInput } from "./common/ChatInput";
export { default as ConversationItem } from "./common/ConversationItem";
export { default as ConversationList } from "./common/ConversationList";
export { default as MessageList } from "./common/MessageList";

// Export contexts and hooks
export { ChatContext, ChatProvider } from "./contexts/ChatContext";
export { default as useChatService } from "./hooks/useChatService";

// Export utils
export * from "./utils/formatters";
