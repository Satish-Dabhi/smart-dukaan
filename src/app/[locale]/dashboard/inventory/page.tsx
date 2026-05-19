import { Metadata } from "next";
import { InventoryManager } from "@/components/dashboard/inventory-manager";

export const metadata: Metadata = { title: "Inventory" };

export default function InventoryPage() {
  return <InventoryManager />;
}
