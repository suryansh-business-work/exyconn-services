export interface SendEmailFormValues {
  smtpConfigId: string;
  templateId: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  variables: Record<string, string>;
}

export const initialFormValues: SendEmailFormValues = {
  smtpConfigId: '',
  templateId: '',
  to: [],
  cc: [],
  bcc: [],
  subject: '',
  variables: {},
};
