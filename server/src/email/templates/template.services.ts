import mongoose from "mongoose";
import mjml2html from "mjml";
import { EmailTemplateModel, IEmailTemplate } from "./template.models";
import {
  CreateEmailTemplateInput,
  UpdateEmailTemplateInput,
  ListEmailTemplatesQuery,
  PreviewTemplateInput,
} from "./template.validators";

// Transform Mongoose document to plain object
const transformEmailTemplate = (doc: IEmailTemplate) => ({
  id: doc._id.toString(),
  organizationId: doc.organizationId.toString(),
  name: doc.name,
  description: doc.description,
  subject: doc.subject,
  mjmlContent: doc.mjmlContent,
  htmlContent: doc.htmlContent,
  variables: doc.variables,
  isActive: doc.isActive,
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
});

// Compile MJML to HTML
const compileMjml = (
  mjmlContent: string,
  variables: Record<string, string> = {},
) => {
  // Replace variables in MJML content
  let processedContent = mjmlContent;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    processedContent = processedContent.replace(regex, value);
  }

  // Compile MJML to HTML
  const result = mjml2html(processedContent, {
    validationLevel: "soft",
    minify: false,
  });

  return {
    html: result.html,
    errors: result.errors,
  };
};

// Create Email Template
export const createEmailTemplate = async (
  organizationId: string,
  data: CreateEmailTemplateInput,
) => {
  // Check for duplicate name within org
  const existing = await EmailTemplateModel.findOne({
    organizationId,
    name: data.name,
  });
  if (existing) {
    throw new Error(`Email template with name "${data.name}" already exists`);
  }

  // Compile MJML to HTML
  const { html, errors } = compileMjml(data.mjmlContent);
  if (errors.length > 0) {
    throw new Error(
      `MJML compilation errors: ${errors.map((e) => e.message).join(", ")}`,
    );
  }

  const template = new EmailTemplateModel({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    ...data,
    htmlContent: html,
  });

  await template.save();
  return transformEmailTemplate(template);
};

// Get all Email Templates for an organization
export const getEmailTemplates = async (
  organizationId: string,
  query: ListEmailTemplatesQuery,
) => {
  const { page, limit, search, isActive } = query;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { organizationId };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
    ];
  }

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  const [templates, total] = await Promise.all([
    EmailTemplateModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    EmailTemplateModel.countDocuments(filter),
  ]);

  return {
    data: templates.map(transformEmailTemplate),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get single Email Template
export const getEmailTemplate = async (
  organizationId: string,
  templateId: string,
) => {
  const template = await EmailTemplateModel.findOne({
    _id: templateId,
    organizationId,
  });

  if (!template) {
    throw new Error("Email template not found");
  }

  return transformEmailTemplate(template);
};

// Update Email Template
export const updateEmailTemplate = async (
  organizationId: string,
  templateId: string,
  data: UpdateEmailTemplateInput,
) => {
  // Check for duplicate name within org (if name is being updated)
  if (data.name) {
    const existing = await EmailTemplateModel.findOne({
      organizationId,
      name: data.name,
      _id: { $ne: templateId },
    });
    if (existing) {
      throw new Error(`Email template with name "${data.name}" already exists`);
    }
  }

  // If MJML content is updated, recompile to HTML
  let htmlContent: string | undefined;
  if (data.mjmlContent) {
    const { html, errors } = compileMjml(data.mjmlContent);
    if (errors.length > 0) {
      throw new Error(
        `MJML compilation errors: ${errors.map((e) => e.message).join(", ")}`,
      );
    }
    htmlContent = html;
  }

  const template = await EmailTemplateModel.findOneAndUpdate(
    { _id: templateId, organizationId },
    { ...data, ...(htmlContent ? { htmlContent } : {}) },
    { new: true, runValidators: true },
  );

  if (!template) {
    throw new Error("Email template not found");
  }

  return transformEmailTemplate(template);
};

// Delete Email Template
export const deleteEmailTemplate = async (
  organizationId: string,
  templateId: string,
) => {
  const template = await EmailTemplateModel.findOneAndDelete({
    _id: templateId,
    organizationId,
  });

  if (!template) {
    throw new Error("Email template not found");
  }

  return { message: "Email template deleted successfully" };
};

// Preview MJML template (compile and return HTML)
export const previewTemplate = async (data: PreviewTemplateInput) => {
  const { html, errors } = compileMjml(data.mjmlContent, data.variables);

  return {
    html,
    errors: errors.map((e) => ({
      line: e.line,
      message: e.message,
      tagName: e.tagName,
    })),
  };
};

// Get template with rendered HTML (for sending)
export const getRenderedTemplate = async (
  organizationId: string,
  templateId: string,
  variables: Record<string, string>,
) => {
  const template = await getEmailTemplate(organizationId, templateId);

  // Merge provided variables with template defaults
  const mergedVariables: Record<string, string> = {};

  // First, set default values from template
  for (const v of template.variables) {
    if (v.defaultValue) {
      mergedVariables[v.name] = v.defaultValue;
    }
  }

  // Then, override with provided variables (if not empty)
  for (const [key, value] of Object.entries(variables)) {
    if (value && value.trim() !== "") {
      mergedVariables[key] = value;
    }
  }

  // Compile with merged variables
  const { html, errors } = compileMjml(template.mjmlContent, mergedVariables);

  if (errors.length > 0) {
    throw new Error(
      `MJML compilation errors: ${errors.map((e) => e.message).join(", ")}`,
    );
  }

  // Process subject with variables
  let processedSubject = template.subject;
  for (const [key, value] of Object.entries(mergedVariables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    processedSubject = processedSubject.replace(regex, value);
  }

  return {
    ...template,
    subject: processedSubject,
    htmlContent: html,
  };
};
