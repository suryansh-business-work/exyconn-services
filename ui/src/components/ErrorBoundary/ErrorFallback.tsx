import { Box, Typography, Button, Paper } from "@mui/material";
import { Refresh, BugReport } from "@mui/icons-material";

interface ErrorFallbackProps {
  error: Error | null;
  onReset?: () => void;
}

const ErrorFallback = ({ error, onReset }: ErrorFallbackProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 100px)",
        textAlign: "center",
        p: 3,
      }}
    >
      <BugReport sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
      <Typography
        variant="h5"
        sx={{ fontSize: 20, fontWeight: 600, color: "text.primary", mb: 1 }}
      >
        Something went wrong
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontSize: 14, color: "text.secondary", mb: 3, maxWidth: 400 }}
      >
        An unexpected error occurred. Please try again or contact support if the
        problem persists.
      </Typography>
      {error && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            maxWidth: 500,
            width: "100%",
            bgcolor: "error.lighter",
            borderColor: "error.light",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: 12,
              fontFamily: "monospace",
              color: "error.dark",
              wordBreak: "break-word",
            }}
          >
            {error.message}
          </Typography>
        </Paper>
      )}
      <Button
        variant="contained"
        startIcon={<Refresh />}
        onClick={onReset}
        sx={{ textTransform: "none" }}
      >
        Try Again
      </Button>
    </Box>
  );
};

export default ErrorFallback;
