import { useState, useCallback } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { PageBreadcrumb } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { Locale } from "../../types/translationsTheme";
import LocaleManager from "./LocaleManager";
import TranslationSpreadsheet from "./TranslationSpreadsheet";

const TranslationsLocalesPage = () => {
  const { selectedOrg } = useOrg();
  const [tab, setTab] = useState(0);
  const [locales, setLocales] = useState<Locale[]>([]);

  const handleLocalesChange = useCallback((newLocales: Locale[]) => {
    setLocales(newLocales);
  }, []);

  const breadcrumbs = [
    { label: "Home", href: "/dashboard" },
    { label: selectedOrg?.orgName || "Organization" },
    { label: "Translations" },
    { label: "Locales" },
  ];

  return (
    <Box>
      <PageBreadcrumb items={breadcrumbs} />
      <Typography variant="h5" sx={{ mb: 2 }}>
        Translations — Locales
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Locale Settings" />
          <Tab label="Translation Grid" />
        </Tabs>
      </Box>
      {tab === 0 && <LocaleManager onLocalesChange={handleLocalesChange} />}
      {tab === 1 && <TranslationSpreadsheet locales={locales} />}
    </Box>
  );
};

export default TranslationsLocalesPage;
