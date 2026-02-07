import { useState, KeyboardEvent, ChangeEvent } from "react";
import {
  Box,
  Chip,
  TextField,
  TextFieldProps,
  FormHelperText,
} from "@mui/material";

interface ChipInputProps extends Omit<TextFieldProps, "value" | "onChange"> {
  value: string[];
  onChange: (values: string[]) => void;
  validateItem?: (value: string) => boolean;
  helperText?: string;
  chipColor?:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
}

const ChipInput = ({
  value = [],
  onChange,
  validateItem,
  helperText,
  chipColor = "default",
  error,
  ...textFieldProps
}: ChipInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addItem();
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const addItem = () => {
    const trimmed = inputValue.trim().replace(/,/g, "");
    if (!trimmed) return;

    if (validateItem && !validateItem(trimmed)) {
      setInputError("Invalid format");
      return;
    }

    if (value.includes(trimmed)) {
      setInputError("Already added");
      return;
    }

    onChange([...value, trimmed]);
    setInputValue("");
    setInputError("");
  };

  const handleDelete = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setInputError("");
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addItem();
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0.5,
          p: value.length > 0 ? 1 : 0,
          pb: value.length > 0 ? 0.5 : 0,
          border: value.length > 0 ? "1px solid" : "none",
          borderColor: error || inputError ? "error.main" : "divider",
          borderBottom: "none",
          borderRadius: "4px 4px 0 0",
          bgcolor: value.length > 0 ? "action.hover" : "transparent",
        }}
      >
        {value.map((item, index) => (
          <Chip
            key={`${item}-${index}`}
            label={item}
            size="small"
            color={chipColor}
            onDelete={() => handleDelete(index)}
            sx={{ fontSize: 12 }}
          />
        ))}
      </Box>
      <TextField
        {...textFieldProps}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        error={error || Boolean(inputError)}
        sx={{
          ...textFieldProps.sx,
          "& .MuiOutlinedInput-root": {
            borderRadius: value.length > 0 ? "0 0 4px 4px" : "4px",
          },
        }}
      />
      <FormHelperText error={Boolean(inputError)}>
        {inputError || helperText}
      </FormHelperText>
    </Box>
  );
};

export default ChipInput;
