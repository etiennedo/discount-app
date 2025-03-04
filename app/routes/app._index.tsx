import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../shopify.server";
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
import PromoIndexTable from "../components/PromoIndexTable";

const prisma = new PrismaClient();

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const promotions = await prisma.promotion.findMany({
    include: {
      store: true,
      discountCode: true,
    },
  });

  return Response.json({ promotions });
};

export default function Index() {
  const { promotions } = useLoaderData<typeof loader>();

  return (
    <Page
      title="Easy Promos"
      primaryAction={
        <Button url="/app/promotions/new" variant="primary">
          Create Promotion
        </Button>
      }
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
                    <Button>Generate discount</Button>
                  </InlineStack>
                </BlockStack>
              </Card>
              <Card padding="0">
                <PromoIndexTable promotions={promotions} />
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}