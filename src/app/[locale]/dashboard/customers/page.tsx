import { Metadata } from "next";
import { CustomersManager } from "@/components/dashboard/customers-manager";
import { getSearchParam } from "@/lib/utils";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return (
    <CustomersManager
      page={parseInt(getSearchParam(params.page, "1"), 10)}
      q={getSearchParam(params.q)}
    />
  );
}
