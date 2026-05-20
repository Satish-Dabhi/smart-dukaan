import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { getCustomers } from "@/services/customer.service";
import { requireBusinessAuth } from "@/lib/require-auth";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { Users, Phone, Mail, Star } from "lucide-react";

interface CustomersManagerProps {
  page: number;
  q: string;
}

export async function CustomersManager({ page, q }: CustomersManagerProps) {
  const { businessId } = await requireBusinessAuth();

  const t = await getTranslations("customers");
  const { data: customers, meta } = await getCustomers({ businessId, page, q });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("customersCount", { count: meta.total })}</p>
        </div>
      </div>

      <SearchInput placeholder={t("searchPlaceholder")} className="max-w-md" />

      {customers.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
          <p className="text-gray-500">{t("noCustomers")}</p>
          <p className="text-sm text-gray-400 mt-1">{t("noCustomersSub")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer) => (
              <Card key={customer._id.toString()} className="hover:shadow-md hover:border-violet-100 dark:hover:border-violet-900 transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {customer.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </div>
                      {!!customer.email && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="text-center">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {customer.totalOrders}
                      </div>
                      <div className="text-xs text-gray-500">{t("orders")}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatCurrency(customer.totalSpent)}
                      </div>
                      <div className="text-xs text-gray-500">{t("spent")}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-amber-600 flex items-center justify-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {customer.loyaltyPoints}
                      </div>
                      <div className="text-xs text-gray-500">{t("points")}</div>
                    </div>
                  </div>

                  {!!customer.lastOrderAt && (
                    <div className="text-xs text-gray-400 mt-3">
                      {t("lastOrder", { date: formatDate(customer.lastOrderAt) })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Pagination meta={meta} />
        </>
      )}
    </div>
  );
}
