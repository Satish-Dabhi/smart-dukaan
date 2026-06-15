"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Download, Package, Printer, QrCode, Store } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { QRCodeCanvas } from "qrcode.react";
import { useRef, useState } from "react";

interface Props {
  businessId?: string;
}

function QRPrintCard({
  businessName,
  businessLogo,
  tableNumber,
  storeUrl,
  type,
}: {
  businessName: string;
  businessLogo?: string;
  tableNumber?: string;
  storeUrl: string;
  type: "store" | "menu" | "table";
}) {
  return (
    <div
      className="qr-print-card"
      style={{
        width: "90mm",
        padding: "8mm",
        border: "2px solid #7c3aed",
        borderRadius: "12px",
        textAlign: "center",
        fontFamily: "sans-serif",
        background: "#fff",
        margin: "0 auto",
      }}
    >
      {businessLogo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={businessLogo}
          alt={businessName}
          style={{ height: "44px", marginBottom: "8px", objectFit: "contain" }}
        />
      )}
      <div style={{ fontSize: "18px", fontWeight: 900, color: "#1f2937", marginBottom: "4px" }}>
        {businessName}
      </div>
      {tableNumber && (
        <div style={{ fontSize: "15px", color: "#7c3aed", fontWeight: 700, marginBottom: "10px" }}>
          Table {tableNumber}
        </div>
      )}
      <div
        style={{
          display: "inline-block",
          padding: "12px",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          marginBottom: "12px",
        }}
      >
        <QRCodeCanvas value={storeUrl} size={180} />
      </div>
      <div style={{ fontSize: "20px", fontWeight: 900, color: "#1f2937", marginBottom: "4px" }}>
        Scan to Order
      </div>
      <div
        style={{
          fontSize: "10px",
          color: "#6b7280",
          marginBottom: "10px",
          wordBreak: "break-all",
          padding: "0 4px",
        }}
      >
        {storeUrl}
      </div>
      <div
        style={{
          borderTop: "1px solid #e5e7eb",
          paddingTop: "8px",
          fontSize: "10px",
          color: "#9ca3af",
        }}
      >
        Powered by SmartDukaan
      </div>
    </div>
  );
}

export function QRCodesManager({ businessId }: Props) {
  const [tableNumber, setTableNumber] = useState("");
  const [printType, setPrintType] = useState<"store" | "menu" | "table" | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("qrCodes");
  const locale = useLocale();

  const { data: businessData } = useQuery({
    queryKey: ["business", businessId],
    queryFn: async () => {
      const res = await fetch("/api/business");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const business = businessData?.data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const storeUrl = business ? `${appUrl}/${locale}/business/${business.slug}` : "";
  const tableUrl = business && tableNumber ? `${storeUrl}?table=${tableNumber}` : "";

  const downloadQR = (id: string, filename: string) => {
    const canvas = document.querySelector(`#${id} canvas`) as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.png`;
    a.click();
  };

  const handlePrint = (type: "store" | "menu" | "table") => {
    setPrintType(type);
    setTimeout(() => {
      window.print();
      setPrintType(null);
    }, 100);
  };

  const qrItems = [
    {
      id: "store-qr",
      title: t("storeQrTitle"),
      description: t("storeQrDesc"),
      icon: Store,
      value: storeUrl,
      gradient: "from-violet-500 to-purple-600",
      type: "store" as const,
    },
    {
      id: "menu-qr",
      title: t("menuQrTitle"),
      description: t("menuQrDesc"),
      icon: Package,
      value: storeUrl,
      gradient: "from-pink-500 to-rose-600",
      type: "menu" as const,
    },
  ];

  if (!business) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t("setupBusinessFirst")}
          </h2>
          <p className="text-gray-500">{t("setupBusinessFirstSub")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print-only overlay */}
      {printType && (
        <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center print:block">
          <QRPrintCard
            businessName={business.name}
            businessLogo={business.logo}
            tableNumber={printType === "table" ? tableNumber : undefined}
            storeUrl={printType === "table" ? tableUrl : storeUrl}
            type={printType}
          />
        </div>
      )}

      <style jsx global>{`
        @media print {
          body > *:not(.print-overlay) {
            display: none !important;
          }
          .qr-print-card {
            display: block !important;
          }
        }
      `}</style>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {qrItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${item.gradient}`} />
                <CardHeader>
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-2`}
                  >
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <div
                    id={item.id}
                    className="p-4 bg-white rounded-xl shadow-sm border border-gray-100"
                  >
                    {item.value ? (
                      <QRCodeCanvas value={item.value} size={160} />
                    ) : (
                      <div className="w-40 h-40 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
                        {t("configureFirst")}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 text-center max-w-[180px] break-all">
                    {item.value || t("setupStoreUrl")}
                  </p>
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      disabled={!item.value}
                      onClick={() =>
                        downloadQR(item.id, item.title.toLowerCase().replace(/ /g, "-"))
                      }
                    >
                      <Download className="w-4 h-4" />
                      {t("downloadQr")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      disabled={!item.value}
                      onClick={() => handlePrint(item.type)}
                    >
                      <Printer className="w-4 h-4" />
                      Print Card
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Table QR */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600" />
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-2">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-base">{t("tableQrTitle")}</CardTitle>
                <CardDescription>{t("tableQrDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("tableNumber")}</label>
                  <Input
                    placeholder={t("tableNumberPlaceholder")}
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    inputMode="numeric"
                  />
                </div>

                {tableUrl && (
                  <div
                    id="table-qr"
                    className="flex justify-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
                  >
                    <QRCodeCanvas value={tableUrl} size={160} />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    disabled={!tableUrl}
                    onClick={() => downloadQR("table-qr", `table-${tableNumber}-qr`)}
                  >
                    <Download className="w-4 h-4" />
                    {t("downloadTableQr")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    disabled={!tableUrl}
                    onClick={() => handlePrint("table")}
                  >
                    <Printer className="w-4 h-4" />
                    Print Card
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}
