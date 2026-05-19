import { Metadata } from "next";
import { CustomersManager } from "@/components/dashboard/customers-manager";

export const metadata: Metadata = { title: "Customers" };

export default function CustomersPage() {
  return <CustomersManager />;
}
