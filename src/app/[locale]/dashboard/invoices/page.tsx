import { Metadata } from "next";
import { InvoicesManager } from "@/components/dashboard/invoices-manager";

export const metadata: Metadata = { title: "Invoices" };

export default function InvoicesPage() {
  return <InvoicesManager />;
}
