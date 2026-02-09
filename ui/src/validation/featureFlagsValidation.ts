import * as Yup from "yup";

export const featureFlagValidationSchema = Yup.object({
  key: Yup.string()
    .matches(
      /^[a-z0-9_-]+$/,
      "Key must be lowercase alphanumeric with dashes or underscores",
    )
    .required("Key is required"),
  name: Yup.string().min(1).required("Name is required"),
  description: Yup.string().default(""),
  status: Yup.string()
    .oneOf(["active", "inactive", "archived"])
    .default("active"),
  enabled: Yup.boolean().default(false),
  rolloutType: Yup.string()
    .oneOf(["boolean", "percentage", "user-list"])
    .default("boolean"),
  rolloutPercentage: Yup.number().min(0).max(100).default(100),
  targetUsers: Yup.array().of(Yup.string()).default([]),
  tags: Yup.array().of(Yup.string()).default([]),
  defaultValue: Yup.boolean().default(false),
});

export const featureFlagEvaluateSchema = Yup.object({
  key: Yup.string().required("Flag key is required"),
  userId: Yup.string(),
  attributes: Yup.object(),
});
