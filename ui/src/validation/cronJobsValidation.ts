import * as Yup from "yup";

export const cronJobFormSchema = Yup.object().shape({
  name: Yup.string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters")
    .required("Name is required"),
  description: Yup.string().max(500, "Description must be at most 500 characters"),
  cronExpression: Yup.string()
    .matches(
      /^(\*|[0-9,\-/]+)\s+(\*|[0-9,\-/]+)\s+(\*|[0-9,\-/]+)\s+(\*|[0-9,\-/]+)\s+(\*|[0-9,\-/]+)$/,
      "Invalid cron expression (use 5-part format: minute hour day month weekday)",
    )
    .required("Cron expression is required"),
  timezone: Yup.string().default("UTC"),
  webhookUrl: Yup.string()
    .url("Must be a valid URL")
    .required("Webhook URL is required"),
  method: Yup.string()
    .oneOf(["GET", "POST", "PUT", "DELETE", "PATCH"])
    .default("GET"),
  headers: Yup.string().test("valid-json", "Must be valid JSON", (value) => {
    if (!value) return true;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }),
  body: Yup.string(),
  maxRetries: Yup.number().min(0).max(10).default(3),
  timeout: Yup.number().min(1000).max(120000).default(30000),
});
