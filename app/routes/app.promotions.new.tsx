import { Page, Badge, Card, Layout, TextField, BlockStack, Button } from '@shopify/polaris';
import { useState, useCallback } from 'react';
import { Form, useActionData } from "@remix-run/react";
import DatePicker from '../components/DateRangePicker';
import { redirect, ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from "../shopify.server";

type SelectedVariant = {
  id: string;
};

type SelectedProduct = {
  id: string;
  variants: SelectedVariant[];
};

export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);

  const shopResponse = await admin.graphql(`
    {
      shop {
        id
      }
    }
  `);

  const {
    data: { shop },
  } = await shopResponse.json();

  const store = await prisma.store.findUnique({
    where: { shopifyId: shop.id },
  });

  if (!store) {
    return Response.json({ error: "Store not found." }, { status: 404 });
  }

  const formData = await request.formData();
  const name = formData.get("name");
  const startDate = formData.get("startDate");
  const endDate = formData.get("endDate");
  const selectedProductsRaw = formData.get("selectedProducts");

  if ( !name || !startDate || !endDate || !selectedProductsRaw ) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  try {
    await prisma.promotion.create({
      data: {
        name: String(name),
        startDate: new Date(startDate.toString()),
        endDate: new Date(endDate.toString()),
        storeId: store.id,
      },
    });

    return redirect("/app");
  } catch (error) {
    console.error("Failed to create promotion:", error);
    return Response.json({ error: "Failed to create promotion." }, { status: 500 });
  }
}

export default function NewPromotion() {
  const today = new Date();
  const [startDate, setStartDate] = useState<Date>(today);
  const [endDate, setEndDate] = useState<Date>(today);
  const [name, setName] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  const actionData = useActionData<typeof action>();

  const handleTextFieldChange = useCallback((value: string) => {
    setName(value);
  }, []);

  const handleDateChange = useCallback(
    ({ since, until }: { since: Date; until: Date }) => {
      setStartDate(since);
      setEndDate(until);
    },
    []
  );

  const openResourcePicker = async () => {
    const selected = await shopify.resourcePicker({
      type: 'product',
      multiple: true,
      selectionIds: selectedProducts.map((product) => ({
        id: product.id,
        variants: product.variants.map((variant) => ({
          id: variant.id,
        })),
      })),
    });
    if (selected) {
      const products = (selected as SelectedProduct[]).map((resource) => ({
        id: resource.id,
        variants: resource.variants.map((variant) => ({
          id: variant.id,
        })),
      }));
      setSelectedProducts(products);
      console.log(products);
    } else {
      setSelectedProducts([]);
      console.log('No products selected');
    }
  };

  return (
    <Page
      backAction={{ url: '/app' }}
      title="New promotion"
      titleMetadata={<Badge tone="attention" progress="incomplete">Scheduled</Badge>}
      subtitle="Fill in the form below to create a new promotion"
      compactTitle
      pagination={{ hasPrevious: true, hasNext: true }}
    >
      <Form method="post" data-save-bar id="promotion-form">
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              {actionData?.error && (
                <Card>
                  <p style={{ color: "red" }}>{actionData.error}</p>
                </Card>
              )}
              <Card>
                <TextField
                  label="Promotion name"
                  name="name"
                  value={name}
                  onChange={handleTextFieldChange}
                  placeholder="Super awesome sale!"
                  autoComplete="off"
                />
              </Card>
              <Card>
                <BlockStack gap="200">
                  <p>Set the date range for your promotion.</p>
                  <DatePicker onDateChange={handleDateChange} />
                  <input
                    type="hidden"
                    name="startDate"
                    value={startDate.toISOString()}
                  />
                  <input
                    type="hidden"
                    name="endDate"
                    value={endDate.toISOString()}
                  />
                </BlockStack>
              </Card>
              <Card>
                <Button onClick={openResourcePicker}>Sélectionner des produits</Button>
                <input
                  type="hidden"
                  name="selectedProducts"
                  value={JSON.stringify(
                    selectedProducts.map((product) => ({
                      id: product.id,
                      variants: product.variants.map((variant) => ({
                        id: variant.id,
                      })),
                    }))
                  )}
                />
              </Card>
            </BlockStack>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Card>
              <p>Add tags to your order.</p>
            </Card>
          </Layout.Section>
        </Layout>
      </Form>
    </Page>
  );
}