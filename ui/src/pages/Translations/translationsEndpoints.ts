import { EndpointDefinition } from "../../components/common/ApiDocsViewer/types";

export const getTranslationsEndpoints = (
  orgId: string
): EndpointDefinition[] => [
  {
    method: "GET",
    path: `/api/organizations/${orgId}/translations/projects`,
    description:
      "List all translation projects for the organization with pagination support.",
    body: null,
    response: `{
  "data": [
    {
      "_id": "proj_1",
      "name": "Web App",
      "description": "Main web application translations",
      "sections": ["common", "homepage"],
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}`,
  },
  {
    method: "POST",
    path: `/api/organizations/${orgId}/translations/projects`,
    description: "Create a new translation project.",
    body: `{
  "name": "Mobile App",
  "description": "Mobile application translations"
}`,
    response: `{
  "_id": "proj_2",
  "name": "Mobile App",
  "description": "Mobile application translations",
  "sections": [],
  "createdAt": "2024-01-15T10:00:00.000Z"
}`,
  },
  {
    method: "PUT",
    path: `/api/organizations/${orgId}/translations/projects/{projectId}`,
    description: "Update an existing translation project by ID.",
    body: `{
  "name": "Updated Project Name",
  "description": "Updated description"
}`,
    response: `{
  "_id": "proj_1",
  "name": "Updated Project Name",
  "description": "Updated description",
  "sections": ["common"],
  "updatedAt": "2024-01-16T10:00:00.000Z"
}`,
  },
  {
    method: "DELETE",
    path: `/api/organizations/${orgId}/translations/projects/{projectId}`,
    description:
      "Delete a translation project and all its locales and translations.",
    body: null,
    response: `{
  "success": true
}`,
  },
  {
    method: "GET",
    path: `/api/organizations/${orgId}/translations/projects/locale-counts`,
    description:
      "Get locale counts for multiple projects. Pass projectIds as comma-separated query param.",
    body: null,
    response: `{
  "counts": {
    "proj_1": 5,
    "proj_2": 3
  }
}`,
  },
  {
    method: "POST",
    path: `/api/organizations/${orgId}/translations/projects/{projectId}/sections`,
    description:
      "Add a section to a project. Sections organize translation keys. Access pattern: locale.<code>.<section>.<key>",
    body: `{
  "name": "homepage"
}`,
    response: `{
  "success": true,
  "sections": ["common", "homepage"]
}`,
  },
  {
    method: "DELETE",
    path: `/api/organizations/${orgId}/translations/projects/{projectId}/sections/{sectionName}`,
    description: "Remove a section from a project.",
    body: null,
    response: `{
  "success": true,
  "sections": ["common"]
}`,
  },
  {
    method: "GET",
    path: `/api/organizations/${orgId}/translations/projects/{projectId}/locales`,
    description: "List all locales for a specific translation project.",
    body: null,
    response: `{
  "data": [
    {
      "_id": "loc_1",
      "code": "en_US",
      "name": "English",
      "nativeName": "English",
      "flag": "🇺🇸",
      "isDefault": true,
      "isActive": true
    }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 1, "totalPages": 1 }
}`,
  },
  {
    method: "POST",
    path: `/api/organizations/${orgId}/translations/projects/{projectId}/locales`,
    description: "Create a new locale for a translation project.",
    body: `{
  "code": "de_DE",
  "name": "German",
  "nativeName": "Deutsch",
  "flag": "🇩🇪",
  "isDefault": false
}`,
    response: `{
  "_id": "loc_3",
  "code": "de_DE",
  "name": "German",
  "nativeName": "Deutsch",
  "flag": "🇩🇪",
  "isDefault": false,
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00.000Z"
}`,
  },
  {
    method: "POST",
    path: `/api/organizations/${orgId}/translations/projects/{projectId}/locales/bulk`,
    description: "Bulk create multiple locales for a translation project.",
    body: `{
  "locales": [
    { "code": "es_ES", "name": "Spanish", "nativeName": "Español", "flag": "🇪🇸" },
    { "code": "it_IT", "name": "Italian", "nativeName": "Italiano", "flag": "🇮🇹" }
  ]
}`,
    response: `{
  "created": 2,
  "data": [
    { "_id": "loc_4", "code": "es_ES", "name": "Spanish", "nativeName": "Español", "flag": "🇪🇸" },
    { "_id": "loc_5", "code": "it_IT", "name": "Italian", "nativeName": "Italiano", "flag": "🇮🇹" }
  ]
}`,
  },
  {
    method: "GET",
    path: `/api/organizations/${orgId}/translations/projects/{projectId}/translations`,
    description:
      "List all translation entries for a project. Filter by section or search by key. Access pattern: locale.<localeCode>.<section>.<key>",
    body: null,
    response: `{
  "data": [
    {
      "_id": "tr_1",
      "section": "homepage",
      "key": "welcome_title",
      "values": { "en_US": "Welcome", "de_DE": "Willkommen" },
      "description": "Main welcome heading",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 1, "totalPages": 1 }
}`,
  },
  {
    method: "POST",
    path: `/api/organizations/${orgId}/translations/projects/{projectId}/translations`,
    description:
      "Create or update a translation entry. Access: locale.<localeCode>.<section>.<key>",
    body: `{
  "section": "homepage",
  "key": "welcome_title",
  "values": { "en_US": "Welcome to our app", "de_DE": "Willkommen bei unserer App" },
  "description": "Main welcome heading"
}`,
    response: `{
  "_id": "tr_1",
  "section": "homepage",
  "key": "welcome_title",
  "values": { "en_US": "Welcome to our app", "de_DE": "Willkommen bei unserer App" },
  "updatedAt": "2024-01-16T10:00:00.000Z"
}`,
  },
  {
    method: "POST",
    path: `/api/organizations/${orgId}/translations/projects/{projectId}/translations/bulk`,
    description:
      "Bulk upsert multiple translation entries in a section. Access: locale.<localeCode>.<section>.<key>",
    body: `{
  "section": "homepage",
  "entries": [
    { "key": "welcome_title", "values": { "en_US": "Welcome" } },
    { "key": "welcome_subtitle", "values": { "en_US": "Get started" } }
  ]
}`,
    response: `{
  "upserted": 1,
  "modified": 1
}`,
  },
];
