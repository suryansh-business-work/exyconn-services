import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { CodeLanguage } from './types';

interface LanguageSelectorProps {
  value: CodeLanguage;
  onChange: (value: CodeLanguage) => void;
}

const LanguageSelector = ({ value, onChange }: LanguageSelectorProps) => {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Code Examples Language
      </Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, newValue) => newValue && onChange(newValue)}
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            px: 2,
            py: 0.5,
            textTransform: 'none',
            fontSize: 12,
            fontWeight: 500,
          },
        }}
      >
        <ToggleButton value="curl">cURL</ToggleButton>
        <ToggleButton value="javascript">JavaScript</ToggleButton>
        <ToggleButton value="python">Python</ToggleButton>
        <ToggleButton value="php">PHP</ToggleButton>
        <ToggleButton value="go">Go</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default LanguageSelector;
