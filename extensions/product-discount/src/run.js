// [START product-discount-start]
// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";
import { validateVatNumber } from "./vatValidation";

// Use JSDoc annotations for type safety
/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 * @typedef {import("../generated/api").Target} Target
 * @typedef {import("../generated/api").ProductVariant} ProductVariant
 */

// [START product-discount-start-js.empty-discount]
/**
 * @type {FunctionRunResult}
 */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};
// [END product-discount-start-js.empty-discount]
// [START product-discount-start.entrypoint]
/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  console.log(JSON.stringify(input.cart, null, 2), "test 28");

  const firstLine = input.cart.lines[0];
  const taxRate = firstLine?.taxRateAttribute?.value;
  const vatId = firstLine?.vatIdAttribute?.value;

  // Validate VAT ID if present
  if (vatId && validateVatNumber(vatId)) {
    // If VAT is valid, set tax rate to 0
    return {
      discounts: [
        {
          targets: input.cart.lines.map((line) => ({
            cartLine: { id: line.id },
          })),
          value: {
            percentage: {
              value: 0, // Zero tax for valid VAT ID
            },
          },
        },
      ],
      discountApplicationStrategy: DiscountApplicationStrategy.First,
    };
  }

  // [END product-discount-start.entrypoint]
  // [START product-discount-start.cart-targets]
  const targets = input.cart.lines
    // cart lines with selected country
    .map((line) => {
      return /** @type {Target} */ ({
        // Use the cart line ID to create a discount target
        cartLine: {
          id: line.id,
        },
      });
    });
  // [END product-discount-start.cart-targets]
  if (!targets.length) {
    // You can use STDERR for debug logs in your function
    console.error("No cart lines qualify for volume discount.");
    return EMPTY_DISCOUNT;
  }

  // [START product-discount-start.discount]
  return {
    discounts: [
      {
        // Apply the discount to the collected targets
        targets,
        // Define a percentage-based discount
        value: {
          percentage: {
            value: taxRate,
          },
        },
      },
    ],
    discountApplicationStrategy: DiscountApplicationStrategy.First,
  };
  // [END product-discount-start.discount]
}
// [END product-discount-start]
