import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  Link,
  InlineStack,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { PrismaClient } from '@prisma/client';
import { useLoaderData, useNavigate } from "@remix-run/react";
import { DataTable } from "@shopify/polaris";

const prisma = new PrismaClient()

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const {admin} = await authenticate.admin(request);

  const shopResponse = await admin.graphql(
    `#graphql
    query {
      shop {
        id
      }
    }`
  );
  const shopData = await shopResponse.json();
  const shopInfo = shopData.data.shop;

  // Find the store in your database using shopifyId
  const store = await prisma.store.findUnique({
    where: { shopifyId: shopInfo.id },
  });

  if (!store) {
    throw new Error("Store not found");
  }

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || "1");
  const pageSize = 10;

  // Query the discount codes for this store
  const discountCodes = await prisma.discountCode.findMany({
    where: {
      storeId: store.id,
    },
    orderBy: { createdAt: 'desc' },
    take: pageSize,
    skip: (page - 1) * pageSize,
    select: {
      shopifyId: true,
      code: true,
      createdAt: true,
    },
  });

  const totalCodes = await prisma.discountCode.count({
    where: { storeId: store.id },
  });

  return Response.json({ discountCodes, page, totalCodes, pageSize });
};
export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

const uniqueCode = `DISCOUNT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const discountResponse = await admin.graphql(
  `#graphql
  mutation CreateDiscountCode($basicCodeDiscount: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
      codeDiscountNode {
        id
        codeDiscount {
          ... on DiscountCodeBasic {
            title
            startsAt
            endsAt
            customerSelection {
              ... on DiscountCustomers {
                customers {
                  id
                }
              }
            }
            customerGets {
              value {
                ... on DiscountPercentage {
                  percentage
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }`,
  {
    variables: {
      "basicCodeDiscount": {
        "title": "10% off selected items",
        "code": uniqueCode,
        "startsAt": "2025-01-01T00:00:00Z",
        "endsAt": "2025-12-31T23:59:59Z",
        "customerSelection": {
          "all": true
        },
        "customerGets": {
          "value": {
            "percentage": 0.1
          },
          "items": {
            "all": true
          }
        },
        "minimumRequirement": {
          "subtotal": {
            "greaterThanOrEqualToSubtotal": "50.0"
          }
        },
        "usageLimit": 100,
        "appliesOncePerCustomer": true
      }
    },
  },
);

const data = await discountResponse.json();
const discountId = data.data.discountCodeBasicCreate.codeDiscountNode.id.replace(
  "gid://shopify/DiscountCodeNode/",
  "",
);

const shopResponse = await admin.graphql(
  `#graphql
  query {
  shop {
    name
    email
    myshopifyDomain
    url
    id
    name
    }
  }`
  );

  const shopData = await shopResponse.json();
  const shopInfo = shopData.data.shop;

  console.log(shopInfo);

  const store = await prisma.store.upsert({
    where: {
      shopifyId: shopInfo.id,
    },
    update: {
      name: shopInfo.name,
      email: shopInfo.email,
      domain: shopInfo.myshopifyDomain,
      url: shopInfo.url,
    },
    create: {
      shopifyId: shopInfo.id,
      name: shopInfo.name,
      email: shopInfo.email,
      domain: shopInfo.myshopifyDomain,
      url: shopInfo.url,
    },
  });

  // Save to Prisma database
  await prisma.discountCode.create({
    data: {
      shopifyId: discountId,
      code: uniqueCode,
      store: {
        connect: {
          id: store.id,
        },
      },
    },
  });


  return {
    discountCode: data,
  };
};

export default function Index() {
  const fetcher = useFetcher<typeof action>();
  const { discountCodes: initialCodes, page, totalCodes, pageSize } = useLoaderData<typeof loader>();

  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const discountCode = fetcher.data?.discountCode;
  const discountId = discountCode?.data.discountCodeBasicCreate.codeDiscountNode.id.replace(
    "gid://shopify/DiscountCodeNode/",
    "",
  );

  useEffect(() => {
    if (discountCode) {
      shopify.toast.show("Discount created successfully");
    }
  }, [discountCode, shopify]);
  const generateDiscount = () => fetcher.submit({}, { method: "POST" });

  return (
    <Page
    title="Easy Promos"
    primaryAction={<Button 
      url="/app/promotions/new"
      variant="primary">Create Promotion</Button>}
    >
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
              <BlockStack gap="500">
                <Card>
                  <BlockStack gap="500">
                    <BlockStack gap="200">
                      <Text as="h2" variant="headingMd">
                        Bravo Étienne 🎉
                      </Text>
                      <Text variant="bodyMd" as="p">
                        View your current created discount codes.
                      </Text>
                    </BlockStack>
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingMd">
                        Get started with products
                      </Text>
                      <Text as="p" variant="bodyMd">
                        Generate a product with GraphQL and get the JSON output for
                        that product. Learn more about the{" "}
                        <Link
                          url="https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate"
                          target="_blank"
                          removeUnderline
                        >
                          productCreate
                        </Link>{" "}
                        mutation in our API references.
                      </Text>
                    </BlockStack>
                    <InlineStack gap="300">
                      <Button loading={isLoading} onClick={generateDiscount}>
                        Generate discount
                      </Button>
                      {fetcher.data?.discountCode && (
                        <Button
                          url={`shopify:admin/discounts/${discountId}`}
                          target="_blank"
                          variant="plain"
                        >
                          View product
                        </Button>
                      )}
                    </InlineStack>
                    {fetcher.data?.discountCode.data && (
                      <>
                        <Text as="h3" variant="headingMd">
                          {" "}
                          discountCodeBasicCreate mutation
                        </Text>
                        <Box
                          padding="400"
                          background="bg-surface-active"
                          borderWidth="025"
                          borderRadius="200"
                          borderColor="border"
                          overflowX="scroll"
                        >
                          <pre style={{ margin: 0 }}>
                            <code>
                              {JSON.stringify(fetcher.data.discountCode.data, null, 2)}
                            </code>
                          </pre>
                        </Box>
                      </>
                    )}
                  </BlockStack>
                </Card>
              </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
