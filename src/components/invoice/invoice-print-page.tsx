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
  customerEmail?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff?: number;
  total: number;
  status: string;
  paymentMethod: string;
  notes?: string;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
}

interface BusinessData {
  name: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber?: string;
  fssaiNumber?: string;
  invoiceType?: "tax_invoice" | "bill_of_supply";
  logo?: string;
}

interface Props {
  invoice: InvoiceData;
  business: BusinessData;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  paid: { bg: "bg-emerald-500", text: "PAID" },
  unpaid: { bg: "bg-amber-500", text: "UNPAID" },
  draft: { bg: "bg-gray-400", text: "DRAFT" },
  cancelled: { bg: "bg-red-500", text: "CANCELLED" },
  refunded: { bg: "bg-blue-500", text: "REFUNDED" },
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Cash",
  upi: "UPI",
  card: "Card / POS",
  cod: "Cash on Delivery",
  bank: "Bank Transfer",
  cheque: "Cheque",
};

export function InvoicePrintPage({ invoice, business }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${invoice.invoiceNumber}`,
  });

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    const toastId = toast.loading("Generating PDF...");
    try {
      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default || html2canvasModule;
      const jspdfModule = await import("jspdf");
      const jsPDF = jspdfModule.jsPDF || jspdfModule.default || jspdfModule;

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
      } else {
        // Multi-page support
        let position = 0;
        let remaining = imgHeight;
        while (remaining > 0) {
          if (position > 0) pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, -position, pageWidth, imgHeight);
          position += pageHeight;
          remaining -= pageHeight;
        }
      }
      pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
      toast.success("PDF downloaded!", { id: toastId });
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF. Please try printing instead.", { id: toastId });
    }
  };

  const date = new Date(invoice.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const invoiceTypeLabel =
    business.invoiceType === "bill_of_supply" ? "Bill of Supply" : "Tax Invoice";

  const statusInfo = STATUS_COLORS[invoice.status] ?? {
    bg: "bg-gray-400",
    text: invoice.status.toUpperCase(),
  };

  // Price breakdown
  const hasDiscount = invoice.discountAmount > 0;
  const hasCgst = invoice.cgst > 0;
  const hasSgst = invoice.sgst > 0;
  const hasIgst = invoice.igst > 0;
  const hasGst = hasCgst || hasSgst || hasIgst;
  const hasRoundOff = invoice.roundOff !== undefined && invoice.roundOff !== 0;
  const totalGst = (invoice.cgst ?? 0) + (invoice.sgst ?? 0) + (invoice.igst ?? 0);
  const taxableAmount = invoice.subtotal - invoice.discountAmount;

  // Compute GST rate label from items (e.g. "18%")
  const gstRates = [...new Set(invoice.items.map((i) => i.gstPercentage).filter((r) => r > 0))];
  const cgstRate = gstRates.length === 1 ? gstRates[0] / 2 : null;
  const sgstRate = cgstRate;
  const igstRate = gstRates.length === 1 ? gstRates[0] : null;

  const hasAnyItems = invoice.items.length > 0;
  const showHsn = invoice.items.some((i) => i.hsnCode);
  const showItemDiscount = invoice.items.some((i) => i.discount > 0);
  const showItemGst = invoice.items.some((i) => i.gstPercentage > 0);

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

      {/* Invoice Document */}
      <div
        ref={printRef}
        className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none"
        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        {/* ── Header ── */}
        <div
          style={{ background: "linear-gradient(135deg,#7c3aed 0%,#db2777 100%)" }}
          className="text-white px-8 py-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {business.logo ? (
                <Image
                  src={business.logo}
                  alt={business.name}
                  width={160}
                  height={40}
                  className="h-10 mb-2 object-contain"
                  unoptimized
                />
              ) : (
                <div className="text-2xl font-black mb-1 leading-tight">{business.name}</div>
              )}
              <p className="text-violet-100 text-sm leading-relaxed">
                {business.address}, {business.city}
              </p>
              <p className="text-violet-100 text-sm">
                {business.state} – {business.pincode}
              </p>
              <p className="text-violet-100 text-sm">{business.phone}</p>
              {business.gstNumber && (
                <p className="text-violet-200 text-xs mt-1 font-mono">
                  GSTIN: {business.gstNumber}
                </p>
              )}
              {business.fssaiNumber && (
                <p className="text-violet-200 text-xs font-mono">FSSAI: {business.fssaiNumber}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs font-bold uppercase tracking-widest text-violet-200 mb-1">
                {invoiceTypeLabel}
              </div>
              <div className="text-3xl font-black tabular-nums">{invoice.invoiceNumber}</div>
              <div className="text-violet-100 text-sm mt-1">{date}</div>
              <div className={`mt-2 inline-block ${statusInfo.bg} rounded px-3 py-1`}>
                <span className="text-xs font-black text-white">{statusInfo.text}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bill To ── */}
        <div className="px-8 py-4 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Bill To</p>
          <p className="font-bold text-gray-800 text-base">
            {invoice.customerName ?? "Walk-in Customer"}
          </p>
          {invoice.customerPhone && (
            <p className="text-sm text-gray-500">{invoice.customerPhone}</p>
          )}
          {invoice.customerEmail && (
            <p className="text-sm text-gray-500">{invoice.customerEmail}</p>
          )}
          {invoice.customerAddress && (
            <p className="text-sm text-gray-500">{invoice.customerAddress}</p>
          )}
        </div>

        {/* ── Items Table ── */}
        {hasAnyItems && (
          <div className="px-8 py-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th className="text-left pb-2 pt-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                    Item
                  </th>
                  {showHsn && (
                    <th className="text-center pb-2 pt-1 text-xs font-bold uppercase tracking-wide text-gray-400 px-2">
                      HSN
                    </th>
                  )}
                  <th className="text-center pb-2 pt-1 text-xs font-bold uppercase tracking-wide text-gray-400 px-2">
                    Qty
                  </th>
                  <th className="text-right pb-2 pt-1 text-xs font-bold uppercase tracking-wide text-gray-400 px-2">
                    Rate
                  </th>
                  {showItemDiscount && (
                    <th className="text-right pb-2 pt-1 text-xs font-bold uppercase tracking-wide text-gray-400 px-2">
                      Disc%
                    </th>
                  )}
                  {showItemGst && (
                    <th className="text-right pb-2 pt-1 text-xs font-bold uppercase tracking-wide text-gray-400 px-2">
                      GST%
                    </th>
                  )}
                  <th className="text-right pb-2 pt-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                    className="hover:bg-gray-50"
                  >
                    <td className="py-2.5 pr-2 text-gray-800 font-medium">
                      {item.name}
                      {item.sku && (
                        <span className="block text-xs text-gray-400 font-normal">
                          SKU: {item.sku}
                        </span>
                      )}
                    </td>
                    {showHsn && (
                      <td className="py-2.5 text-center text-gray-500 text-xs px-2">
                        {item.hsnCode ?? "—"}
                      </td>
                    )}
                    <td className="py-2.5 text-center text-gray-600 px-2">{item.quantity}</td>
                    <td className="py-2.5 text-right text-gray-600 px-2 tabular-nums">
                      {formatCurrency(item.price)}
                    </td>
                    {showItemDiscount && (
                      <td className="py-2.5 text-right px-2">
                        {item.discount > 0 ? (
                          <span className="text-green-600 text-xs font-semibold">
                            {item.discount}%
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    )}
                    {showItemGst && (
                      <td className="py-2.5 text-right px-2">
                        {item.gstPercentage > 0 ? (
                          <span className="text-gray-500 text-xs">{item.gstPercentage}%</span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    )}
                    <td className="py-2.5 text-right font-semibold text-gray-900 tabular-nums">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Price Breakdown ── */}
        <div className="px-8 pb-6">
          <div className="ml-auto max-w-xs">
            {/* Section heading */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">
                Price Breakdown
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-1.5">
              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Subtotal
                  <span className="text-xs ml-1 text-gray-400">
                    ({invoice.items.length} item{invoice.items.length !== 1 ? "s" : ""})
                  </span>
                </span>
                <span className="text-gray-700 tabular-nums">
                  {formatCurrency(invoice.subtotal)}
                </span>
              </div>

              {/* Discount */}
              {hasDiscount && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-medium">Discount Applied</span>
                  <span className="text-green-600 font-semibold tabular-nums">
                    − {formatCurrency(invoice.discountAmount)}
                  </span>
                </div>
              )}

              {/* Taxable Amount separator (show when there's discount AND tax) */}
              {hasDiscount && hasGst && (
                <div
                  className="flex justify-between text-xs pt-1 pb-0.5"
                  style={{ borderTop: "1px dashed #e5e7eb" }}
                >
                  <span className="text-gray-400 italic">Taxable Amount</span>
                  <span className="text-gray-500 tabular-nums">
                    {formatCurrency(taxableAmount)}
                  </span>
                </div>
              )}

              {/* CGST */}
              {hasCgst && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    CGST{cgstRate !== null ? ` @${cgstRate}%` : ""}
                  </span>
                  <span className="text-gray-600 tabular-nums">
                    + {formatCurrency(invoice.cgst)}
                  </span>
                </div>
              )}

              {/* SGST */}
              {hasSgst && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    SGST{sgstRate !== null ? ` @${sgstRate}%` : ""}
                  </span>
                  <span className="text-gray-600 tabular-nums">
                    + {formatCurrency(invoice.sgst)}
                  </span>
                </div>
              )}

              {/* IGST (inter-state) */}
              {hasIgst && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    IGST{igstRate !== null ? ` @${igstRate}%` : ""}
                  </span>
                  <span className="text-gray-600 tabular-nums">
                    + {formatCurrency(invoice.igst)}
                  </span>
                </div>
              )}

              {/* Total GST (summary row when both CGST+SGST present) */}
              {hasCgst && hasSgst && (
                <div className="flex justify-between text-xs text-gray-400 italic">
                  <span>Total GST</span>
                  <span className="tabular-nums">{formatCurrency(totalGst)}</span>
                </div>
              )}

              {/* Round Off */}
              {hasRoundOff && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Round Off</span>
                  <span className="text-gray-400 tabular-nums">
                    {(invoice.roundOff ?? 0) > 0 ? "+" : ""}
                    {formatCurrency(invoice.roundOff ?? 0)}
                  </span>
                </div>
              )}

              {/* Grand Total */}
              <div
                className="flex justify-between items-center pt-3 mt-1"
                style={{ borderTop: "2px solid #7c3aed" }}
              >
                <span className="text-base font-black text-gray-900">Grand Total</span>
                <span className="text-2xl font-black text-violet-700 tabular-nums">
                  {formatCurrency(invoice.total)}
                </span>
              </div>

              {/* Payment Mode */}
              <div className="flex justify-between items-center bg-violet-50 rounded-lg px-3 py-2 mt-2">
                <span className="text-xs text-violet-500 font-medium uppercase tracking-wide">
                  Payment
                </span>
                <span className="text-sm font-bold text-violet-800">
                  {PAYMENT_LABELS[invoice.paymentMethod] ?? invoice.paymentMethod}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Notes ── */}
        {invoice.notes && (
          <div className="px-8 pb-5">
            <div
              className="rounded-lg px-4 py-3"
              style={{ background: "#fefce8", border: "1px solid #fde68a" }}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-yellow-700 mb-1">Note</p>
              <p className="text-sm text-yellow-800 leading-relaxed">{invoice.notes}</p>
            </div>
          </div>
        )}

        {/* ── Thank You + SmartDukaan Footer ── */}
        <div
          style={{ borderTop: "1px solid #e5e7eb" }}
          className="px-8 py-4 text-center text-sm text-gray-500 bg-gray-50"
        >
          Thank you for your business!
        </div>

        {/* ── Generated by SmartDukaan branding ── */}
        <div
          style={{ background: "linear-gradient(135deg,#7c3aed 0%,#db2777 100%)" }}
          className="px-8 py-3"
        >
          <div className="flex items-center justify-center gap-2.5">
            {/* SmartDukaan "S" icon */}
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                background: "rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1,
              }}
            >
              S
            </div>
            <span className="text-white text-sm font-bold tracking-tight">
              Generated by SmartDukaan
            </span>
          </div>
          <p className="text-violet-200 text-xs text-center mt-0.5">smartdukaan.com</p>
        </div>
      </div>
    </div>
  );
}
