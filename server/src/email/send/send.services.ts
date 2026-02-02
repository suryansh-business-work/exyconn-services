import nodemailer from 'nodemailer';
import { getSmtpConfig } from '../smtp/smtp.services';
import { getRenderedTemplate } from '../templates/template.services';
import { createEmailLog } from '../logs/log.services';
import { SendEmailInput, SendEmailResult } from './send.validators';

// Send email using SMTP config and template
export const sendEmail = async (
  organizationId: string,
  data: SendEmailInput,
  apiKeyUsed?: string
): Promise<SendEmailResult> => {
  let subject = data.subject || 'Unknown';

  try {
    // Get SMTP configuration
    const smtpConfig = await getSmtpConfig(organizationId, data.smtpConfigId);

    // Get rendered template with variables
    const template = await getRenderedTemplate(organizationId, data.templateId, data.variables);
    subject = data.subject || template.subject;

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
    });

    // Prepare email options
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
      to: data.to,
      subject: subject,
      html: template.htmlContent,
    };

    // Add CC if provided
    if (data.cc) {
      mailOptions.cc = data.cc;
    }

    // Add BCC if provided
    if (data.bcc) {
      mailOptions.bcc = data.bcc;
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Log successful email
    await createEmailLog({
      organizationId,
      smtpConfigId: data.smtpConfigId,
      templateId: data.templateId,
      apiKeyUsed,
      recipient: data.to,
      cc: data.cc,
      bcc: data.bcc,
      subject: subject,
      status: 'sent',
      messageId: info.messageId,
      variables: data.variables,
    });

    return {
      success: true,
      messageId: info.messageId,
      recipient: data.to,
      cc: data.cc,
      bcc: data.bcc,
      subject: subject,
      sentAt: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Log failed email
    await createEmailLog({
      organizationId,
      smtpConfigId: data.smtpConfigId,
      templateId: data.templateId,
      apiKeyUsed,
      recipient: data.to,
      cc: data.cc,
      bcc: data.bcc,
      subject: subject,
      status: 'failed',
      error: errorMessage,
      variables: data.variables,
    });

    return {
      success: false,
      error: errorMessage,
      recipient: data.to,
      cc: data.cc,
      bcc: data.bcc,
      subject: subject,
      sentAt: new Date().toISOString(),
    };
  }
};

// Test SMTP connection
export const testSmtpConnection = async (organizationId: string, smtpConfigId: string) => {
  try {
    const smtpConfig = await getSmtpConfig(organizationId, smtpConfigId);

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
    });

    await transporter.verify();

    return {
      success: true,
      message: 'SMTP connection successful',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect to SMTP server',
    };
  }
};
