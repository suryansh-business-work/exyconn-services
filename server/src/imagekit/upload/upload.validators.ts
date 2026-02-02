import { z } from 'zod';

export const uploadSchema = z.object({
  body: z.object({
    configId: z.string(),
    folder: z.string().optional(),
    tags: z.string().optional(), // JSON stringified array
    useUniqueFileName: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
    apiKey: z.string().optional(),
    uploadMode: z.enum(['single', 'multiple', 'single-array', 'multiple-array']).optional(),
  }),
});

export type UploadInput = z.infer<typeof uploadSchema>['body'];
