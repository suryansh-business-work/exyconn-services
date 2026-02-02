import { useState } from 'react';
import { Box, TextField, Typography, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { Field, FormikErrors, FormikTouched } from 'formik';
import { ChipInput } from '../../../components/common';
import { SendEmailFormValues } from './types';

interface RecipientSectionProps {
  values: SendEmailFormValues;
  touched: FormikTouched<SendEmailFormValues>;
  errors: FormikErrors<SendEmailFormValues>;
  setFieldValue: (field: string, value: unknown) => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RecipientSection = ({ values, touched, errors, setFieldValue }: RecipientSectionProps) => {
  const [showCcBcc, setShowCcBcc] = useState(false);

  const validateEmail = (email: string) => emailRegex.test(email);

  return (
    <>
      {/* To Recipients */}
      <ChipInput
        value={values.to}
        onChange={(emails) => setFieldValue('to', emails)}
        validateItem={validateEmail}
        label="Recipients (To) *"
        placeholder="Type email and press Enter"
        fullWidth
        error={touched.to && Boolean(errors.to)}
        helperText="Press Enter, comma or space to add multiple recipients"
        chipColor="primary"
      />

      {/* Subject */}
      <Field
        as={TextField}
        name="subject"
        label="Subject"
        fullWidth
        error={touched.subject && Boolean(errors.subject)}
        helperText="Leave empty to use template's subject"
      />

      {/* CC/BCC Toggle */}
      <Box>
        <Box
          onClick={() => setShowCcBcc(!showCcBcc)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            color: 'primary.main',
            mb: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {showCcBcc ? 'Hide' : 'Show'} CC & BCC
          </Typography>
          <IconButton size="small">
            {showCcBcc ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </IconButton>
        </Box>
        <Collapse in={showCcBcc}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ChipInput
              value={values.cc}
              onChange={(emails) => setFieldValue('cc', emails)}
              validateItem={validateEmail}
              label="CC"
              placeholder="Add CC recipients"
              fullWidth
              size="small"
              helperText="Carbon copy recipients"
              chipColor="secondary"
            />
            <ChipInput
              value={values.bcc}
              onChange={(emails) => setFieldValue('bcc', emails)}
              validateItem={validateEmail}
              label="BCC"
              placeholder="Add BCC recipients"
              fullWidth
              size="small"
              helperText="Blind carbon copy recipients"
              chipColor="secondary"
            />
          </Box>
        </Collapse>
      </Box>
    </>
  );
};

export default RecipientSection;
