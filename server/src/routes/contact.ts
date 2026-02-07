import { Router, Request, Response } from "express";

const router = Router();

interface ContactRequest {
  name: string;
  email: string;
  message: string;
}

// Store contacts in memory (for demo purposes)
const contacts: ContactRequest[] = [];

// POST /api/contact - Submit a contact form
router.post(
  "/",
  (
    req: Request<Record<string, never>, Record<string, never>, ContactRequest>,
    res: Response,
  ) => {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "All fields are required: name, email, message",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // Store the contact
    const contact: ContactRequest = { name, email, message };
    contacts.push(contact);

    console.log("New contact received:", contact);

    return res.status(201).json({
      success: true,
      message: "Contact form submitted successfully",
      data: contact,
    });
  },
);

// GET /api/contact - Get all contacts
router.get("/", (req: Request, res: Response) => {
  return res.json({
    success: true,
    count: contacts.length,
    data: contacts,
  });
});

export default router;
