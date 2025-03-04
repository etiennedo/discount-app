import {
  EmptyState,
  IndexTable,
  Card,
  Text,
  useBreakpoints,
} from "@shopify/polaris";
import React from "react";

interface PromoIndexTableProps {
  promotions: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    storeId: string;
  }[];
}

export default function PromoIndexTable({ promotions }: PromoIndexTableProps) {
  const resourceName = {
    singular: "promotion",
    plural: "promotions",
  };

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

  const rowMarkup = promotions.map(
    ({ id, name, startDate, endDate, storeId }, index) => (
      <IndexTable.Row id={String(id)} key={id} position={index}>
        <IndexTable.Cell>
          <Text fontWeight="bold" as="span">
            {name}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{startDate}</IndexTable.Cell>
        <IndexTable.Cell>{endDate}</IndexTable.Cell>
        <IndexTable.Cell>{storeId}</IndexTable.Cell>
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
        { title: "Name" },
        { title: "Start Date" },
        { title: "End Date" },
        { title: "Store ID" },
      ]}
    >
      {rowMarkup}
    </IndexTable>
  );
}