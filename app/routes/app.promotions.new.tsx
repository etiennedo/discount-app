import { Page, Badge, Card, Layout, TextField, BlockStack } from '@shopify/polaris';
import { useState, useCallback } from 'react';
import { Form } from '@remix-run/react';
import DatePicker from '../components/DateRangePicker';

function handleSubmit() {
  alert('Form submitted');
}

export default function newPromotion() {
  const [name, setName] = useState('');
  const handleTextFieldChange = useCallback(
    (value: string) => setName(value),
    [],
  );

  return (
    <Page
      backAction={{url: '/app'}}
      title="New promotion"
      titleMetadata={<Badge tone="attention" progress="incomplete">Scheduled</Badge>}
      subtitle="Fill in the form below to create a new promotion"
      compactTitle
      primaryAction={{
        content: 'Save',
        onAction: handleSubmit }}
      secondaryActions={[
        {
          content: 'Duplicate',
          accessibilityLabel: 'Secondary action label',
          onAction: () => alert('Duplicate action'),
        }
      ]}
      pagination={{
        hasPrevious: true,
        hasNext: true,
      }}
    >
      <Form method="post">
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
            <Card>
              <TextField
                label="Promotion name"
                value={name}
                onChange={handleTextFieldChange}
                placeholder="Super awesome sale!"
                autoComplete="off"
              />
            </Card>
              <Card>
                <BlockStack gap="200">
                  <p>Set the date range for your promotion.</p>
                  <DatePicker />
                </BlockStack>
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