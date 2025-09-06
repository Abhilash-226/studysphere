# StudySphere Chat Module

This module provides a comprehensive, reusable chat implementation for the StudySphere platform. It enables real-time communication between students and tutors.

## Architecture

The chat system is built with a modular, component-based architecture that promotes reusability and separation of concerns:

```
/shared/components/Chat/
  /common/          # Reusable components used across both student and tutor interfaces
  /contexts/        # Context providers for state management
  /hooks/           # Custom hooks for business logic
  /utils/           # Utility functions
```

## Key Features

1. **Real-time messaging** using Socket.IO
2. **Conversation management** with unread message indicators
3. **User presence** indicators showing online/offline status
4. **Message history** with date separators
5. **Responsive design** that works on both desktop and mobile devices

### Components

#### Common Components

- `Avatar.jsx` - User avatar display with configurable sizes
- `MessageBubble.jsx` - Individual message display with styling
- `DateSeparator.jsx` - Visual separator for messages on different dates
- `ConversationItem.jsx` - List item for a single conversation

#### Main Components

- `ChatHeader.jsx` - Header showing conversation user info and actions
- `MessageInput.jsx` - Message input with send functionality
- `ConversationList.jsx` - List of all conversations with search functionality
- `MessageList.jsx` - Scrollable list of messages with date separators

#### Pages

- `ChatPage.jsx` - Main chat page container

### State Management

- `ChatContext.jsx` - Context provider for chat state and operations

### Custom Hooks

- `useChatService.js` - Hook for accessing chat functionality

### Utilities

- `formatters.js` - Date and text formatting utilities
- `chatUtils.js` - Chat-specific utility functions

## Integration

The chat system is integrated into both the student and tutor interfaces:

- `StudentChat.jsx` - Student-facing chat interface
- `TutorChat.jsx` - Tutor-facing chat interface

## Routes

- `/student/chat` - Student conversation list
- `/student/chat/:conversationId` - Student specific conversation
- `/tutor/chat` - Tutor conversation list
- `/tutor/chat/:conversationId` - Tutor specific conversation

## Usage

To use the chat components in a new part of the application, import the necessary components from the shared module:

```jsx
import {
  ChatProvider,
  ConversationList,
  MessageList,
  MessageInput,
} from "../shared/components/Chat";
```

Always wrap your chat components with the `ChatProvider`:

```jsx
<ChatProvider userId={currentUser.id} userRole="student">
  {/* Your chat components */}
</ChatProvider>
```

## Future Improvements

1. Add typing indicators
2. Support for image and file attachments
3. Message reactions
4. Read receipts
5. Group conversations
