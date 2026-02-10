/**
 * Global Application Data Configuration
 * This file serves as the single source of truth for all application/service definitions.
 * Used by: Sidebar, All Apps page, and Route generation
 */

// ==================== Types ====================

export type AppStatus = "live" | "dev" | "soon";

export interface AppSubItem {
  label: string;
  pathSuffix: string; // Path suffix after the app's base path
  isDisabled?: boolean;
}

export interface AppDefinition {
  id: string;
  name: string;
  description: string;
  iconName: string; // Icon name (will be mapped to MUI icons)
  basePath: string; // Base path suffix (after /organization/:orgId/)
  status: AppStatus;
  category: string;
  subItems: AppSubItem[];
  isGroup?: boolean;
  children?: AppDefinition[];
  keywords?: string[]; // For search functionality
}

// ==================== App Categories ====================

export const APP_CATEGORIES = {
  GLOBAL: "Global",
  COMMUNICATION: "Communications",
  DEVELOPER_TOOLS: "Developer Tools",
  STORAGE: "Storage & Files",
  MONITORING: "Monitoring & Analytics",
  CONTENT: "Content & Media",
  INFRASTRUCTURE: "Infrastructure",
  DEV: "Dev",
} as const;

// ==================== Application Definitions ====================

export const APP_DATA: AppDefinition[] = [
  // Global Apps
  {
    id: "dashboard",
    name: "Dashboard",
    description:
      "Overview of API analytics, usage statistics, and system health metrics.",
    iconName: "Dashboard",
    basePath: "/dashboard",
    status: "dev",
    category: APP_CATEGORIES.GLOBAL,
    subItems: [],
    keywords: ["analytics", "overview", "stats", "metrics"],
  },

  // Communications Group
  {
    id: "communications",
    name: "Communications",
    description:
      "Multi-channel communication services including email, SMS, phone, and real-time messaging.",
    iconName: "Business",
    basePath: "",
    status: "dev",
    category: APP_CATEGORIES.COMMUNICATION,
    subItems: [],
    isGroup: true,
    keywords: ["messaging", "notification", "contact"],
    children: [
      {
        id: "email",
        name: "Email",
        description:
          "Send transactional and marketing emails with template support and delivery tracking.",
        iconName: "Email",
        basePath: "communications/email",
        status: "live",
        category: APP_CATEGORIES.COMMUNICATION,
        subItems: [
          { label: "Dashboard", pathSuffix: "/dashboard" },
          { label: "Demo", pathSuffix: "/demo" },
          { label: "Templates", pathSuffix: "/templates" },
          { label: "Settings", pathSuffix: "/settings" },
          { label: "History", pathSuffix: "/history" },
          { label: "API Docs", pathSuffix: "/api-docs" },
        ],
        keywords: ["smtp", "mail", "template", "notification"],
      },
      {
        id: "phone",
        name: "Phone",
        description:
          "Voice calling capabilities with call tracking and recording features.",
        iconName: "Phone",
        basePath: "service/communication/phone",
        status: "soon",
        category: APP_CATEGORIES.COMMUNICATION,
        subItems: [
          { label: "Demo", pathSuffix: "" },
          { label: "Settings", pathSuffix: "/settings" },
        ],
        keywords: ["call", "voice", "telephony"],
      },
      {
        id: "sms",
        name: "SMS",
        description:
          "Send and receive SMS messages with delivery reports and templates.",
        iconName: "Sms",
        basePath: "service/communication/sms",
        status: "soon",
        category: APP_CATEGORIES.COMMUNICATION,
        subItems: [
          { label: "Demo", pathSuffix: "" },
          { label: "Settings", pathSuffix: "/settings" },
        ],
        keywords: ["text", "message", "mobile"],
      },
      {
        id: "chat",
        name: "Chat",
        description:
          "Real-time chat and instant messaging for web and mobile applications.",
        iconName: "Chat",
        basePath: "service/communication/chat",
        status: "soon",
        category: APP_CATEGORIES.COMMUNICATION,
        subItems: [
          { label: "Demo", pathSuffix: "" },
          { label: "Settings", pathSuffix: "/settings" },
        ],
        keywords: ["instant", "messaging", "realtime"],
      },
      {
        id: "web-video",
        name: "Web Video",
        description:
          "Video conferencing and streaming capabilities for web applications.",
        iconName: "Videocam",
        basePath: "service/communication/web-video",
        status: "soon",
        category: APP_CATEGORIES.COMMUNICATION,
        subItems: [
          { label: "Demo", pathSuffix: "" },
          { label: "Settings", pathSuffix: "/settings" },
        ],
        keywords: ["conference", "streaming", "webrtc"],
      },
      {
        id: "web-audio",
        name: "Web Audio",
        description:
          "Audio streaming and voice communication for web applications.",
        iconName: "Mic",
        basePath: "service/communication/web-audio",
        status: "soon",
        category: APP_CATEGORIES.COMMUNICATION,
        subItems: [
          { label: "Demo", pathSuffix: "" },
          { label: "Settings", pathSuffix: "/settings" },
        ],
        keywords: ["voice", "audio", "webrtc"],
      },
      {
        id: "notifications",
        name: "Notifications",
        description: "Push notifications and in-app notification management.",
        iconName: "Notifications",
        basePath: "service/communication/notifications",
        status: "soon",
        category: APP_CATEGORIES.COMMUNICATION,
        subItems: [
          { label: "Demo", pathSuffix: "" },
          { label: "Templates", pathSuffix: "/templates" },
          { label: "Settings", pathSuffix: "/settings" },
        ],
        keywords: ["push", "alert", "notification", "fcm"],
      },
    ],
  },

  // Developer Tools
  {
    id: "logs",
    name: "Logs",
    description:
      "Centralized logging service for application debugging and monitoring.",
    iconName: "Article",
    basePath: "service/logs",
    status: "live",
    category: APP_CATEGORIES.DEVELOPER_TOOLS,
    subItems: [
      { label: "Search Logs", pathSuffix: "/search" },
      { label: "Test Logs", pathSuffix: "/test" },
      { label: "Settings", pathSuffix: "/settings" },
      { label: "API Docs", pathSuffix: "/api-docs" },
    ],
    keywords: ["debug", "trace", "error", "monitoring"],
  },
  {
    id: "ai",
    name: "AI",
    description:
      "AI-powered services with OpenAI, Gemini, Anthropic integration and chat interface.",
    iconName: "SmartToy",
    basePath: "service/ai",
    status: "live",
    category: APP_CATEGORIES.DEVELOPER_TOOLS,
    subItems: [
      { label: "Dashboard", pathSuffix: "/dashboard" },
      { label: "Companies", pathSuffix: "/companies" },
      { label: "Chat", pathSuffix: "/chat" },
      { label: "History", pathSuffix: "/history" },
      { label: "API Docs", pathSuffix: "/api-docs" },
    ],
    keywords: [
      "artificial intelligence",
      "gpt",
      "llm",
      "prompt",
      "chatbot",
      "openai",
      "gemini",
      "anthropic",
    ],
  },
  {
    id: "config-service",
    name: "Config Service",
    description:
      "Configuration management including environment keys and feature flags.",
    iconName: "Settings",
    basePath: "",
    status: "live",
    category: APP_CATEGORIES.DEVELOPER_TOOLS,
    subItems: [],
    isGroup: true,
    keywords: ["config", "settings", "environment", "flags", "variables"],
    children: [
      {
        id: "environment-keys",
        name: "Environment Keys",
        description:
          "Secure storage and management of environment variables and secrets.",
        iconName: "Key",
        basePath: "service/env-keys",
        status: "live",
        category: APP_CATEGORIES.DEVELOPER_TOOLS,
        subItems: [
          { label: "Dashboard", pathSuffix: "/dashboard" },
          { label: "Applications", pathSuffix: "/applications" },
          { label: "API Docs", pathSuffix: "/api-docs" },
        ],
        keywords: ["secrets", "config", "variables", "env", "keys"],
      },
      {
        id: "feature-flags",
        name: "Feature Flags",
        description:
          "Control feature rollouts with toggles, percentage rollouts, and targeting rules.",
        iconName: "Flag",
        basePath: "service/feature-flags",
        status: "live",
        category: APP_CATEGORIES.DEVELOPER_TOOLS,
        subItems: [
          { label: "Demo", pathSuffix: "/demo" },
          { label: "Flags", pathSuffix: "/list" },
          { label: "API Docs", pathSuffix: "/api-docs" },
        ],
        keywords: [
          "feature toggle",
          "rollout",
          "ab testing",
          "flags",
          "release",
        ],
      },
    ],
  },

  // Storage & Files
  {
    id: "file-upload",
    name: "File Upload",
    description: "File upload and storage services with CDN support.",
    iconName: "CloudUpload",
    basePath: "",
    status: "soon",
    category: APP_CATEGORIES.STORAGE,
    subItems: [],
    isGroup: true,
    keywords: ["upload", "storage", "cdn", "files"],
    children: [
      {
        id: "imagekit",
        name: "ImageKit",
        description:
          "Image optimization, transformation, and CDN delivery service.",
        iconName: "CloudUpload",
        basePath: "service/file-upload/imagekit",
        status: "live",
        category: APP_CATEGORIES.STORAGE,
        subItems: [
          { label: "Demo", pathSuffix: "/demo" },
          { label: "Settings", pathSuffix: "/settings" },
          { label: "History", pathSuffix: "/history" },
          { label: "Usage", pathSuffix: "/usage" },
          { label: "API Docs", pathSuffix: "/api-docs" },
        ],
        keywords: [
          "image",
          "cdn",
          "optimization",
          "transform",
          "upload",
          "file",
        ],
      },
    ],
  },

  // Monitoring & Analytics
  {
    id: "site-status",
    name: "Site Status",
    description: "Monitor website uptime and performance with alerts.",
    iconName: "MonitorHeart",
    basePath: "service/site-status",
    status: "live",
    category: APP_CATEGORIES.MONITORING,
    subItems: [
      { label: "Dashboard", pathSuffix: "/dashboard" },
      { label: "Monitors", pathSuffix: "/monitors" },
      { label: "History", pathSuffix: "/history" },
      { label: "API Docs", pathSuffix: "/api-docs" },
    ],
    keywords: [
      "uptime",
      "health",
      "monitoring",
      "ping",
      "ssl",
      "dns",
      "screenshot",
    ],
  },

  // Content & Media
  {
    id: "translations",
    name: "Translations",
    description:
      "Internationalization and localization management for multi-language support.",
    iconName: "Translate",
    basePath: "service/translations",
    status: "dev",
    category: APP_CATEGORIES.CONTENT,
    subItems: [
      { label: "Locales", pathSuffix: "/locales" },
      { label: "Translation Text", pathSuffix: "/sections" },
    ],
    keywords: ["i18n", "localization", "language", "l10n"],
  },
  {
    id: "themes",
    name: "Themes",
    description: "Theme management and component styling for consistent UI/UX.",
    iconName: "Palette",
    basePath: "service/themes",
    status: "dev",
    category: APP_CATEGORIES.CONTENT,
    subItems: [
      { label: "Theme List", pathSuffix: "/list" },
      { label: "Theme Components", pathSuffix: "/components" },
    ],
    keywords: ["styling", "design", "ui", "components"],
  },

  // Infrastructure
  {
    id: "deployments",
    name: "Deployments",
    description: "Deploy and manage applications across multiple environments.",
    iconName: "RocketLaunch",
    basePath: "service/deployments",
    status: "soon",
    category: APP_CATEGORIES.INFRASTRUCTURE,
    subItems: [
      { label: "Demo", pathSuffix: "" },
      { label: "Settings", pathSuffix: "/settings" },
    ],
    keywords: ["deploy", "release", "ci/cd", "hosting"],
  },
  {
    id: "queue",
    name: "Queue",
    description: "Message queue and background job processing service.",
    iconName: "Queue",
    basePath: "service/queue",
    status: "soon",
    category: APP_CATEGORIES.INFRASTRUCTURE,
    subItems: [
      { label: "Demo", pathSuffix: "" },
      { label: "Settings", pathSuffix: "/settings" },
    ],
    keywords: ["jobs", "background", "worker", "async"],
  },
  {
    id: "dynamic-crud",
    name: "Dynamic Crud",
    description: "Auto-generate CRUD operations for database models.",
    iconName: "TableChart",
    basePath: "service/dynamic-crud",
    status: "soon",
    category: APP_CATEGORIES.INFRASTRUCTURE,
    subItems: [
      { label: "Demo", pathSuffix: "" },
      { label: "Settings", pathSuffix: "/settings" },
    ],
    keywords: ["database", "api", "rest", "auto"],
  },
  {
    id: "events",
    name: "Events",
    description:
      "Event-driven architecture with webhook support for real-time actions.",
    iconName: "Event",
    basePath: "service/events",
    status: "soon",
    category: APP_CATEGORIES.INFRASTRUCTURE,
    subItems: [
      { label: "Demo", pathSuffix: "/demo" },
      { label: "Events", pathSuffix: "" },
      { label: "Subscriptions", pathSuffix: "/subscriptions" },
    ],
    keywords: ["pubsub", "webhook", "trigger", "realtime"],
  },
  {
    id: "in-memory-database",
    name: "In-memory Database",
    description: "Redis-like in-memory data store for caching and sessions.",
    iconName: "Dns",
    basePath: "service/communication/in-memory-database",
    status: "soon",
    category: APP_CATEGORIES.INFRASTRUCTURE,
    subItems: [
      { label: "Demo", pathSuffix: "/demo" },
      { label: "Settings", pathSuffix: "/settings" },
    ],
    keywords: ["redis", "cache", "session", "memory"],
  },
  {
    id: "repo-monitoring",
    name: "Repo Monitoring",
    description: "GitHub repository monitoring for commits, PRs, and issues.",
    iconName: "GitHub",
    basePath: "service/repo-monitoring",
    status: "soon",
    category: APP_CATEGORIES.MONITORING,
    subItems: [{ label: "Repo List", pathSuffix: "/list" }],
    keywords: ["github", "git", "version control", "repository"],
  },
  {
    id: "cron-jobs",
    name: "Cron Jobs",
    description:
      "Schedule recurring tasks with webhook support for real-time actions.",
    iconName: "Schedule",
    basePath: "service/cron-jobs",
    status: "live",
    category: APP_CATEGORIES.INFRASTRUCTURE,
    subItems: [
      { label: "Demo", pathSuffix: "/demo" },
      { label: "History", pathSuffix: "/history" },
      { label: "API Docs", pathSuffix: "/api-docs" },
    ],
    keywords: [
      "scheduler",
      "task",
      "recurring",
      "automation",
      "job",
      "webhook",
    ],
  },
  {
    id: "global-search",
    name: "Global Search",
    description: "Unified search across all services and resources.",
    iconName: "Search",
    basePath: "service/global-search",
    status: "soon",
    category: APP_CATEGORIES.DEVELOPER_TOOLS,
    subItems: [
      { label: "Search", pathSuffix: "" },
      { label: "Settings", pathSuffix: "/settings" },
    ],
    keywords: ["search", "find", "query", "elastic"],
  },
  {
    id: "timezone-settings",
    name: "Timezone",
    description:
      "Configure timezone preferences with multi-timezone select and time conversion.",
    iconName: "AccessTime",
    basePath: "service/timezone",
    status: "soon",
    category: APP_CATEGORIES.GLOBAL,
    subItems: [
      { label: "Demo", pathSuffix: "/demo" },
      { label: "Settings", pathSuffix: "" },
    ],
    keywords: ["timezone", "time", "locale", "region", "convert", "date-fns"],
  },
  {
    id: "click-tracking",
    name: "Click Tracking",
    description:
      'Track user clicks with custom addresses like "login.button.click".',
    iconName: "AdsClick",
    basePath: "service/click-tracking",
    status: "soon",
    category: APP_CATEGORIES.MONITORING,
    subItems: [
      { label: "Demo", pathSuffix: "/demo" },
      { label: "Trackers", pathSuffix: "" },
      { label: "Statistics", pathSuffix: "/stats" },
    ],
    keywords: [
      "analytics",
      "tracking",
      "click",
      "heatmap",
      "user behavior",
      "meta",
    ],
  },

  // Dev Tools
  {
    id: "system-info",
    name: "System Info",
    description:
      "Server runtime information, OS details, Docker, Nginx, SSL, and terminal access.",
    iconName: "Terminal",
    basePath: "dev/system-info",
    status: "dev",
    category: APP_CATEGORIES.DEV,
    subItems: [
      { label: "System", pathSuffix: "/system" },
      { label: "Docker", pathSuffix: "/docker" },
    ],
    keywords: ["server", "docker", "nginx", "ssl", "terminal", "os", "runtime"],
  },
  {
    id: "dynamic-form",
    name: "Dynamic Form",
    description:
      "Generate dynamic forms from schema definitions with validation.",
    iconName: "DynamicForm",
    basePath: "dev/dynamic-form",
    status: "soon",
    category: APP_CATEGORIES.DEV,
    subItems: [{ label: "Builder", pathSuffix: "" }],
    keywords: ["form", "builder", "schema", "validation", "dynamic"],
  },
  {
    id: "add-api-to-mcp",
    name: "Add API to MCP",
    description:
      "Register and manage APIs in the Model Context Protocol server.",
    iconName: "Api",
    basePath: "dev/add-api-to-mcp",
    status: "soon",
    category: APP_CATEGORIES.DEV,
    subItems: [{ label: "Register", pathSuffix: "" }],
    keywords: ["mcp", "api", "model context protocol", "integration"],
  },
];

// ==================== Helper Functions ====================

/**
 * Get all apps flattened (including children)
 */
export function getAllAppsFlat(): AppDefinition[] {
  const result: AppDefinition[] = [];

  const flatten = (apps: AppDefinition[]) => {
    for (const app of apps) {
      result.push(app);
      if (app.children) {
        flatten(app.children);
      }
    }
  };

  flatten(APP_DATA);
  return result;
}

/**
 * Get apps by category
 */
export function getAppsByCategory(): Record<string, AppDefinition[]> {
  const result: Record<string, AppDefinition[]> = {};
  const allApps = getAllAppsFlat();

  for (const app of allApps) {
    (result[app.category] ??= []).push(app);
  }

  return result;
}

/**
 * Get apps by status
 */
export function getAppsByStatus(status: AppStatus): AppDefinition[] {
  return getAllAppsFlat().filter((app) => app.status === status);
}

/**
 * Search apps by query
 */
export function searchApps(query: string): AppDefinition[] {
  if (!query.trim()) return getAllAppsFlat();

  const lowerQuery = query.toLowerCase();
  return getAllAppsFlat().filter((app) => {
    const nameMatch = app.name.toLowerCase().includes(lowerQuery);
    const descMatch = app.description.toLowerCase().includes(lowerQuery);
    const keywordMatch = app.keywords?.some((k) =>
      k.toLowerCase().includes(lowerQuery),
    );
    const categoryMatch = app.category.toLowerCase().includes(lowerQuery);

    return nameMatch || descMatch || keywordMatch || categoryMatch;
  });
}

/**
 * Get full path for an app
 */
export function getAppFullPath(
  orgId: string,
  app: AppDefinition,
  subItemPathSuffix?: string,
): string {
  const basePath = `/organization/${orgId}/${app.basePath}`;
  return subItemPathSuffix ? `${basePath}${subItemPathSuffix}` : basePath;
}

/**
 * Get status badge color
 */
export function getStatusColor(
  status: AppStatus,
): "success" | "warning" | "default" {
  switch (status) {
    case "live":
      return "success";
    case "dev":
      return "warning";
    case "soon":
      return "default";
  }
}

/**
 * Get status label
 */
export function getStatusLabel(status: AppStatus): string {
  switch (status) {
    case "live":
      return "Live";
    case "dev":
      return "Development";
    case "soon":
      return "Coming Soon";
  }
}
