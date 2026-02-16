import { useRef, useEffect, useCallback } from "react";
import { Box, IconButton, Tooltip, Paper, Divider } from "@mui/material";
import { FormatBold, FormatItalic, FormatUnderlined, FormatListBulleted, FormatListNumbered } from "@mui/icons-material";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const execCmd = useCallback((command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Box sx={{ display: "flex", gap: 0.25, px: 0.5, py: 0.25, bgcolor: "action.hover", borderBottom: 1, borderColor: "divider" }}>
        <Tooltip title="Bold"><IconButton size="small" onClick={() => execCmd("bold")}><FormatBold sx={{ fontSize: 16 }} /></IconButton></Tooltip>
        <Tooltip title="Italic"><IconButton size="small" onClick={() => execCmd("italic")}><FormatItalic sx={{ fontSize: 16 }} /></IconButton></Tooltip>
        <Tooltip title="Underline"><IconButton size="small" onClick={() => execCmd("underline")}><FormatUnderlined sx={{ fontSize: 16 }} /></IconButton></Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="Bullet List"><IconButton size="small" onClick={() => execCmd("insertUnorderedList")}><FormatListBulleted sx={{ fontSize: 16 }} /></IconButton></Tooltip>
        <Tooltip title="Numbered List"><IconButton size="small" onClick={() => execCmd("insertOrderedList")}><FormatListNumbered sx={{ fontSize: 16 }} /></IconButton></Tooltip>
      </Box>
      <Box
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        sx={{
          minHeight: 60,
          maxHeight: 200,
          overflowY: "auto",
          px: 1.5,
          py: 1,
          fontSize: 13,
          lineHeight: 1.5,
          outline: "none",
          "&:empty::before": {
            content: "attr(data-placeholder)",
            color: "text.disabled",
            pointerEvents: "none",
          },
          "& b, & strong": { fontWeight: 700 },
          "& i, & em": { fontStyle: "italic" },
          "& u": { textDecoration: "underline" },
          "& ul, & ol": { pl: 2, my: 0.5 },
        }}
      />
    </Paper>
  );
};

export default RichTextEditor;
