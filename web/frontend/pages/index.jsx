import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Text,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";
import { useEffect, useState } from "react";

import { trophyImage } from "../assets";

import { ProductsCard } from "../components";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { GraphQLClient } from "graphql-request";

const COUNTRY_CODE_QUERY = `
  query {
    app {
      storage {
        key(key: "countryCode") {
          value
        }
      }
    }
  }
`;

export default function HomePage() {
  const app = useAppBridge();
  const [taxRate, setTaxRate] = useState(0);

  // Function to fetch and cache tax rate
  const fetchAndCacheTaxRate = async (countryCode) => {
    try {
      const response = await fetch(`/api/checkout/tax-rates/${countryCode}`);
      const data = await response.json();

      if (data.taxRate) {
        // Cache the tax rate
        localStorage.setItem("currentTaxRate", data.taxRate);
        setTaxRate(data.taxRate);
      }
    } catch (error) {
      console.error("Error fetching tax rate:", error);
    }
  };

  // Check for selected country and fetch tax rate
  useEffect(() => {
    const checkAndFetchTaxRate = async () => {
      // const selectedCountryCode = localStorage.getItem("selectedCountryCode");
      const selectedCountryCode = sessionStorage.getItem("countryCode");
      console.log(selectedCountryCode, "selectedCountryCode");

      if (selectedCountryCode) {
        await fetchAndCacheTaxRate(selectedCountryCode);
      }
    };

    // Initial check
    checkAndFetchTaxRate();

    // Set up interval to check periodically
    const interval = setInterval(checkAndFetchTaxRate, 5000);

    return () => clearInterval(interval);
  }, []);

  const { t } = useTranslation();
  return (
    <Page narrowWidth>
      <TitleBar title={t("HomePage.title")} />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack
              wrap={false}
              spacing="extraTight"
              distribution="trailing"
              alignment="center"
            >
              <Stack.Item fill>
                <TextContainer spacing="loose">
                  <Text as="h2" variant="headingMd">
                    {t("HomePage.heading")}
                  </Text>
                  <p>
                    <Trans
                      i18nKey="HomePage.yourAppIsReadyToExplore"
                      components={{
                        PolarisLink: (
                          <Link url="https://polaris.shopify.com/" external />
                        ),
                        AdminApiLink: (
                          <Link
                            url="https://shopify.dev/api/admin-graphql"
                            external
                          />
                        ),
                        AppBridgeLink: (
                          <Link
                            url="https://shopify.dev/apps/tools/app-bridge"
                            external
                          />
                        ),
                      }}
                    />
                  </p>
                  <p>{t("HomePage.startPopulatingYourApp")}</p>
                  <p>
                    <Trans
                      i18nKey="HomePage.learnMore"
                      components={{
                        ShopifyTutorialLink: (
                          <Link
                            url="https://shopify.dev/apps/getting-started/add-functionality"
                            external
                          />
                        ),
                      }}
                    />
                  </p>
                </TextContainer>
              </Stack.Item>
              <Stack.Item>
                <div style={{ padding: "0 20px" }}>
                  <Image
                    source={trophyImage}
                    alt={t("HomePage.trophyAltText")}
                    width={120}
                  />
                </div>
                <div>
                  {taxRate && (
                    <div>Current Tax Rate for Selected Country: {taxRate}%</div>
                  )}
                </div>
              </Stack.Item>
            </Stack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <ProductsCard />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
