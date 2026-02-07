import { useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  CircularProgress,
  InputAdornment,
  keyframes,
} from "@mui/material";
import { Send, Settings } from "@mui/icons-material";
import { AIChat, ChatMessage } from "../../../types/ai";

// Typing animation keyframes
const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
`;

interface ChatAreaProps {
  chat: AIChat | null;
  message: string;
  sending: boolean;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onOpenSettings: () => void;
}

const ChatArea = ({
  chat,
  message,
  sending,
  onMessageChange,
  onSendMessage,
  onOpenSettings,
}: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  if (!chat) {
    return (
      <Paper
        variant="outlined"
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">
          Select a chat or create a new one
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {chat.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {chat.model} • {chat.totalTokens} tokens
          </Typography>
        </Box>
        <IconButton size="small" onClick={onOpenSettings}>
          <Settings fontSize="small" />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        {chat.messages.map((msg: ChatMessage, idx: number) => (
          <MessageBubble key={idx} message={msg} />
        ))}
        {sending && <ThinkingBubble />}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box sx={{ p: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={onSendMessage}
                  disabled={sending || !message.trim()}
                >
                  {sending ? (
                    <CircularProgress size={18} />
                  ) : (
                    <Send fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Paper>
  );
};

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <Box
      sx={{
        mb: 2,
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          maxWidth: "70%",
          bgcolor: isUser
            ? "primary.main"
            : isSystem
              ? "grey.100"
              : "background.default",
          color: isUser ? "white" : "text.primary",
          borderStyle: isSystem ? "dashed" : "solid",
        }}
      >
        {isSystem && (
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
          >
            System
          </Typography>
        )}
        <Typography
          variant="body2"
          sx={{ fontSize: 13, whiteSpace: "pre-wrap" }}
        >
          {message.content}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.7, fontSize: 10 }}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </Typography>
      </Paper>
    </Box>
  );
};

// AI thinking animation bubble
const ThinkingBubble = () => (
  <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-start" }}>
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        maxWidth: "70%",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "primary.main",
              animation: `${pulse} 1.4s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </Box>
      <Typography
        variant="body2"
        sx={{ fontSize: 13, color: "text.secondary", fontStyle: "italic" }}
      >
        AI is thinking...
      </Typography>
    </Paper>
  </Box>
);

export default ChatArea;
