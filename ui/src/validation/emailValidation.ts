import * as Yup from "yup";

export const smtpConfigValidationSchema = Yup.object({
  name: Yup.string()
    .required("Configuration name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  host: Yup.string()
    .required("SMTP host is required")
    .max(255, "Host is too long"),
  port: Yup.number()
    .required("Port is required")
    .min(1, "Port must be at least 1")
    .max(65535, "Port must be at most 65535"),
  secure: Yup.boolean().required("Security setting is required"),
  username: Yup.string()
    .required("Username is required")
    .max(255, "Username is too long"),
  password: Yup.string().required("Password is required"),
  fromEmail: Yup.string()
    .required("From email is required")
    .email("Invalid email address")
    .max(255, "Email is too long"),
  fromName: Yup.string()
    .required("From name is required")
    .max(100, "Name is too long"),
  isDefault: Yup.boolean(),
  isActive: Yup.boolean(),
});

export const emailTemplateValidationSchema = Yup.object({
  name: Yup.string()
    .required("Template name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  description: Yup.string().max(500, "Description is too long"),
  subject: Yup.string()
    .required("Subject is required")
    .max(255, "Subject is too long"),
  mjmlContent: Yup.string().required("MJML content is required"),
  isActive: Yup.boolean(),
});

export const sendEmailValidationSchema = Yup.object({
  smtpConfigId: Yup.string().required("SMTP configuration is required"),
  templateId: Yup.string().required("Email template is required"),
  to: Yup.array()
    .of(Yup.string().email("Invalid email address"))
    .min(1, "At least one recipient is required")
    .required("Recipient email is required"),
  cc: Yup.array().of(Yup.string().email("Invalid CC email address")),
  bcc: Yup.array().of(Yup.string().email("Invalid BCC email address")),
  subject: Yup.string().max(255, "Subject is too long"),
});
