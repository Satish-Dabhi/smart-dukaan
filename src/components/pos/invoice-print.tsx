"use client";

import React from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface InvoicePrintProps {
  invoice: Record<string, unknown> | null;
}

export const InvoicePrint = React.forwardRef<HTMLDivElement, InvoicePrintProps>(
  ({ invoice }, ref) => {
    if (!invoice) return <div ref={ref} />;

    const items = (invoice.items as Array<{
      name: string;
      quantity: number;
      price: number;
      discount: number;
      gstPercentage: number;
      total: number;
    }>) ?? [];

    return (
      <div
        ref={ref}
        className="p-6 max-w-xs mx-auto font-mono text-sm"
        style={{ fontFamily: "monospace" }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-lg font-bold">{(invoice.businessName as string) ?? "SmartDukaan"}</h1>
          <p className="text-xs text-gray-600">{invoice.businessAddress as string}</p>
          {!!invoice.businessPhone && <p className="text-xs">Tel: {invoice.businessPhone as string}</p>}
          {!!invoice.gstNumber && <p className="text-xs">GST: {invoice.gstNumber as string}</p>}
        </div>

        <div className="border-t border-dashed border-gray-400 my-3" />

        {/* Invoice info */}
        <div className="mb-3">
          <div className="flex justify-between text-xs">
            <span>Invoice #:</span>
            <span className="font-bold">{invoice.invoiceNumber as string}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Date:</span>
            <span>{formatDateTime(invoice.createdAt as string)}</span>
          </div>
          {!!invoice.customerName && (
            <div className="flex justify-between text-xs">
              <span>Customer:</span>
              <span>{invoice.customerName as string}</span>
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-gray-400 my-3" />

        {/* Items */}
        <table className="w-full text-xs mb-3">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left pb-1">Item</th>
              <th className="text-right pb-1">Qty</th>
              <th className="text-right pb-1">Rate</th>
              <th className="text-right pb-1">Amt</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-1 max-w-[120px]">
                  <div className="truncate">{item.name}</div>
                  {item.gstPercentage > 0 && (
                    <div className="text-gray-400">GST {item.gstPercentage}%</div>
                  )}
                </td>
                <td className="text-right py-1">{item.quantity}</td>
                <td className="text-right py-1">₹{item.price}</td>
                <td className="text-right py-1">₹{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-dashed border-gray-400 my-3" />

        {/* Totals */}
        <div className="space-y-1 text-xs mb-3">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(invoice.subtotal as number)}</span>
          </div>
          {(invoice.discountAmount as number) > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount:</span>
              <span>-{formatCurrency(invoice.discountAmount as number)}</span>
            </div>
          )}
          {(invoice.cgst as number) > 0 && (
            <>
              <div className="flex justify-between text-gray-500">
                <span>CGST:</span>
                <span>{formatCurrency(invoice.cgst as number)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>SGST:</span>
                <span>{formatCurrency(invoice.sgst as number)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between font-bold text-base border-t border-gray-300 pt-1 mt-1">
            <span>TOTAL:</span>
            <span>{formatCurrency(invoice.total as number)}</span>
          </div>
          <div className="text-xs text-gray-500">
            Payment: {(invoice.paymentMethod as string)?.toUpperCase()}
          </div>
        </div>

        <div className="border-t border-dashed border-gray-400 my-3" />

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>Thank you for your business!</p>
          <p className="mt-1">Powered by SmartDukaan</p>
        </div>
      </div>
    );
  }
);

InvoicePrint.displayName = "InvoicePrint";
