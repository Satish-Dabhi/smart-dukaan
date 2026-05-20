import { Metadata } from "next";
import { InvoicesManager } from "@/components/dashboard/invoices-manager";
import { getSearchParam } from "@/lib/utils";

export const metadata: Metadata = { title: "Invoices" };

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return (
    <InvoicesManager
      page={parseInt(getSearchParam(params.page, "1"), 10)}
      q={getSearchParam(params.q)}
      status={getSearchParam(params.status)}
    />
  );
}
