export type CodeLanguage = "curl" | "javascript" | "python" | "php" | "go";

export interface EndpointDefinition {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  body: string | null;
  response: string;
}

export interface ApiDocsViewerProps {
  title: string;
  subtitle: string;
  baseUrl: string;
  apiKey: string;
  orgId: string;
  endpoints: EndpointDefinition[];
  tabLabels: string[];
}

export interface CodeViewerProps {
  code: string;
  language: string;
  height?: string | number;
}

export interface EndpointCardProps {
  endpoint: EndpointDefinition;
  baseUrl: string;
  codeLanguage: CodeLanguage;
  generateCodeExample: (endpoint: EndpointDefinition) => string;
}
