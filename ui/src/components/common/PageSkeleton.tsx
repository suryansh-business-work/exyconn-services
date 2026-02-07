import { Skeleton, Box } from "@mui/material";
import Grid from "@mui/material/Grid2";

interface PageSkeletonProps {
  variant?: "table" | "cards" | "form" | "dashboard";
}

const TableSkeleton = () => (
  <Box>
    <Skeleton
      variant="rectangular"
      height={40}
      sx={{ mb: 2, borderRadius: 1 }}
    />
    {[...Array(5)].map((_, i) => (
      <Skeleton
        key={i}
        variant="rectangular"
        height={52}
        sx={{ mb: 1, borderRadius: 1 }}
      />
    ))}
  </Box>
);

const CardsSkeleton = () => (
  <Grid container spacing={2}>
    {[...Array(6)].map((_, i) => (
      <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
        <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 1 }} />
      </Grid>
    ))}
  </Grid>
);

const FormSkeleton = () => (
  <Box>
    {[...Array(4)].map((_, i) => (
      <Skeleton
        key={i}
        variant="rectangular"
        height={40}
        sx={{ mb: 2, borderRadius: 1 }}
      />
    ))}
    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mt: 3 }}>
      <Skeleton
        variant="rectangular"
        width={80}
        height={36}
        sx={{ borderRadius: 1 }}
      />
      <Skeleton
        variant="rectangular"
        width={80}
        height={36}
        sx={{ borderRadius: 1 }}
      />
    </Box>
  </Box>
);

const DashboardSkeleton = () => (
  <Box>
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {[...Array(4)].map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <Skeleton
            variant="rectangular"
            height={100}
            sx={{ borderRadius: 1 }}
          />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
      </Grid>
    </Grid>
  </Box>
);

const PageSkeleton = ({ variant = "table" }: PageSkeletonProps) => {
  switch (variant) {
    case "table":
      return <TableSkeleton />;
    case "cards":
      return <CardsSkeleton />;
    case "form":
      return <FormSkeleton />;
    case "dashboard":
      return <DashboardSkeleton />;
    default:
      return <TableSkeleton />;
  }
};

export default PageSkeleton;
