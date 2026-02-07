/* eslint-disable react-hooks/static-components */
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Paper,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Security,
  Dns,
  Email,
  Image,
  Info,
  Speed,
} from "@mui/icons-material";
import { SiteCheckResult } from "../../../types/siteStatus";

interface CheckDetailDialogProps {
  open: boolean;
  onClose: () => void;
  check: SiteCheckResult | null;
}

const CheckDetailDialog = ({
  open,
  onClose,
  check,
}: CheckDetailDialogProps) => {
  if (!check) return null;

  const getStatusColor = (status: string) => {
    if (status === "healthy") return "success";
    if (status === "warning") return "warning";
    return "error";
  };

  const getStatusIcon = (status: string) => {
    if (status === "healthy") return <CheckCircle color="success" />;
    if (status === "warning") return <Warning color="warning" />;
    return <ErrorIcon color="error" />;
  };

  const SectionCard = ({
    title,
    icon,
    children,
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        {icon}
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      {children}
    </Paper>
  );

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {getStatusIcon(check.overallStatus)}
          <Box>
            <Typography variant="h6">Check Details</Typography>
            <Typography variant="body2" color="text.secondary">
              {check.url}
            </Typography>
          </Box>
          <Chip
            label={check.overallStatus.toUpperCase()}
            color={getStatusColor(check.overallStatus)}
            size="small"
            sx={{ ml: "auto" }}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Checked at: {new Date(check.timestamp).toLocaleString()}
        </Typography>

        <Grid container spacing={2}>
          {/* HTTP Status */}
          {check.httpStatus && (
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard
                title="HTTP Status"
                icon={
                  <CheckCircle
                    color={check.httpStatus.isOk ? "success" : "error"}
                  />
                }
              >
                <InfoRow
                  label="Status Code"
                  value={
                    <Chip
                      label={check.httpStatus.statusCode}
                      size="small"
                      color={check.httpStatus.isOk ? "success" : "error"}
                    />
                  }
                />
                <InfoRow
                  label="Status Text"
                  value={check.httpStatus.statusText}
                />
              </SectionCard>
            </Grid>
          )}

          {/* Response Time */}
          {check.responseTime !== undefined && (
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard
                title="Response Time"
                icon={<Speed color="primary" />}
              >
                <InfoRow label="Time" value={`${check.responseTime}ms`} />
                <InfoRow
                  label="Performance"
                  value={
                    check.responseTime < 500 ? (
                      <Chip label="Fast" size="small" color="success" />
                    ) : check.responseTime < 2000 ? (
                      <Chip label="Medium" size="small" color="warning" />
                    ) : (
                      <Chip label="Slow" size="small" color="error" />
                    )
                  }
                />
              </SectionCard>
            </Grid>
          )}

          {/* SSL Certificate */}
          {check.sslCertificate && (
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard
                title="SSL Certificate"
                icon={
                  <Security
                    color={check.sslCertificate.valid ? "success" : "error"}
                  />
                }
              >
                <InfoRow
                  label="Valid"
                  value={check.sslCertificate.valid ? "Yes" : "No"}
                />
                <InfoRow
                  label="Issuer"
                  value={check.sslCertificate.issuer || "N/A"}
                />
                <InfoRow
                  label="Subject"
                  value={check.sslCertificate.subject || "N/A"}
                />
                <InfoRow
                  label="Expires In"
                  value={`${check.sslCertificate.daysUntilExpiry} days`}
                />
                <InfoRow
                  label="Protocol"
                  value={check.sslCertificate.protocol}
                />
              </SectionCard>
            </Grid>
          )}

          {/* DNS Records */}
          {check.dnsRecords && (
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard title="DNS Records" icon={<Dns color="info" />}>
                <InfoRow
                  label="A Records"
                  value={check.dnsRecords.aRecords.length || 0}
                />
                <InfoRow
                  label="AAAA Records"
                  value={check.dnsRecords.aaaaRecords.length || 0}
                />
                <InfoRow
                  label="NS Records"
                  value={check.dnsRecords.nsRecords.length || 0}
                />
                <InfoRow
                  label="TXT Records"
                  value={check.dnsRecords.txtRecords.length || 0}
                />
              </SectionCard>
            </Grid>
          )}

          {/* MX Records */}
          {check.mxRecords && (
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard title="MX Records" icon={<Email color="info" />}>
                {check.mxRecords.records.length > 0 ? (
                  check.mxRecords.records.map((r, i) => (
                    <InfoRow
                      key={i}
                      label={`Priority ${r.priority}`}
                      value={r.exchange}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No MX records found
                  </Typography>
                )}
              </SectionCard>
            </Grid>
          )}

          {/* Page Info */}
          {check.pageInfo && (
            <Grid size={12}>
              <SectionCard
                title="Page Information"
                icon={<Info color="primary" />}
              >
                <InfoRow label="Title" value={check.pageInfo.title || "N/A"} />
                <InfoRow
                  label="Description"
                  value={check.pageInfo.description?.substring(0, 100) || "N/A"}
                />
                <InfoRow
                  label="Language"
                  value={check.pageInfo.language || "N/A"}
                />
                <InfoRow
                  label="Charset"
                  value={check.pageInfo.charset || "N/A"}
                />
                <InfoRow
                  label="Load Time"
                  value={`${check.pageInfo.loadTime}ms`}
                />
                {check.pageInfo.generator && (
                  <InfoRow label="Generator" value={check.pageInfo.generator} />
                )}
              </SectionCard>
            </Grid>
          )}

          {/* Screenshot */}
          {check.screenshot?.url && (
            <Grid size={12}>
              <SectionCard title="Screenshot" icon={<Image color="primary" />}>
                <Box
                  component="img"
                  src={check.screenshot.url}
                  alt="Screenshot"
                  sx={{ width: "100%", borderRadius: 1 }}
                />
              </SectionCard>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckDetailDialog;
