"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Store, Package, QrCode } from "lucide-react";

interface Props {
  businessId?: string;
}

export function QRCodesManager({ businessId }: Props) {
  const [tableNumber, setTableNumber] = useState("");

  const { data: businessData } = useQuery({
    queryKey: ["business"],
    queryFn: async () => {
      const res = await fetch("/api/business");
      return res.json();
    },
  });

  const business = businessData?.data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const storeUrl = business ? `${appUrl}/en/business/${business.slug}` : "";
  const tableUrl = business && tableNumber
    ? `${appUrl}/en/business/${business.slug}?table=${tableNumber}`
    : "";

  const downloadQR = (id: string, filename: string) => {
    const canvas = document.querySelector(`#${id} canvas`) as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.png`;
    a.click();
  };

  const qrItems = [
    {
      id: "store-qr",
      title: "Store QR Code",
      description: "Scan to visit your online store",
      icon: Store,
      value: storeUrl,
      gradient: "from-violet-500 to-purple-600",
    },
    {
      id: "menu-qr",
      title: "Digital Menu QR",
      description: "Perfect for tables, windows, or banners",
      icon: Package,
      value: storeUrl,
      gradient: "from-pink-500 to-rose-600",
    },
  ];

  if (!business) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Set up your business first</h2>
          <p className="text-gray-500">Create your business profile to generate QR codes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Codes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate and download QR codes for your store
        </p>
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
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-2`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div id={item.id} className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  {item.value ? (
                    <QRCodeCanvas value={item.value} size={160} />
                  ) : (
                    <div className="w-40 h-40 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
                      Configure business first
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 text-center max-w-[180px] break-all">
                  {item.value || "Set up your store URL"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  disabled={!item.value}
                  onClick={() => downloadQR(item.id, item.title.toLowerCase().replace(/ /g, "-"))}
                >
                  <Download className="w-4 h-4" />
                  Download QR
                </Button>
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
              <CardTitle className="text-base">Table QR Code</CardTitle>
              <CardDescription>For cafes & restaurants — customer scans to order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Table Number</label>
                <Input
                  placeholder="e.g. Table 1, T-5"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                />
              </div>

              {tableUrl && (
                <div id="table-qr" className="flex justify-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <QRCodeCanvas value={tableUrl} size={160} />
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                disabled={!tableUrl}
                onClick={() => downloadQR("table-qr", `table-${tableNumber}-qr`)}
              >
                <Download className="w-4 h-4" />
                Download Table QR
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
