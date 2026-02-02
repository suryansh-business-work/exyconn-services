import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
}

const PageBreadcrumb = ({ items }: PageBreadcrumbProps) => {
  return (
    <Box
      sx={{
        mb: 2,
        pb: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Breadcrumbs separator={<NavigateNext fontSize="small" sx={{ fontSize: 14 }} />}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return isLast ? (
            <Typography key={index} color="text.primary" sx={{ fontSize: 13 }}>
              {item.label}
            </Typography>
          ) : item.href ? (
            <Link
              key={index}
              component={RouterLink}
              to={item.href}
              underline="hover"
              color="inherit"
              sx={{ fontSize: 13 }}
            >
              {item.label}
            </Link>
          ) : (
            <Typography key={index} color="text.secondary" sx={{ fontSize: 13 }}>
              {item.label}
            </Typography>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default PageBreadcrumb;
