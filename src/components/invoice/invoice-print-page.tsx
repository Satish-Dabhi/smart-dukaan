"use client";

import { useRef } from "react";
import Image from "next/image";
import { useReactToPrint } from "react-to-print";
import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface InvoiceItem {
  name: string;
  nameGu?: string;
  sku?: string;
  quantity: number;
  price: number;
  discount: number;
  gstPercentage: number;
  hsnCode?: string;
  total: number;
}

interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  status: string;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
}

interface BusinessData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber?: string;
  logo?: string;
}

interface Props {
  invoice: InvoiceData;
  business: BusinessData;
}

export function InvoicePrintPage({ invoice, business }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${invoice.invoiceNumber}`,
  });

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    const toastId = toast.loading("Generating high-resolution PDF...");
    try {
      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default || html2canvasModule;
      const jspdfModule = await import("jspdf");
      const jsPDF = jspdfModule.jsPDF || jspdfModule.default || jspdfModule;

      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
      pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
      toast.success("PDF downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF. Please try printing instead.", { id: toastId });
    }
  };

  const paymentLabel: Record<string, string> = {
    cash: "Cash",
    upi: "UPI",
    card: "Card",
    cod: "Cash on Delivery",
  };

  const date = new Date(invoice.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      {/* Toolbar */}
      <div className="max-w-2xl mx-auto mb-4 flex items-center justify-between print:hidden">
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">
          Invoice #{invoice.invoiceNumber}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button size="sm" onClick={handleDownloadPdf} className="gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice layout */}
      <div
        ref={printRef}
        className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-pink-600 text-white px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              {business.logo ? (
                <Image
                  src={business.logo}
                  alt={business.name}
                  width={192}
                  height={48}
                  className="h-12 mb-2 object-contain"
                  unoptimized
                />
              ) : (
                <div className="text-2xl font-black mb-1">{business.name}</div>
              )}
              <p className="text-violet-100 text-sm">
                {business.address}, {business.city}
              </p>
              <p className="text-violet-100 text-sm">
                {business.state} - {business.pincode}
              </p>
              <p className="text-violet-100 text-sm">{business.phone}</p>
              {business.gstNumber && (
                <p className="text-violet-100 text-sm mt-1">GSTIN: {business.gstNumber}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold uppercase tracking-widest text-violet-200 mb-1">
                Tax Invoice
              </div>
              <div className="text-2xl font-black">{invoice.invoiceNumber}</div>
              <div className="text-violet-100 text-sm mt-1">{date}</div>
              <div className="mt-2 inline-block bg-white/20 rounded px-3 py-1">
                <span className="text-xs font-bold uppercase">{invoice.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="px-8 py-4 border-b border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Bill To
          </p>
          <p className="font-semibold text-gray-800">
            {invoice.customerName ?? "Walk-in Customer"}
          </p>
          {invoice.customerPhone && (
            <p className="text-sm text-gray-500">{invoice.customerPhone}</p>
          )}
          {invoice.customerAddress && (
            <p className="text-sm text-gray-500">{invoice.customerAddress}</p>
          )}
        </div>

        {/* Items */}
        <div className="px-8 py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Item
                </th>
                {invoice.items.some((i) => i.hsnCode) && (
                  <th className="text-center py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    HSN
                  </th>
                )}
                <th className="text-center py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Qty
                </th>
                <th className="text-right py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Rate
                </th>
                {invoice.items.some((i) => i.discount > 0) && (
                  <th className="text-right py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Disc%
                  </th>
                )}
                <th className="text-right py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  GST%
                </th>
                <th className="text-right py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-50">
                  <td className="py-2.5 pr-2 text-gray-800 font-medium">{item.name}</td>
                  {invoice.items.some((i) => i.hsnCode) && (
                    <td className="py-2.5 text-center text-gray-500 text-xs">
                      {item.hsnCode ?? "-"}
                    </td>
                  )}
                  <td className="py-2.5 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-2.5 text-right text-gray-600">{formatCurrency(item.price)}</td>
                  {invoice.items.some((i) => i.discount > 0) && (
                    <td className="py-2.5 text-right text-gray-500 text-xs">
                      {item.discount > 0 ? `${item.discount}%` : "-"}
                    </td>
                  )}
                  <td className="py-2.5 text-right text-gray-500 text-xs">
                    {item.gstPercentage > 0 ? `${item.gstPercentage}%` : "-"}
                  </td>
                  <td className="py-2.5 text-right font-semibold text-gray-800">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-8 pb-4">
          <div className="ml-auto max-w-xs space-y-1.5 border-t border-gray-100 pt-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>- {formatCurrency(invoice.discountAmount)}</span>
              </div>
            )}
            {invoice.cgst > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>CGST</span>
                <span>{formatCurrency(invoice.cgst)}</span>
              </div>
            )}
            {invoice.sgst > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>SGST</span>
                <span>{formatCurrency(invoice.sgst)}</span>
              </div>
            )}
            {invoice.igst > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>IGST</span>
                <span>{formatCurrency(invoice.igst)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2 mt-1">
              <span>Total</span>
              <span className="text-violet-700">{formatCurrency(invoice.total)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Payment</span>
              <span>{paymentLabel[invoice.paymentMethod] ?? invoice.paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="px-8 pb-4">
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold uppercase text-yellow-700 mb-1">Note</p>
              <p className="text-sm text-yellow-800">{invoice.notes}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center text-xs text-gray-400 border-t border-gray-100">
          Thank you for your business! — Powered by SmartDukaan
        </div>
      </div>
    </div>
  );
}
