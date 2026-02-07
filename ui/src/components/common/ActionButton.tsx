import { Button, ButtonProps, CircularProgress } from "@mui/material";

interface ActionButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

const ActionButton = ({
  loading = false,
  loadingText,
  children,
  disabled,
  ...props
}: ActionButtonProps) => {
  return (
    <Button {...props} disabled={disabled || loading}>
      {loading ? (
        <>
          <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default ActionButton;
