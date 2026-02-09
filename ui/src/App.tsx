import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import { VersionFooter } from "./components/VersionFooter";
import { OrgProvider, useOrg } from "./context/OrgContext";
import OrganizationsPage from "./pages/Organizations";
import DashboardPage from "./pages/Dashboard";
import NotFoundPage from "./pages/NotFound";
import WelcomePage from "./pages/Welcome";
import {
  EmailSettings,
  EmailTemplates,
  EmailDemo,
  EmailHistory,
  EmailApiDocs,
  EmailDashboard,
} from "./pages/Email";
import {
  ImageKitSettings,
  ImageKitDemo,
  ImageKitHistory,
  ImageKitUsage,
  ImageKitApiDocs,
} from "./pages/ImageKit";
import {
  SiteStatusMonitors,
  SiteStatusHistory,
  SiteStatusDashboard,
  SiteStatusApiDocs,
} from "./pages/SiteStatus";
import {
  EnvKeysDashboard,
  EnvKeysAppsPage,
  EnvKeysVariablesPage,
  EnvKeysApiDocs,
} from "./pages/EnvKeys";
import {
  AIDashboard,
  AICompaniesPage,
  AIChatPage,
  AIHistoryPage,
  AIApiDocs,
} from "./pages/AI";
import { SearchLogs, TestLogs, LogSettings, LogsApiDocs } from "./pages/Logs";
import {
  FeatureFlagDemo,
  FeatureFlagList,
  FeatureFlagApiDocs,
} from "./pages/FeatureFlags";
import {
  CronJobDemo,
  CronJobHistoryPage,
  CronJobApiDocs,
} from "./pages/CronJobs";

// Wrapper component to sync URL org and apiKey with context
const OrgRouteWrapper = ({ children }: { children: React.ReactNode }) => {
  const { orgId, apiKey } = useParams<{ orgId: string; apiKey?: string }>();
  const {
    organizations,
    selectedOrg,
    selectedApiKey,
    selectOrganization,
    selectApiKey,
    isLoading,
  } = useOrg();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && orgId && organizations.length > 0) {
      const org = organizations.find((o) => o.id === orgId);
      if (org) {
        // Sync org if different
        if (!selectedOrg || selectedOrg.id !== org.id) {
          selectOrganization(org);
        }
        // Sync API key if provided in URL and different
        if (apiKey && org.orgApiKeys?.length) {
          const key = org.orgApiKeys.find((k) => k.apiKey === apiKey);
          if (
            key &&
            (!selectedApiKey || selectedApiKey.apiKey !== key.apiKey)
          ) {
            selectApiKey(key);
          }
        }
      } else {
        // Invalid org ID, redirect to dashboard
        navigate("/dashboard", { replace: true });
      }
    }
  }, [
    orgId,
    apiKey,
    organizations,
    selectedOrg,
    selectedApiKey,
    selectOrganization,
    selectApiKey,
    isLoading,
    navigate,
  ]);

  return <>{children}</>;
};

// Component that uses router hooks inside BrowserRouter
const AppRoutes = () => {
  const { organizations, isLoading, refreshOrganizations } = useOrg();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleCreateOrganization = () => {
    navigate("/manage-organization");
  };

  const handleOrgCreated = async () => {
    await refreshOrganizations();
  };

  // Show welcome page if no organizations and on dashboard
  if (
    !isLoading &&
    organizations.length === 0 &&
    location.pathname === "/dashboard"
  ) {
    return (
      <Layout currentPath={location.pathname} onNavigate={handleNavigate}>
        <WelcomePage onCreateOrganization={handleCreateOrganization} />
      </Layout>
    );
  }

  return (
    <Layout currentPath={location.pathname} onNavigate={handleNavigate}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/:serviceSlug" element={<DashboardPage />} />
        <Route
          path="/welcome"
          element={
            <WelcomePage onCreateOrganization={handleCreateOrganization} />
          }
        />
        <Route
          path="/manage-organization"
          element={<OrganizationsPage onOrgCreated={handleOrgCreated} />}
        />

        {/* Organization routes without API key (legacy support) */}
        <Route
          path="/organization/:orgId"
          element={
            <OrgRouteWrapper>
              <DashboardPage />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/dashboard"
          element={
            <OrgRouteWrapper>
              <DashboardPage />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/dashboard/:serviceSlug"
          element={
            <OrgRouteWrapper>
              <DashboardPage />
            </OrgRouteWrapper>
          }
        />

        {/* Organization routes with API key */}
        <Route
          path="/organization/:orgId/apikey/:apiKey"
          element={
            <OrgRouteWrapper>
              <DashboardPage />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/dashboard"
          element={
            <OrgRouteWrapper>
              <DashboardPage />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/dashboard/:serviceSlug"
          element={
            <OrgRouteWrapper>
              <DashboardPage />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/communications/email/settings"
          element={
            <OrgRouteWrapper>
              <EmailSettings />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/communications/email/dashboard"
          element={
            <OrgRouteWrapper>
              <EmailDashboard />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/communications/email/templates"
          element={
            <OrgRouteWrapper>
              <EmailTemplates />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/communications/email/demo"
          element={
            <OrgRouteWrapper>
              <EmailDemo />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/communications/email/history"
          element={
            <OrgRouteWrapper>
              <EmailHistory />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/communications/email/api-docs"
          element={
            <OrgRouteWrapper>
              <EmailApiDocs />
            </OrgRouteWrapper>
          }
        />

        {/* Legacy routes without API key */}
        <Route
          path="/organization/:orgId/communications/email/dashboard"
          element={
            <OrgRouteWrapper>
              <EmailDashboard />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/communications/email/settings"
          element={
            <OrgRouteWrapper>
              <EmailSettings />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/communications/email/templates"
          element={
            <OrgRouteWrapper>
              <EmailTemplates />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/communications/email/demo"
          element={
            <OrgRouteWrapper>
              <EmailDemo />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/communications/email/history"
          element={
            <OrgRouteWrapper>
              <EmailHistory />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/communications/email/api-docs"
          element={
            <OrgRouteWrapper>
              <EmailApiDocs />
            </OrgRouteWrapper>
          }
        />

        {/* API Logs routes with API key */}
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/logs/search"
          element={
            <OrgRouteWrapper>
              <SearchLogs />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/logs/test"
          element={
            <OrgRouteWrapper>
              <TestLogs />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/logs/settings"
          element={
            <OrgRouteWrapper>
              <LogSettings />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/logs/api-docs"
          element={
            <OrgRouteWrapper>
              <LogsApiDocs />
            </OrgRouteWrapper>
          }
        />

        {/* API Logs legacy routes without API key */}
        <Route
          path="/organization/:orgId/service/logs/search"
          element={
            <OrgRouteWrapper>
              <SearchLogs />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/logs/test"
          element={
            <OrgRouteWrapper>
              <TestLogs />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/logs/settings"
          element={
            <OrgRouteWrapper>
              <LogSettings />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/logs/api-docs"
          element={
            <OrgRouteWrapper>
              <LogsApiDocs />
            </OrgRouteWrapper>
          }
        />

        {/* Feature Flags routes with API key */}
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/feature-flags/demo"
          element={
            <OrgRouteWrapper>
              <FeatureFlagDemo />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/feature-flags/list"
          element={
            <OrgRouteWrapper>
              <FeatureFlagList />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/feature-flags/api-docs"
          element={
            <OrgRouteWrapper>
              <FeatureFlagApiDocs />
            </OrgRouteWrapper>
          }
        />

        {/* Feature Flags legacy routes without API key */}
        <Route
          path="/organization/:orgId/service/feature-flags/demo"
          element={
            <OrgRouteWrapper>
              <FeatureFlagDemo />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/feature-flags/list"
          element={
            <OrgRouteWrapper>
              <FeatureFlagList />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/feature-flags/api-docs"
          element={
            <OrgRouteWrapper>
              <FeatureFlagApiDocs />
            </OrgRouteWrapper>
          }
        />

        {/* ImageKit routes with API key */}
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/file-upload/imagekit/demo"
          element={
            <OrgRouteWrapper>
              <ImageKitDemo />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/file-upload/imagekit/settings"
          element={
            <OrgRouteWrapper>
              <ImageKitSettings />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/file-upload/imagekit/history"
          element={
            <OrgRouteWrapper>
              <ImageKitHistory />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/file-upload/imagekit/usage"
          element={
            <OrgRouteWrapper>
              <ImageKitUsage />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/file-upload/imagekit/api-docs"
          element={
            <OrgRouteWrapper>
              <ImageKitApiDocs />
            </OrgRouteWrapper>
          }
        />

        {/* ImageKit legacy routes without API key */}
        <Route
          path="/organization/:orgId/service/file-upload/imagekit/demo"
          element={
            <OrgRouteWrapper>
              <ImageKitDemo />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/file-upload/imagekit/settings"
          element={
            <OrgRouteWrapper>
              <ImageKitSettings />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/file-upload/imagekit/history"
          element={
            <OrgRouteWrapper>
              <ImageKitHistory />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/file-upload/imagekit/usage"
          element={
            <OrgRouteWrapper>
              <ImageKitUsage />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/file-upload/imagekit/api-docs"
          element={
            <OrgRouteWrapper>
              <ImageKitApiDocs />
            </OrgRouteWrapper>
          }
        />

        {/* Site Status routes with API key */}
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/site-status/dashboard"
          element={
            <OrgRouteWrapper>
              <SiteStatusDashboard />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/site-status/monitors"
          element={
            <OrgRouteWrapper>
              <SiteStatusMonitors />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/site-status/history"
          element={
            <OrgRouteWrapper>
              <SiteStatusHistory />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/site-status/api-docs"
          element={
            <OrgRouteWrapper>
              <SiteStatusApiDocs />
            </OrgRouteWrapper>
          }
        />

        {/* Site Status legacy routes without API key */}
        <Route
          path="/organization/:orgId/service/site-status/dashboard"
          element={
            <OrgRouteWrapper>
              <SiteStatusDashboard />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/site-status/monitors"
          element={
            <OrgRouteWrapper>
              <SiteStatusMonitors />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/site-status/history"
          element={
            <OrgRouteWrapper>
              <SiteStatusHistory />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/site-status/api-docs"
          element={
            <OrgRouteWrapper>
              <SiteStatusApiDocs />
            </OrgRouteWrapper>
          }
        />

        {/* Environment Keys routes with API key */}
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/env-keys/dashboard"
          element={
            <OrgRouteWrapper>
              <EnvKeysDashboard />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/env-keys/applications"
          element={
            <OrgRouteWrapper>
              <EnvKeysAppsPage />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/env-keys/applications/:appId/variables"
          element={
            <OrgRouteWrapper>
              <EnvKeysVariablesPage />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/env-keys/api-docs"
          element={
            <OrgRouteWrapper>
              <EnvKeysApiDocs />
            </OrgRouteWrapper>
          }
        />

        {/* Environment Keys legacy routes without API key */}
        <Route
          path="/organization/:orgId/service/env-keys/dashboard"
          element={
            <OrgRouteWrapper>
              <EnvKeysDashboard />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/env-keys/applications"
          element={
            <OrgRouteWrapper>
              <EnvKeysAppsPage />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/env-keys/applications/:appId/variables"
          element={
            <OrgRouteWrapper>
              <EnvKeysVariablesPage />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/env-keys/api-docs"
          element={
            <OrgRouteWrapper>
              <EnvKeysApiDocs />
            </OrgRouteWrapper>
          }
        />

        {/* AI routes with API key */}
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/ai/dashboard"
          element={
            <OrgRouteWrapper>
              <AIDashboard />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/ai/companies"
          element={
            <OrgRouteWrapper>
              <AICompaniesPage />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/ai/chat"
          element={
            <OrgRouteWrapper>
              <AIChatPage />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/ai/history"
          element={
            <OrgRouteWrapper>
              <AIHistoryPage />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/ai/api-docs"
          element={
            <OrgRouteWrapper>
              <AIApiDocs />
            </OrgRouteWrapper>
          }
        />

        {/* AI legacy routes without API key */}
        <Route
          path="/organization/:orgId/service/ai/dashboard"
          element={
            <OrgRouteWrapper>
              <AIDashboard />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/ai/companies"
          element={
            <OrgRouteWrapper>
              <AICompaniesPage />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/ai/chat"
          element={
            <OrgRouteWrapper>
              <AIChatPage />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/ai/history"
          element={
            <OrgRouteWrapper>
              <AIHistoryPage />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/ai/api-docs"
          element={
            <OrgRouteWrapper>
              <AIApiDocs />
            </OrgRouteWrapper>
          }
        />

        {/* Cron Jobs routes with API key */}
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/cron-jobs/demo"
          element={
            <OrgRouteWrapper>
              <CronJobDemo />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/cron-jobs/history"
          element={
            <OrgRouteWrapper>
              <CronJobHistoryPage />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/apikey/:apiKey/service/cron-jobs/api-docs"
          element={
            <OrgRouteWrapper>
              <CronJobApiDocs />
            </OrgRouteWrapper>
          }
        />

        {/* Cron Jobs legacy routes without API key */}
        <Route
          path="/organization/:orgId/service/cron-jobs/demo"
          element={
            <OrgRouteWrapper>
              <CronJobDemo />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/cron-jobs/history"
          element={
            <OrgRouteWrapper>
              <CronJobHistoryPage />
            </OrgRouteWrapper>
          }
        />
        <Route
          path="/organization/:orgId/service/cron-jobs/api-docs"
          element={
            <OrgRouteWrapper>
              <CronJobApiDocs />
            </OrgRouteWrapper>
          }
        />

        <Route
          path="*"
          element={
            <NotFoundPage onNavigateHome={() => handleNavigate("/dashboard")} />
          }
        />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <OrgProvider>
          <AppRoutes />
          <VersionFooter />
        </OrgProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
