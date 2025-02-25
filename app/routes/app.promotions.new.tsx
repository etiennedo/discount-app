import {Page, Badge, Card, Layout} from '@shopify/polaris';

export default function newPromotion() {
  return (
    <Page
      backAction={{url: '/app'}}
      title="New promotion"
      titleMetadata={<Badge tone="attention" progress="incomplete">Scheduled</Badge>}
      subtitle="Fill in the form below to create a new promotion"
      compactTitle
      primaryAction={{content: 'Save', disabled: true}}
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
        <Layout>
        <Layout.Section>
          <Card>
            <p>
              Use to follow a normal section with a secondary section to create
              a 2/3 + 1/3 layout on detail pages (such as individual product or
              order pages). Can also be used on any page that needs to structure
              a lot of content. This layout stacks the columns on small screens.
            </p>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <p>Add tags to your order.</p>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}