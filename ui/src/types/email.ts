// SMTP Configuration types
export interface SmtpConfig {
  id: string;
  organizationId: string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SmtpConfigFormValues {
  name: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface SmtpConfigListResponse {
  data: SmtpConfig[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Email Template types
export interface TemplateVariable {
  name: string;
  description?: string;
  defaultValue?: string;
}

export interface EmailTemplate {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  subject: string;
  mjmlContent: string;
  htmlContent?: string;
  variables: TemplateVariable[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplateFormValues {
  name: string;
  description?: string;
  subject: string;
  mjmlContent: string;
  variables?: TemplateVariable[];
  isActive?: boolean;
}

export interface EmailTemplateListResponse {
  data: EmailTemplate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TemplatePreviewResult {
  html: string;
  errors: Array<{
    line: number;
    message: string;
    tagName: string;
  }>;
}

// Email Send types
export interface SendEmailInput {
  smtpConfigId: string;
  templateId: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  variables?: Record<string, string>;
  subject?: string;
  apiKeyUsed?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  recipient: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  sentAt: string;
}

export interface TestSmtpResult {
  success: boolean;
  message?: string;
  error?: string;
}

// Email Log types
export interface EmailLog {
  id: string;
  organizationId: string;
  smtpConfigId: string;
  templateId: string;
  apiKeyUsed?: string;
  recipient: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  status: "sent" | "failed" | "pending";
  messageId?: string;
  error?: string;
  variables: Record<string, string>;
  sentAt: string;
  createdAt: string;
}

export interface EmailLogListResponse {
  data: EmailLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EmailStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}
