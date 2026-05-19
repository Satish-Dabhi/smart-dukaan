import { Metadata } from "next";
import { OrdersManager } from "@/components/dashboard/orders-manager";

export const metadata: Metadata = { title: "Orders" };

export default function OrdersPage() {
  return <OrdersManager />;
}
