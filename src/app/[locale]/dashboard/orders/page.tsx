import { Metadata } from "next";
import { OrdersManager } from "@/components/dashboard/orders-manager";
import { getSearchParam } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return (
    <OrdersManager
      page={parseInt(getSearchParam(params.page, "1"), 10)}
      q={getSearchParam(params.q)}
      status={getSearchParam(params.status)}
    />
  );
}
