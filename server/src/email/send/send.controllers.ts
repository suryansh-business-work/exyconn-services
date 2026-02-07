import { Request, Response } from "express";
import * as sendService from "./send.services";
import { sendEmailSchema } from "./send.validators";

// Send email
export const sendEmail = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const validatedData = sendEmailSchema.parse(req.body);
    const result = await sendService.sendEmail(
      orgId,
      validatedData,
      validatedData.apiKeyUsed,
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Validation failed", details: error });
    } else if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  }
};

// Test SMTP connection
export const testSmtpConnection = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const configId = req.params.configId as string;
    const result = await sendService.testSmtpConnection(orgId, configId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      console.error("Error testing SMTP connection:", error);
      res.status(500).json({ error: "Failed to test SMTP connection" });
    }
  }
};
