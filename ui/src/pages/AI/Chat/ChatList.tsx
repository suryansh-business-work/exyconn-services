import {
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { AIChat } from '../../../types/ai';

interface ChatListProps {
  chats: AIChat[];
  loading: boolean;
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onNewChat: () => void;
}

const ChatList = ({
  chats,
  loading,
  selectedChatId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
}: ChatListProps) => {
  return (
    <Paper variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Chats
        </Typography>
        <IconButton size="small" onClick={onNewChat}>
          <Add fontSize="small" />
        </IconButton>
      </Box>
      <List dense sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <CircularProgress size={20} />
          </Box>
        ) : chats.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            No chats yet
          </Typography>
        ) : (
          chats.map((chat) => (
            <ListItem
              key={chat.id}
              disablePadding
              secondaryAction={
                <IconButton size="small" onClick={() => onDeleteChat(chat.id)}>
                  <Delete fontSize="small" />
                </IconButton>
              }
            >
              <ListItemButton
                selected={selectedChatId === chat.id}
                onClick={() => onSelectChat(chat.id)}
              >
                <ListItemText
                  primary={chat.title}
                  secondary={`${chat.model} • ${chat.company?.provider || ''}`}
                  primaryTypographyProps={{ fontSize: 13, fontWeight: 500, noWrap: true }}
                  secondaryTypographyProps={{ fontSize: 10 }}
                />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
};

export default ChatList;
