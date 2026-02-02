import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { PageBreadcrumb } from '../../../components/common';
import { useOrg } from '../../../context/OrgContext';
import { aiChatApi, aiCompanyApi } from '../../../api/aiApi';
import { AIChat, AICompany, ChatMessage } from '../../../types/ai';
import ChatList from './ChatList';
import ChatArea from './ChatArea';
import NewChatDialog from './NewChatDialog';
import ChatSettingsDialog from './ChatSettingsDialog';

const AIChatPage = () => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const [chats, setChats] = useState<AIChat[]>([]);
  const [companies, setCompanies] = useState<AICompany[]>([]);
  const [selectedChat, setSelectedChat] = useState<AIChat | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [newChatDialog, setNewChatDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);

  const fetchChats = async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const [chatResult, companyResult] = await Promise.all([
        aiChatApi.list(selectedOrg.id, { limit: 50 }, selectedApiKey?.apiKey),
        aiCompanyApi.list(selectedOrg.id, { limit: 50 }, selectedApiKey?.apiKey),
      ]);
      setChats(chatResult.data);
      setCompanies(companyResult.data);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [selectedOrg, selectedApiKey]);

  const loadChat = async (chatId: string) => {
    if (!selectedOrg) return;
    try {
      const chat = await aiChatApi.get(selectedOrg.id, chatId, selectedApiKey?.apiKey);
      setSelectedChat(chat);
    } catch (err) {
      console.error('Failed to load chat:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedOrg || !selectedChat || !message.trim()) return;

    const userMessageText = message.trim();
    setMessage('');

    // Immediately add user message to UI
    const userMessage: ChatMessage = {
      role: 'user',
      content: userMessageText,
      timestamp: new Date().toISOString(),
    };

    setSelectedChat((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, userMessage],
      };
    });

    setSending(true);

    try {
      await aiChatApi.sendMessage(
        selectedOrg.id,
        selectedChat.id,
        userMessageText,
        selectedApiKey?.apiKey
      );
      // Reload to get actual response from server
      await loadChat(selectedChat.id);
    } catch (err) {
      console.error('Failed to send:', err);
      // On error, reload chat to sync state
      await loadChat(selectedChat.id);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!selectedOrg || !confirm('Delete this chat?')) return;
    try {
      await aiChatApi.delete(selectedOrg.id, chatId, selectedApiKey?.apiKey);
      if (selectedChat?.id === chatId) setSelectedChat(null);
      fetchChats();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleChatCreated = (chat: AIChat) => {
    fetchChats();
    loadChat(chat.id);
    setNewChatDialog(false);
  };

  const handleSettingsUpdated = () => {
    if (selectedChat) loadChat(selectedChat.id);
    setSettingsDialog(false);
  };

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No organization selected</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)' }}>
      <PageBreadcrumb
        items={[
          { label: 'Home', href: '/welcome' },
          { label: selectedOrg.orgName },
          { label: 'AI' },
          { label: 'Chat' },
        ]}
      />
      <Grid container spacing={2} sx={{ height: 'calc(100% - 40px)' }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <ChatList
            chats={chats}
            loading={loading}
            selectedChatId={selectedChat?.id}
            onSelectChat={loadChat}
            onDeleteChat={handleDeleteChat}
            onNewChat={() => setNewChatDialog(true)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <ChatArea
            chat={selectedChat}
            message={message}
            sending={sending}
            onMessageChange={setMessage}
            onSendMessage={handleSendMessage}
            onOpenSettings={() => setSettingsDialog(true)}
          />
        </Grid>
      </Grid>

      <NewChatDialog
        open={newChatDialog}
        onClose={() => setNewChatDialog(false)}
        companies={companies}
        onCreated={handleChatCreated}
      />

      {selectedChat && (
        <ChatSettingsDialog
          open={settingsDialog}
          onClose={() => setSettingsDialog(false)}
          chat={selectedChat}
          onUpdated={handleSettingsUpdated}
        />
      )}
    </Box>
  );
};

export default AIChatPage;
