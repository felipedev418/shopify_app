import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import createApp from "@shopify/app-bridge";

import { QueryProvider, PolarisProvider } from "./components";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  const { t } = useTranslation();

  // Initialize App Bridge
  const app = createApp({
    apiKey: "447614fa2bf9006c4efc08ce914b7696", // Replace with your API key
    host: new URLSearchParams(window.location.search).get("host"), // Fetch host from the URL
  });

  return (
    <PolarisProvider>
      <BrowserRouter>
        <QueryProvider>
          <NavMenu app={app}>
            <a href="/" rel="home" />
            <a href="/tax-settings">Tax settings</a>
            <a href="/tax-rates">Tax Rates</a>
            <a href="/vat-settings">Vat Settings</a>
          </NavMenu>
          <Routes pages={pages} />
        </QueryProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
