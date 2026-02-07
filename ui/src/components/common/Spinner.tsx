import { CircularProgress, Box, BoxProps } from "@mui/material";

interface SpinnerProps extends Omit<BoxProps, "children"> {
  size?: number;
  color?: "primary" | "secondary" | "inherit";
}

const Spinner = ({
  size = 24,
  color = "primary",
  ...boxProps
}: SpinnerProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...boxProps.sx,
      }}
      {...boxProps}
    >
      <CircularProgress size={size} color={color} />
    </Box>
  );
};

export default Spinner;
