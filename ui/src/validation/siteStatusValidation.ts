import * as Yup from 'yup';

export const siteCheckOptionsSchema = Yup.object({
  httpStatus: Yup.boolean().required(),
  sslCertificate: Yup.boolean().required(),
  dnsRecords: Yup.boolean().required(),
  mxRecords: Yup.boolean().required(),
  screenshot: Yup.boolean().required(),
  pageInfo: Yup.boolean().required(),
  responseTime: Yup.boolean().required(),
});

export const createSiteMonitorSchema = Yup.object({
  url: Yup.string()
    .required('URL is required')
    .url('Must be a valid URL')
    .matches(/^https?:\/\//, 'URL must start with http:// or https://'),
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  checks: siteCheckOptionsSchema.required('At least one check must be selected'),
});

export const updateSiteMonitorSchema = Yup.object({
  url: Yup.string()
    .url('Must be a valid URL')
    .matches(/^https?:\/\//, 'URL must start with http:// or https://'),
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  isActive: Yup.boolean(),
  checks: siteCheckOptionsSchema.partial(),
});

export const defaultCheckOptions = {
  httpStatus: true,
  sslCertificate: true,
  dnsRecords: false,
  mxRecords: false,
  screenshot: true,
  pageInfo: true,
  responseTime: true,
};
