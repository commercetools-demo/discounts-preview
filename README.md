# Discounts Preview [Early version]

## Overview

Discounts Preview is a **commercetools Merchant Center Custom Application** that allows merchants to analyze and preview how discounts apply to shopping carts. This tool helps merchants understand:

- **Applied Discounts**: View all cart discounts and product discounts currently applied to a cart
- **Discount Analysis**: See which auto-triggered discounts are applicable, pending, or not applicable based on cart contents
- **Potential Discounts**: Identify discounts that could apply if cart conditions are met (e.g., "Add $20 more to qualify for 10% off")
- **Cart Breakdown**: Detailed view of line items, subtotals, discount amounts, and final totals

The application evaluates cart predicates in real-time, providing insights into qualification status for each discount rule configured in your commercetools project.

### Key Features

- Load any cart by customer and analyze its discount eligibility
- View all auto-triggered (non-code) cart discounts and their qualification status
- See available promotion codes that can be applied
- Detailed breakdown of cart-level and line-item-level discounts
- Category-based discount analysis

## Configuration

Configuration is managed via the `connect.yaml` file and environment variables.

### connect.yaml Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `CUSTOM_APPLICATION_ID` | The Custom Application ID provided when you register the app in Merchant Center | Yes | - |
| `CLOUD_IDENTIFIER` | The cloud region identifier (e.g., `gcp-us`, `gcp-eu`, `aws-fra`) that maps to the Merchant Center API URL | No | `gcp-us` |
| `ENTRY_POINT_URI_PATH` | The URI path for the application entry point | Yes | `discounts-preview` |

## How to Develop

### Prerequisites

- Node.js (v18 or higher recommended)
- Yarn package manager
- A commercetools project with API credentials
- The application registered in Merchant Center

### Local Development Setup

1. **Navigate to the custom application directory:**

   ```bash
   cd merchant-center-custom-application
   ```

1. **Install dependencies:**

   ```bash
   yarn install
   ```

1. **Create environment variables:**

   Create a `.env` file in the `merchant-center-custom-application` directory:

   ```env
   INITIAL_PROJECT_KEY=your-project-key
   CLOUD_IDENTIFIER=gcp-us
   ENTRY_POINT_URI_PATH=discounts-preview
   ```

1. **Start the development server:**

   ```bash
   yarn start
   ```

   The application will be available at `http://localhost:3001`


## References

- [Deploy in Connect](https://docs.commercetools.com/connect/overview#deployments)
- [Custom Applications Documentation](https://docs.commercetools.com/merchant-center-customizations/custom-applications)
- [Merchant Center Application Kit](https://docs.commercetools.com/custom-applications/)
- [Cart Discounts API](https://docs.commercetools.com/api/projects/cartDiscounts)
- [Discount Codes API](https://docs.commercetools.com/api/projects/discountCodes)
