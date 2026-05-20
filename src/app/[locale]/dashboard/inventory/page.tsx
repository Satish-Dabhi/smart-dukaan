import { Metadata } from "next";
import { InventoryManager } from "@/components/dashboard/inventory-manager";
import { getSearchParam } from "@/lib/utils";

export const metadata: Metadata = { title: "Inventory" };

const VALID_FILTERS = ["all", "low", "out"] as const;
type InventoryFilter = (typeof VALID_FILTERS)[number];

function parseFilter(value: string): InventoryFilter {
  return VALID_FILTERS.includes(value as InventoryFilter)
    ? (value as InventoryFilter)
    : "all";
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return (
    <InventoryManager
      page={parseInt(getSearchParam(params.page, "1"), 10)}
      q={getSearchParam(params.q)}
      filter={parseFilter(getSearchParam(params.filter))}
    />
  );
}
