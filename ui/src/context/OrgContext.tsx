import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { organizationApi } from "../api/organizationApi";
import { Organization, ApiKey } from "../types/organization";

const STORAGE_KEY_ORG = "selected_organization";
const STORAGE_KEY_API_KEY = "selected_api_key";

interface OrgContextType {
  organizations: Organization[];
  selectedOrg: Organization | null;
  selectedApiKey: ApiKey | null;
  isLoading: boolean;
  error: string | null;
  selectOrganization: (org: Organization | null) => void;
  selectApiKey: (key: ApiKey | null) => void;
  refreshOrganizations: () => Promise<void>;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

interface OrgProviderProps {
  children: ReactNode;
}

// Helper to safely parse JSON from localStorage
const getStoredValue = <T,>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

export const OrgProvider = ({ children }: OrgProviderProps) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const fetchOrganizations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await organizationApi.list({ limit: 100 });
      setOrganizations(response.data);

      // Only set from localStorage on initial load
      if (!initialized) {
        const storedOrgId = getStoredValue<string>(STORAGE_KEY_ORG);
        const storedApiKeyId = getStoredValue<string>(STORAGE_KEY_API_KEY);

        if (storedOrgId && response.data.length > 0) {
          const org = response.data.find((o) => o.id === storedOrgId);
          if (org) {
            setSelectedOrg(org);
            // Restore API key
            if (storedApiKeyId && org.orgApiKeys?.length) {
              const apiKey = org.orgApiKeys.find(
                (k) => k.apiKey === storedApiKeyId,
              );
              setSelectedApiKey(apiKey || org.orgApiKeys[0]);
            } else if (org.orgApiKeys?.length) {
              setSelectedApiKey(org.orgApiKeys[0]);
            }
          } else if (response.data.length > 0) {
            // Stored org not found, select first
            setSelectedOrg(response.data[0]);
            if (response.data[0].orgApiKeys?.length) {
              setSelectedApiKey(response.data[0].orgApiKeys[0]);
            }
          }
        } else if (response.data.length > 0) {
          // No stored org, select first
          setSelectedOrg(response.data[0]);
          if (response.data[0].orgApiKeys?.length) {
            setSelectedApiKey(response.data[0].orgApiKeys[0]);
          }
        }
        setInitialized(true);
      }
    } catch (err) {
      setError("Failed to load organizations");
      console.error("Failed to fetch organizations:", err);
    } finally {
      setIsLoading(false);
    }
  }, [initialized]);

  useEffect(() => {
    fetchOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist selected org to localStorage
  useEffect(() => {
    if (selectedOrg) {
      localStorage.setItem(STORAGE_KEY_ORG, JSON.stringify(selectedOrg.id));
    } else {
      localStorage.removeItem(STORAGE_KEY_ORG);
    }
  }, [selectedOrg]);

  // Persist selected API key to localStorage
  useEffect(() => {
    if (selectedApiKey) {
      localStorage.setItem(
        STORAGE_KEY_API_KEY,
        JSON.stringify(selectedApiKey.apiKey),
      );
    } else {
      localStorage.removeItem(STORAGE_KEY_API_KEY);
    }
  }, [selectedApiKey]);

  const selectOrganization = useCallback((org: Organization | null) => {
    setSelectedOrg(org);
    // Auto-select first API key when org changes
    if (org?.orgApiKeys?.length) {
      setSelectedApiKey(org.orgApiKeys[0]);
    } else {
      setSelectedApiKey(null);
    }
  }, []);

  const selectApiKey = useCallback((key: ApiKey | null) => {
    setSelectedApiKey(key);
  }, []);

  return (
    <OrgContext.Provider
      value={{
        organizations,
        selectedOrg,
        selectedApiKey,
        isLoading,
        error,
        selectOrganization,
        selectApiKey,
        refreshOrganizations: fetchOrganizations,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useOrg = (): OrgContextType => {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error("useOrg must be used within an OrgProvider");
  }
  return context;
};
