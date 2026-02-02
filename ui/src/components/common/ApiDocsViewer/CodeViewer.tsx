import { useState } from 'react';
import { Box, IconButton, Tooltip, Chip } from '@mui/material';
import { ContentCopy, Check } from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { CodeViewerProps } from './types';

const getMonacoLanguage = (lang: string): string => {
  const langMap: Record<string, string> = {
    curl: 'shell',
    javascript: 'javascript',
    python: 'python',
    php: 'php',
    go: 'go',
    json: 'json',
    bash: 'shell',
  };
  return langMap[lang] || 'plaintext';
};

const CodeViewer = ({ code, language, height = 'auto' }: CodeViewerProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = code.split('\n').length;
  const calculatedHeight =
    height === 'auto' ? Math.min(Math.max(lineCount * 19 + 20, 80), 400) : height;

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 1,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 0.5,
          bgcolor: 'grey.900',
        }}
      >
        <Chip
          label={language.toUpperCase()}
          size="small"
          sx={{ bgcolor: 'grey.700', color: 'grey.300', fontSize: 10, height: 20 }}
        />
        <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
          <IconButton
            size="small"
            onClick={handleCopy}
            sx={{ color: 'grey.400', '&:hover': { color: 'grey.100' } }}
          >
            {copied ? <Check fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
      <Editor
        height={calculatedHeight}
        language={getMonacoLanguage(language)}
        value={code}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 12,
          lineNumbers: 'off',
          folding: false,
          wordWrap: 'on',
          renderLineHighlight: 'none',
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
          padding: { top: 8, bottom: 8 },
        }}
      />
    </Box>
  );
};

export default CodeViewer;
