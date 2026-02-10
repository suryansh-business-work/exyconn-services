import { Box, Card, CardContent, CardActionArea, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import { ContentCopy, Delete, Edit } from "@mui/icons-material";
import { ThemeData } from "../../types/translationsTheme";

interface ThemeCardProps {
  theme: ThemeData;
  onClick: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const COLOR_PREVIEW_KEYS = ["primary", "secondary", "success", "warning", "error", "info"] as const;

const ThemeCard = ({ theme, onClick, onEdit, onDuplicate, onDelete }: ThemeCardProps) => {
  return (
    <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea onClick={onClick} sx={{ flex: 1 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ flex: 1 }}>
              {theme.name}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {theme.isActive && <Chip label="Active" size="small" color="success" variant="outlined" />}
              {theme.isDefault && <Chip label="Default" size="small" color="primary" variant="outlined" />}
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, minHeight: 20 }}>
            {theme.description || "No description"}
          </Typography>
          {/* Color Swatches Preview */}
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {COLOR_PREVIEW_KEYS.map((key) => (
              <Tooltip key={key} title={`${key}: ${theme.colors[key]}`}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "4px",
                    bgcolor: theme.colors[key],
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                />
              </Tooltip>
            ))}
          </Box>
          <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: "block" }}>
            Font: {theme.typography.fontFamily.split(",")[0]}
          </Typography>
        </CardContent>
      </CardActionArea>
      <Box sx={{ display: "flex", justifyContent: "flex-end", px: 1, pb: 1, gap: 0.5 }}>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={onEdit}><Edit fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="Duplicate">
          <IconButton size="small" onClick={onDuplicate}><ContentCopy fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={onDelete}><Delete fontSize="small" /></IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default ThemeCard;
