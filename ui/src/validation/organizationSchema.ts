import * as Yup from "yup";

export const organizationValidationSchema = Yup.object({
  orgName: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .required("Organization name is required"),
  orgDescription: Yup.string().max(500, "Description too long"),
  orgSlug: Yup.string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug too long")
    .matches(
      /^[a-z][a-zA-Z0-9]*$/,
      "Slug must be camelCase starting with lowercase",
    )
    .required("Slug is required"),
  orgType: Yup.mixed<"Service" | "Product">()
    .oneOf(["Service", "Product"], "Invalid type")
    .required("Type is required"),
  orgApiKeys: Yup.array()
    .of(
      Yup.object({
        keyName: Yup.string()
          .min(1, "Key name is required")
          .max(50, "Key name too long")
          .required("Key name is required"),
      }),
    )
    .test(
      "unique-key-names",
      "Duplicate API key names are not allowed",
      function (value) {
        if (!value || value.length === 0) return true;
        const keyNames = value
          .map((k) => k.keyName?.toLowerCase())
          .filter(Boolean);
        const uniqueNames = new Set(keyNames);
        return keyNames.length === uniqueNames.size;
      },
    ),
});

export const apiKeyValidationSchema = Yup.object({
  keyName: Yup.string()
    .min(1, "Key name is required")
    .max(50, "Key name too long")
    .required("Key name is required"),
});
