import { Box, Menu, MenuItem, Typography, ListItemIcon, ListItemText } from '@mui/material';
import { Key, KeyboardArrowDown } from '@mui/icons-material';
import { ApiKey } from '../../../types/organization';

interface ApiKeyDropdownProps {
  apiKeys: ApiKey[];
  selectedApiKey: ApiKey | null;
  anchorEl: HTMLElement | null;
  onOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onClose: () => void;
  onSelect: (key: ApiKey) => void;
}

const ApiKeyDropdown = ({
  apiKeys,
  selectedApiKey,
  anchorEl,
  onOpen,
  onClose,
  onSelect,
}: ApiKeyDropdownProps) => {
  const displayText = selectedApiKey?.keyName || 'Select API Key';

  return (
    <>
      <Box
        onClick={onOpen}
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          mr: 1,
          bgcolor: 'action.hover',
          '&:hover': { bgcolor: 'action.selected' },
        }}
      >
        <Key sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
        <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 500, maxWidth: 120 }} noWrap>
          {displayText}
        </Typography>
        <KeyboardArrowDown sx={{ fontSize: 16, ml: 0.5, color: 'text.secondary' }} />
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        PaperProps={{ sx: { width: 280, maxHeight: 300 } }}
      >
        {apiKeys.map((key) => (
          <MenuItem
            key={key.apiKey}
            onClick={() => onSelect(key)}
            selected={selectedApiKey?.apiKey === key.apiKey}
            sx={{ fontSize: 12, py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <Key sx={{ fontSize: 16 }} />
            </ListItemIcon>
            <ListItemText
              primary={key.keyName}
              secondary={`${key.apiKey.substring(0, 16)}...`}
              primaryTypographyProps={{ fontSize: 12 }}
              secondaryTypographyProps={{ fontSize: 10, fontFamily: 'monospace' }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ApiKeyDropdown;
