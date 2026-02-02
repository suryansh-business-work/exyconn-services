import * as Yup from 'yup';

export const imageKitConfigValidationSchema = Yup.object({
  name: Yup.string()
    .required('Configuration name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  publicKey: Yup.string().required('Public key is required').min(10, 'Public key seems too short'),
  privateKey: Yup.string()
    .required('Private key is required')
    .min(10, 'Private key seems too short'),
  urlEndpoint: Yup.string()
    .required('URL endpoint is required')
    .url('Must be a valid URL')
    .matches(/^https:\/\/ik\.imagekit\.io\//, 'Must be a valid ImageKit URL endpoint'),
  isDefault: Yup.boolean(),
  isActive: Yup.boolean(),
});

export const uploadValidationSchema = Yup.object({
  configId: Yup.string().required('ImageKit configuration is required'),
  folder: Yup.string().max(255, 'Folder path is too long'),
  tags: Yup.array().of(Yup.string().max(50, 'Tag is too long')),
  useUniqueFileName: Yup.boolean(),
});
