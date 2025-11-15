import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  TextField,
  IconButton,
  Badge,
  Divider,
  Paper,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { MobileHeader } from '../../components/mobile/MobileHeader';
import { BottomNav } from '../../components/mobile/BottomNav';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  isRead: boolean;
}

interface Channel {
  id: string;
  name: string;
  displayName: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  icon?: string;
}

const TeamChat: React.FC = () => {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel.id);
    }
  }, [selectedChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      // Mock channels for now
      const mockChannels: Channel[] = [
        {
          id: '1',
          name: 'general',
          displayName: 'General',
          lastMessage: 'Morning team! Ready for a great day',
          lastMessageTime: '9:30 AM',
          unreadCount: 3,
          icon: '💬',
        },
        {
          id: '2',
          name: 'announcements',
          displayName: 'Announcements',
          lastMessage: 'Staff meeting at 2 PM today',
          lastMessageTime: 'Yesterday',
          unreadCount: 1,
          icon: '📢',
        },
        {
          id: '3',
          name: 'shift-handoff',
          displayName: 'Shift Handoff',
          lastMessage: 'Max needs medication at 3 PM',
          lastMessageTime: '2 hours ago',
          unreadCount: 0,
          icon: '🔄',
        },
      ];
      setChannels(mockChannels);
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (channelId: string) => {
    try {
      // Mock messages for now
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Good morning everyone!',
          senderId: 'user1',
          senderName: 'Sarah',
          timestamp: '8:00 AM',
          isRead: true,
        },
        {
          id: '2',
          content: 'Morning! Ready for a busy day',
          senderId: 'user2',
          senderName: 'Mike',
          timestamp: '8:15 AM',
          isRead: true,
        },
        {
          id: '3',
          content: 'Don\'t forget we have 5 new check-ins today',
          senderId: 'user1',
          senderName: 'Sarah',
          timestamp: '8:30 AM',
          isRead: true,
        },
        {
          id: '4',
          content: 'Got it, thanks for the heads up!',
          senderId: user?.id || 'current',
          senderName: user?.firstName || 'You',
          timestamp: '8:32 AM',
          isRead: true,
        },
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChannel) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: user?.id || 'current',
      senderName: user?.firstName || 'You',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isRead: false,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBack = () => {
    setSelectedChannel(null);
    setMessages([]);
  };

  if (loading) {
    return (
      <Box>
        <MobileHeader title="Team Chat" showNotifications />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  // Channel list view
  if (!selectedChannel) {
    return (
      <Box sx={{ pb: 8 }}>
        <MobileHeader title="Team Chat" showNotifications />
        
        <List sx={{ p: 0 }}>
          {channels.map((channel, index) => (
            <React.Fragment key={channel.id}>
              <ListItemButton
                onClick={() => setSelectedChannel(channel)}
                sx={{ py: 2, px: 2 }}
              >
                <ListItemAvatar>
                  <Badge badgeContent={channel.unreadCount} color="error" max={99}>
                    <Avatar sx={{ bgcolor: 'primary.light', fontSize: '1.5rem' }}>
                      {channel.icon || channel.displayName.charAt(0)}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={channel.displayName}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {channel.lastMessage}
                      </Typography>
                      {' — '}{channel.lastMessageTime}
                    </>
                  }
                  primaryTypographyProps={{ fontWeight: channel.unreadCount > 0 ? 600 : 400 }}
                  secondaryTypographyProps={{
                    component: 'span',
                    variant: 'body2',
                    sx: {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                    },
                  }}
                />
              </ListItemButton>
              {index < channels.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    );
  }

  // Chat view
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', pb: 8 }}>
      {/* Chat Header */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 0,
        }}
      >
        <IconButton edge="start" onClick={handleBack} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Avatar sx={{ bgcolor: 'primary.light', mr: 2, fontSize: '1.2rem' }}>
          {selectedChannel.icon || selectedChannel.displayName.charAt(0)}
        </Avatar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {selectedChannel.displayName}
        </Typography>
      </Paper>

      {/* Messages */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          backgroundColor: '#f5f5f5',
        }}
      >
        {messages.map((message) => {
          const isCurrentUser = message.senderId === (user?.id || 'current');
          
          return (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              {!isCurrentUser && (
                <Avatar sx={{ width: 32, height: 32, mr: 1, fontSize: '0.875rem' }}>
                  {message.senderName.charAt(0)}
                </Avatar>
              )}
              <Box sx={{ maxWidth: '70%' }}>
                {!isCurrentUser && (
                  <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                    {message.senderName}
                  </Typography>
                )}
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    backgroundColor: isCurrentUser ? 'primary.main' : 'white',
                    color: isCurrentUser ? 'white' : 'text.primary',
                    borderRadius: 2,
                    borderTopLeftRadius: !isCurrentUser ? 0 : 2,
                    borderTopRightRadius: isCurrentUser ? 0 : 2,
                  }}
                >
                  <Typography variant="body2">{message.content}</Typography>
                </Paper>
                <Typography
                  variant="caption"
                  sx={{
                    ml: 1,
                    color: 'text.secondary',
                    display: 'block',
                    mt: 0.5,
                  }}
                >
                  {message.timestamp}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Paper
        elevation={3}
        sx={{
          p: 1.5,
          borderRadius: 0,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton size="small">
                  <AttachIcon />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
            },
          }}
        />
      </Paper>
    </Box>
  );
};

      <BottomNav />

export default TeamChat;
