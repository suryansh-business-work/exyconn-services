import mongoose, { Schema, Document } from 'mongoose';

export interface IHttpStatusResult {
  statusCode: number;
  statusText: string;
  isOk: boolean;
}

export interface ISslCertificateResult {
  valid: boolean;
  issuer: string;
  subject: string;
  validFrom: Date;
  validTo: Date;
  daysUntilExpiry: number;
  protocol: string;
}

export interface IDnsRecordsResult {
  aRecords: string[];
  aaaaRecords: string[];
  nsRecords: string[];
  txtRecords: string[];
  cnameRecords: string[];
}

export interface IMxRecordsResult {
  records: Array<{ exchange: string; priority: number }>;
}

export interface IScreenshotResult {
  url: string;
  thumbnailUrl: string;
  capturedAt: Date;
  width: number;
  height: number;
}

export interface IPageInfoResult {
  title: string;
  description: string;
  favicon: string;
  ogImage: string;
  keywords: string[];
  language: string;
  charset: string;
  generator: string;
  loadTime: number;
}

export interface ISiteCheckResult extends Document {
  organizationId: mongoose.Types.ObjectId;
  monitorId: mongoose.Types.ObjectId;
  url: string;
  timestamp: Date;
  httpStatus?: IHttpStatusResult;
  sslCertificate?: ISslCertificateResult;
  dnsRecords?: IDnsRecordsResult;
  mxRecords?: IMxRecordsResult;
  screenshot?: IScreenshotResult;
  pageInfo?: IPageInfoResult;
  responseTime?: number;
  overallStatus: 'healthy' | 'warning' | 'error';
}

const HttpStatusResultSchema = new Schema<IHttpStatusResult>(
  { statusCode: Number, statusText: String, isOk: Boolean },
  { _id: false }
);

const SslCertificateResultSchema = new Schema<ISslCertificateResult>(
  {
    valid: Boolean,
    issuer: String,
    subject: String,
    validFrom: Date,
    validTo: Date,
    daysUntilExpiry: Number,
    protocol: String,
  },
  { _id: false }
);

const DnsRecordsResultSchema = new Schema<IDnsRecordsResult>(
  {
    aRecords: [String],
    aaaaRecords: [String],
    nsRecords: [String],
    txtRecords: [String],
    cnameRecords: [String],
  },
  { _id: false }
);

const MxRecordsResultSchema = new Schema<IMxRecordsResult>(
  { records: [{ exchange: String, priority: Number }] },
  { _id: false }
);

const ScreenshotResultSchema = new Schema<IScreenshotResult>(
  { url: String, thumbnailUrl: String, capturedAt: Date, width: Number, height: Number },
  { _id: false }
);

const PageInfoResultSchema = new Schema<IPageInfoResult>(
  {
    title: String,
    description: String,
    favicon: String,
    ogImage: String,
    keywords: [String],
    language: String,
    charset: String,
    generator: String,
    loadTime: Number,
  },
  { _id: false }
);

const SiteCheckResultSchema = new Schema<ISiteCheckResult>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    monitorId: { type: Schema.Types.ObjectId, ref: 'SiteMonitor', required: true, index: true },
    url: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    httpStatus: HttpStatusResultSchema,
    sslCertificate: SslCertificateResultSchema,
    dnsRecords: DnsRecordsResultSchema,
    mxRecords: MxRecordsResultSchema,
    screenshot: ScreenshotResultSchema,
    pageInfo: PageInfoResultSchema,
    responseTime: Number,
    overallStatus: { type: String, enum: ['healthy', 'warning', 'error'], required: true },
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: (_, ret: Record<string, unknown>) => {
        ret.id = (ret._id as { toString(): string }).toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

SiteCheckResultSchema.index({ organizationId: 1, timestamp: -1 });
SiteCheckResultSchema.index({ monitorId: 1, timestamp: -1 });

export const SiteCheckResult = mongoose.model<ISiteCheckResult>(
  'SiteCheckResult',
  SiteCheckResultSchema
);
