import { Box, Typography } from "@mui/material";
import { PageBreadcrumb, ApiDocsViewer } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { EndpointDefinition } from "../../components/common/ApiDocsViewer/types";
import { API_BASE } from "../../api/config";

const ImageKitApiDocs = () => {
  const { selectedOrg, selectedApiKey } = useOrg();

  const apiKey = selectedApiKey?.apiKey || "YOUR_API_KEY";
  const orgId = selectedOrg?.id || "YOUR_ORG_ID";
  const baseUrl = API_BASE;

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">No organization selected</Typography>
      </Box>
    );
  }

  const endpoints: EndpointDefinition[] = [
    {
      method: "POST",
      path: `/organizations/${orgId}/imagekit/upload/single`,
      description:
        "Upload a single file to ImageKit. Use multipart/form-data with file field.",
      body: `FormData:
- file: <binary file data>
- configId: "config_123"
- folder: "/uploads" (optional)
- fileName: "custom-name.jpg" (optional)
- useUniqueFileName: true (optional)
- tags: "tag1,tag2" (optional)`,
      response: `{
  "success": true,
  "file": {
    "fileId": "file_abc123",
    "name": "image.jpg",
    "url": "https://ik.imagekit.io/your-id/image.jpg",
    "thumbnailUrl": "https://ik.imagekit.io/.../tr:w-100/image.jpg",
    "size": 102400,
    "fileType": "image",
    "width": 1920,
    "height": 1080,
    "filePath": "/uploads/image.jpg"
  }
}`,
    },
    {
      method: "POST",
      path: `/organizations/${orgId}/imagekit/upload/multiple`,
      description:
        "Upload multiple files at once. Returns array of upload results.",
      body: `FormData:
- files: <binary file data> (multiple)
- configId: "config_123"
- folder: "/uploads" (optional)
- useUniqueFileName: true (optional)`,
      response: `{
  "success": true,
  "files": [
    {
      "fileId": "file_abc123",
      "name": "image1.jpg",
      "url": "https://ik.imagekit.io/your-id/image1.jpg",
      "size": 102400,
      "fileType": "image"
    },
    {
      "fileId": "file_abc124",
      "name": "image2.jpg",
      "url": "https://ik.imagekit.io/your-id/image2.jpg",
      "size": 204800,
      "fileType": "image"
    }
  ],
  "errors": []
}`,
    },
    {
      method: "GET",
      path: `/organizations/${orgId}/imagekit/config`,
      description: "List all ImageKit configurations for the organization.",
      body: null,
      response: `{
  "data": [
    {
      "id": "config_123",
      "name": "Production CDN",
      "publicKey": "public_xxx",
      "urlEndpoint": "https://ik.imagekit.io/your-id",
      "isActive": true,
      "createdAt": "2024-01-10T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}`,
    },
    {
      method: "GET",
      path: `/organizations/${orgId}/imagekit/history`,
      description:
        "Get upload history with filtering, sorting, and pagination.",
      body: null,
      response: `{
  "data": [
    {
      "id": "history_123",
      "fileId": "file_abc123",
      "fileName": "image.jpg",
      "originalName": "photo.jpg",
      "url": "https://ik.imagekit.io/your-id/image.jpg",
      "thumbnailUrl": "https://ik.imagekit.io/.../tr:w-100/image.jpg",
      "size": 102400,
      "fileType": "image",
      "mimeType": "image/jpeg",
      "width": 1920,
      "height": 1080,
      "uploadedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}`,
    },
    {
      method: "GET",
      path: `/organizations/${orgId}/imagekit/history/stats`,
      description:
        "Get upload statistics including total files, storage used, and file type breakdown.",
      body: null,
      response: `{
  "totalFiles": 1250,
  "totalSize": 524288000,
  "byFileType": {
    "image": 1000,
    "video": 150,
    "document": 100
  },
  "byMonth": [
    { "month": "2024-01", "count": 450, "size": 209715200 },
    { "month": "2024-02", "count": 800, "size": 314572800 }
  ]
}`,
    },
    {
      method: "DELETE",
      path: `/organizations/${orgId}/imagekit/history/:fileId`,
      description: "Delete a file from ImageKit and remove from history.",
      body: null,
      response: `{
  "success": true,
  "message": "File deleted successfully"
}`,
    },
  ];

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: "Home", href: "/" },
          {
            label: selectedOrg.orgName,
            href: `/organization/${selectedOrg.id}`,
          },
          { label: "File Upload" },
          { label: "ImageKit" },
          { label: "API Docs" },
        ]}
      />

      <ApiDocsViewer
        title="ImageKit API Documentation"
        subtitle="Upload, manage, and optimize files with ImageKit CDN integration"
        baseUrl={baseUrl}
        apiKey={apiKey}
        orgId={orgId}
        endpoints={endpoints}
        tabLabels={[
          "Upload Single",
          "Upload Multiple",
          "Configs",
          "History",
          "Stats",
          "Delete",
        ]}
      />
    </Box>
  );
};

export default ImageKitApiDocs;
