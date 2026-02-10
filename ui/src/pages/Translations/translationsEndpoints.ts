import { EndpointDefinition } from "../../components/common/ApiDocsViewer/types";

export const getTranslationsEndpoints = (
  orgId: string
): EndpointDefinition[] => [
  {
    method: "GET",
    path: `/api/organizations/${orgId}/translations-theme/projects`,
    description:
      "List all translation projects for the organization with pagination support.",
    body: null,
    response: `{
  "data": [
    {
      "id": "proj_1",
      "name": "Web App",
      "description": "Main web application translations",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}`,
  },
  {
    method: "POST",
    path: `/api/organizations/${orgId}/translations-theme/projects`,
    description: "Create a new translation project.",
    body: `{
  "name": "Mobile App",
  "description": "Mobile application translations"
}`,
    response: `{
  "id": "proj_2",
  "name": "Mobile App",
  "description": "Mobile application translations",
  "createdAt": "2024-01-15T10:00:00.000Z"
}`,
  },
  {
    method: "PUT",
    path: `/api/organizations/${orgId}/translations-theme/projects/{projectId}`,
    description: "Update an existing translation project by ID.",
    body: `{
  "name": "Updated Project Name",
  "description": "Updated description"
}`,
    response: `{
  "id": "proj_1",
  "name": "Updated Project Name",
  "description": "Updated description",
  "updatedAt": "2024-01-16T10:00:00.000Z"
}`,
  },
  {
    method: "DELETE",
    path: `/api/organizations/${orgId}/translations-theme/projects/{projectId}`,
    description:
      "Delete a translation project and all its locales and translations.",
    body: null,
    response: `{
  "success": true,
  "message": "Project deleted successfully"
}`,
  },
  {
    method: "GET",
    path: `/api/organizations/${orgId}/translations-theme/projects/{projectId}/locales`,
    description: "List all locales for a specific translation project.",
    body: null,
    response: `{
  "data": [
    { "id": "loc_1", "code": "en", "name": "English", "isDefault": true },
    { "id": "loc_2", "code": "fr", "name": "French", "isDefault": false }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 2, "totalPages": 1 }
}`,
  },
  {
    method: "POST",
    path: `/api/organizations/${orgId}/translations-theme/projects/{projectId}/locales`,
    description: "Create a new locale for a translation project.",
    body: `{
  "code": "de",
  "name": "German"
}`,
    response: `{
  "id": "loc_3",
  "code": "de",
  "name": "German",
  "isDefault": false,
  "createdAt": "2024-01-15T10:00:00.000Z"
}`,
  },
  {
    method: "POST",
    path: `/api/organizations/${orgId}/translations-theme/projects/{projectId}/locales/bulk`,
    description: "Bulk create multiple locales for a translation project.",
    body: `{
  "locales": [
    { "code": "es", "name": "Spanish" },
    { "code": "it", "name": "Italian" }
  ]
}`,
    response: `{
  "created": 2,
  "locales": [
    { "id": "loc_4", "code": "es", "name": "Spanish" },
    { "id": "loc_5", "code": "it", "name": "Italian" }
  ]
}`,
  },
  {
    method: "GET",
    path: `/api/organizations/${orgId}/translations-theme/projects/{projectId}/translations`,
    description:
      "List all translations for a project, optionally filtered by locale.",
    body: null,
    response: `{
  "data": [
    {
      "id": "tr_1",
      "key": "welcome.title",
      "locale": "en",
      "value": "Welcome",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}`,
  },
  {
    method: "POST",
    path: `/api/organizations/${orgId}/translations-theme/projects/{projectId}/translations`,
    description:
      "Create or update a single translation key-value pair for a locale.",
    body: `{
  "key": "welcome.title",
  "locale": "en",
  "value": "Welcome to our app"
}`,
    response: `{
  "id": "tr_1",
  "key": "welcome.title",
  "locale": "en",
  "value": "Welcome to our app",
  "updatedAt": "2024-01-16T10:00:00.000Z"
}`,
  },
  {
    method: "POST",
    path: `/api/organizations/${orgId}/translations-theme/projects/{projectId}/translations/bulk`,
    description: "Bulk upsert multiple translation key-value pairs at once.",
    body: `{
  "translations": [
    { "key": "welcome.title", "locale": "en", "value": "Welcome" },
    { "key": "welcome.title", "locale": "fr", "value": "Bienvenue" }
  ]
}`,
    response: `{
  "created": 1,
  "updated": 1,
  "total": 2
}`,
  },
];
