import * as Yup from "yup";

export const apiLogSettingsValidationSchema = Yup.object({
  retentionDays: Yup.number()
    .min(1, "Minimum 1 day")
    .max(365, "Maximum 365 days")
    .required("Retention days is required"),
  maxLogsPerDay: Yup.number()
    .min(1000, "Minimum 1000 logs per day")
    .required("Max logs per day is required"),
  enabledLevels: Yup.array()
    .of(Yup.string().oneOf(["info", "warn", "error", "debug"]))
    .min(1, "At least one level must be enabled"),
  enableRequestBodyCapture: Yup.boolean(),
  enableResponseBodyCapture: Yup.boolean(),
  excludedPaths: Yup.array().of(Yup.string()),
});

export const testLogValidationSchema = Yup.object({
  method: Yup.string()
    .oneOf(["GET", "POST", "PUT", "DELETE", "PATCH"])
    .required("Method is required"),
  url: Yup.string().required("URL is required"),
  statusCode: Yup.number()
    .min(100)
    .max(599)
    .required("Status code is required"),
  level: Yup.string()
    .oneOf(["info", "warn", "error", "debug"])
    .required("Level is required"),
  message: Yup.string().min(1).required("Message is required"),
  source: Yup.string(),
  responseTime: Yup.number().min(0),
});
