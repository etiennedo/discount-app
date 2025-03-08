import {
  EmptyState,
  IndexTable,
  Badge,
  Text,
  useIndexResourceState,
  useBreakpoints,
  Link,
} from "@shopify/polaris";
import {DeleteIcon} from '@shopify/polaris-icons';

interface PromoIndexTableProps {
  promotions: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    storeId: string;
  }[];
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(new Date(dateString));
}

function getStatusBadge(startDate: string, endDate: string) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return <Badge progress="incomplete" tone="attention">Scheduled</Badge>;
  } else if (now >= start && now <= end) {
    return <Badge progress="partiallyComplete" tone="success">Ongoing</Badge>;
  } else {
    return <Badge progress="complete">Completed</Badge>;
  }
}

export default function PromoIndexTable({ promotions }: PromoIndexTableProps) {
  const resourceName = {
    singular: "promotion",
    plural: "promotions",
  };

  const stringifiedPromotions = promotions.map((promotion) => ({
    ...promotion,
    id: promotion.id.toString(),
  }));

  const bulkActions = [
    {
      icon: DeleteIcon,
      destructive: true,
      content: 'Delete orders',
      onAction: () => console.log('Todo: implement bulk delete'),
    },
  ];
  
  const {selectedResources, allResourcesSelected, handleSelectionChange} =
    useIndexResourceState(stringifiedPromotions);

  const emptyStateMarkup = (
    <EmptyState
      heading="View all your promotions here"
      action={{ content: "New promotion", url: "/app/promotions/new" }}
      secondaryAction={{
        content: "Learn more",
        url: "https://help.shopify.com",
      }}
      image="/Products empty state.png"
    >
      <p>Track your current, past and upcoming promotions.</p>
    </EmptyState>
  );

  const rowMarkup = stringifiedPromotions.map(
    ({ id, name, startDate, endDate }, index) => (
      <IndexTable.Row 
      id={id}
      key={id} 
      selected={selectedResources.includes(id)}
      position={index}
      >
        <IndexTable.Cell>
        <Link
            dataPrimaryLink
            url={`/app/promotions/${id}`}
            onClick={() => console.log(`Clicked ${name}`)}
          >
            <Text fontWeight="bold" as="span">
              {name}
            </Text>
          </Link>
        </IndexTable.Cell>
        <IndexTable.Cell>{getStatusBadge(startDate, endDate)}</IndexTable.Cell>
        <IndexTable.Cell>{formatDate(startDate)}</IndexTable.Cell>
        <IndexTable.Cell>{formatDate(endDate)}</IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  return (
    <IndexTable
      condensed={useBreakpoints().smDown}
      resourceName={resourceName}
      itemCount={promotions.length}
      emptyState={emptyStateMarkup}
      headings={[
        { title: "Promotion name" },
        { title: "Status" },
        { title: "Start Date" },
        { title: "End Date" },
      ]}
      selectedItemsCount={
        allResourcesSelected ? 'All' : selectedResources.length
      }
      onSelectionChange={handleSelectionChange}
      bulkActions={bulkActions}
    >
      {rowMarkup}
    </IndexTable>
  );
}