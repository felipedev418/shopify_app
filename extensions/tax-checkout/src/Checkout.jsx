import {
  reactExtension,
  Banner,
  BlockStack,
  Grid,
  TextField,
  Select,
  useApi,
  useTranslate,
  useCartLines,
  useApplyAttributeChange,
  useApplyCartLinesChange,
  Text,
  useShippingAddress,
  useStorage,
} from "@shopify/ui-extensions-react/checkout";
import { useState, useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import countries from "./countries";
import { europeanTaxRates } from "./europeanTaxRates";
import { validateVatNumber } from "./vatValidation";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    address: "",
    postalCode: "",
    city: "",
    phone: "",
    vatId: "",
    countryCode: "",
  });

  const [validationMessage, setValidationMessage] = useState("");
  const { extension, query, sessionToken, shop } = useApi();
  const applyAttributeChange = useApplyAttributeChange();
  const cartLines = useCartLines();
  const applyCartLinesChange = useApplyCartLinesChange();
  const [taxRate, setTaxRate] = useState(0);
  const shippingAddress = useShippingAddress();
  const customerCountry = shippingAddress?.countryCode;
  const storage = useStorage();
  const app = useAppBridge();
  const [vatError, setVatError] = useState("");
  const [isVatFieldEnabled, setIsVatFieldEnabled] = useState(false);

  // const getTaxRateForCountry = async (countryCode) => {
  //   const response = await query(`
  //     query GetTaxRate {
  //       metaobjects(type: "market_tax_rate", first: 100) {
  //         edges {
  //           node {
  //             id
  //             fields {
  //               key
  //               value
  //             }
  //           }
  //         }
  //       }
  //     }
  //   `);
  //   console.log(response, "response");
  //   const taxRates = response.data.metaobjects.edges.filter((edge) => {
  //     const fields = edge.node.fields;
  //     const countryCodeField = fields.filter(
  //       (field) => field.key === "country_code" && field.value === countryCode
  //     );
  //     return countryCodeField.length > 0;
  //   });

  //   if (taxRates.length > 0) {
  //     const taxRateField = taxRates[0].node.fields.filter(
  //       (field) => field.key === "tax_rate"
  //     )[0];
  //     return parseFloat(taxRateField.value);
  //   }

  //   return 0;
  // };

  const getTaxRateForCountry = (countryCode) => {
    if (europeanTaxRates[countryCode]) {
      return europeanTaxRates[countryCode].standardRate;
    }
    return 0; // Default tax rate if country not found
  };

  const handleCountryChange = async (value) => {
    if (!value) {
      setValidationMessage("Please select a country to proceed");
      return;
    }
    setFormData((prev) => ({ ...prev, countryCode: value }));

    // Enable VAT field only when country is selected
    setIsVatFieldEnabled(!!value);

    // Reset VAT field when country changes
    setFormData((prev) => ({ ...prev, vatId: "" }));
    setVatError("");
    setValidationMessage("Country selected successfully");

    const taxRate = (await getTaxRateForCountry(value)) || 0;
    setTaxRate(taxRate);

    console.log("Cart Lines:", cartLines);

    // Calculate new prices with tax and prepare cart line updates
    const updates = cartLines.map((line) => {
      const originalPrice = parseFloat(line.cost.totalAmount.amount);
      const priceWithTax = (originalPrice * (1 - taxRate / 100)).toFixed(2);

      return {
        type: "updateCartLine",
        id: line.id,
        attributes: [
          { key: "taxRate", value: taxRate.toString() },
          // { key: "priceWithTax", value: priceWithTax },
        ],
      };
    });

    // Apply the updates to cart lines
    for (const update of updates) {
      await applyCartLinesChange(update);
    }
  };

  const handleVatChange = async (value) => {
    setFormData((prev) => ({ ...prev, vatId: value }));

    if (value) {
      // Validate VAT ID format
      const isValidVat = validateVatNumber(value);

      if (!isValidVat) {
        setVatError("Invalid VAT ID format. Please check and try again.");
        setValidationMessage("Country selected successfully");
        return;
      }

      setVatError(""); // Clear error if valid
      setValidationMessage("VAT ID validated successfully");

      // Update all cart lines with the valid VAT ID
      const updates = cartLines.map((line) => ({
        type: "updateCartLine",
        id: line.id,
        attributes: [{ key: "vatId", value: value }],
      }));

      // Apply the updates to cart lines
      for (const update of updates) {
        await applyCartLinesChange(update);
      }
    } else {
      setValidationMessage(""); // Clear message when VAT field is empty
    }
  };

  return (
    <BlockStack spacing="loose">
      <Select
        label="Country (required)"
        value={formData.countryCode}
        onChange={handleCountryChange}
        options={Object.entries(countries).map(([code, name]) => ({
          label: name,
          value: code,
        }))}
        required
      />

      <TextField
        label="VAT-ID (optional)"
        value={formData.vatId}
        onChange={handleVatChange}
        error={vatError}
        disabled={!isVatFieldEnabled}
        helpText={
          !isVatFieldEnabled
            ? "Please select a country first"
            : "Enter VAT ID for business customers"
        }
      />

      {validationMessage && (
        <Banner
          status={
            validationMessage.includes("success") ? "success" : "critical"
          }
        >
          {validationMessage}
        </Banner>
      )}

      {vatError && <Banner status="critical">{vatError}</Banner>}
    </BlockStack>
  );
}
