"use client";

import React from "react";
import { formatCurrency, formatDateTime, amountInWords } from "@/lib/utils";

interface InvoicePrintProps {
  invoice: Record<string, unknown> | null;
}

export const InvoicePrint = React.forwardRef<HTMLDivElement, InvoicePrintProps>(
  ({ invoice }, ref) => {
    if (!invoice) return <div ref={ref} />;

    const items =
      (invoice.items as Array<{
        name: string;
        quantity: number;
        price: number;
        discount: number;
        gstPercentage: number;
        hsnCode?: string;
        total: number;
      }>) ?? [];

    const invoiceType = (invoice.invoiceType as string) ?? "TAX INVOICE";
    const businessName = (invoice.businessName as string) ?? "SmartDukaan";
    const businessAddress = invoice.businessAddress as string;
    const businessPhone = invoice.businessPhone as string;
    const businessGstin = invoice.businessGstin as string;
    const businessFssai = invoice.businessFssai as string;
    const businessLogo = invoice.businessLogo as string;

    const subtotal = (invoice.subtotal as number) ?? 0;
    const discountAmount = (invoice.discountAmount as number) ?? 0;
    const cgst = (invoice.cgst as number) ?? 0;
    const sgst = (invoice.sgst as number) ?? 0;
    const igst = (invoice.igst as number) ?? 0;
    const roundOff = (invoice.roundOff as number) ?? 0;
    const total = (invoice.total as number) ?? 0;

    const taxableAmount = subtotal - discountAmount;
    const hasGst = cgst > 0 || sgst > 0 || igst > 0;

    // Derive GST rate label from items (e.g. "@9%") when all items share one rate
    const gstRates = [...new Set(items.map((i) => i.gstPercentage).filter((r) => r > 0))];
    const singleRate = gstRates.length === 1 ? gstRates[0] : null;

    const hr = <div style={{ borderTop: "1px dashed #9ca3af", margin: "8px 0" }} />;
    const row = (label: string, value: string, bold = false, color?: string) => (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "11px",
          marginBottom: "3px",
          color: color ?? (bold ? "#111827" : "#374151"),
          fontWeight: bold ? 700 : 400,
        }}
      >
        <span>{label}</span>
        <span>{value}</span>
      </div>
    );

    return (
      <div
        ref={ref}
        style={{
          maxWidth: "80mm",
          margin: "0 auto",
          padding: "12px",
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: "11px",
          color: "#1f2937",
          background: "#fff",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          {businessLogo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={businessLogo}
              alt=""
              style={{ height: "48px", marginBottom: "6px", objectFit: "contain" }}
            />
          )}
          <div
            style={{
              fontSize: "16px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {businessName}
          </div>
          {businessAddress && (
            <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>
              {businessAddress}
            </div>
          )}
          {businessPhone && (
            <div style={{ fontSize: "10px", color: "#6b7280" }}>Tel: {businessPhone}</div>
          )}
          {businessGstin && (
            <div style={{ fontSize: "10px", color: "#374151", fontWeight: 600 }}>
              GSTIN: {businessGstin}
            </div>
          )}
          {businessFssai && (
            <div style={{ fontSize: "10px", color: "#374151" }}>FSSAI: {businessFssai}</div>
          )}
        </div>

        {hr}

        {/* Invoice type banner */}
        <div
          style={{
            textAlign: "center",
            fontSize: "12px",
            fontWeight: 900,
            letterSpacing: "2px",
            marginBottom: "8px",
            borderTop: "1px solid #374151",
            borderBottom: "1px solid #374151",
            padding: "4px 0",
          }}
        >
          {invoiceType.toUpperCase()}
        </div>

        {/* Invoice meta */}
        <div style={{ marginBottom: "8px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "11px",
              marginBottom: "2px",
            }}
          >
            <span>Invoice #:</span>
            <span style={{ fontWeight: 700 }}>{invoice.invoiceNumber as string}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "11px",
              marginBottom: "2px",
            }}
          >
            <span>Date:</span>
            <span>{formatDateTime(invoice.createdAt as string)}</span>
          </div>
          {!!invoice.customerName && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                marginBottom: "2px",
              }}
            >
              <span>Customer:</span>
              <span>{invoice.customerName as string}</span>
            </div>
          )}
          {!!invoice.customerPhone && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                marginBottom: "2px",
              }}
            >
              <span>Phone:</span>
              <span>{invoice.customerPhone as string}</span>
            </div>
          )}
        </div>

        {hr}

        {/* Items */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "10px",
            marginBottom: "6px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #d1d5db" }}>
              <th style={{ textAlign: "left", paddingBottom: "4px", fontWeight: 700 }}>Item</th>
              <th style={{ textAlign: "right", paddingBottom: "4px", fontWeight: 700 }}>Qty</th>
              <th style={{ textAlign: "right", paddingBottom: "4px", fontWeight: 700 }}>Rate</th>
              <th style={{ textAlign: "right", paddingBottom: "4px", fontWeight: 700 }}>Amt</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px dotted #e5e7eb" }}>
                <td style={{ paddingTop: "4px", paddingBottom: "4px", maxWidth: "120px" }}>
                  <div
                    style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {item.name}
                  </div>
                  <div style={{ color: "#9ca3af", fontSize: "9px" }}>
                    {item.hsnCode && <span>HSN: {item.hsnCode}</span>}
                    {item.gstPercentage > 0 && (
                      <span style={{ marginLeft: "4px" }}>GST {item.gstPercentage}%</span>
                    )}
                    {item.discount > 0 && (
                      <span style={{ marginLeft: "4px" }}>Disc {item.discount}%</span>
                    )}
                  </div>
                </td>
                <td style={{ textAlign: "right", paddingTop: "4px", verticalAlign: "top" }}>
                  {item.quantity}
                </td>
                <td style={{ textAlign: "right", paddingTop: "4px", verticalAlign: "top" }}>
                  ₹{item.price.toFixed(2)}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    paddingTop: "4px",
                    verticalAlign: "top",
                    fontWeight: 600,
                  }}
                >
                  ₹{item.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {hr}

        {/* Totals */}
        <div style={{ marginBottom: "6px" }}>
          {row("Subtotal", formatCurrency(subtotal))}
          {discountAmount > 0 &&
            row("Discount", `-${formatCurrency(discountAmount)}`, false, "#16a34a")}
          {/* Taxable amount separator — only when there's both a discount and tax */}
          {discountAmount > 0 && hasGst && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "10px",
                marginBottom: "3px",
                color: "#9ca3af",
                fontStyle: "italic",
                borderTop: "1px dotted #d1d5db",
                paddingTop: "3px",
              }}
            >
              <span>Taxable Amt</span>
              <span>{formatCurrency(taxableAmount)}</span>
            </div>
          )}
          {cgst > 0 && row(singleRate ? `CGST @${singleRate / 2}%` : "CGST", formatCurrency(cgst))}
          {sgst > 0 && row(singleRate ? `SGST @${singleRate / 2}%` : "SGST", formatCurrency(sgst))}
          {igst > 0 && row(singleRate ? `IGST @${singleRate}%` : "IGST", formatCurrency(igst))}
          {roundOff !== 0 &&
            row(
              "Round Off",
              `${roundOff > 0 ? "+" : ""}${formatCurrency(Math.abs(roundOff))}`,
              false,
              "#6b7280"
            )}
          <div style={{ borderTop: "2px solid #111827", marginTop: "4px", paddingTop: "4px" }}>
            {row("GRAND TOTAL", formatCurrency(total), true)}
          </div>
          <div style={{ marginTop: "4px", fontSize: "10px", color: "#374151" }}>
            Payment: <strong>{(invoice.paymentMethod as string)?.toUpperCase()}</strong>
          </div>
        </div>

        {hr}

        {/* Amount in words */}
        <div style={{ fontSize: "10px", color: "#374151", marginBottom: "8px", lineHeight: "1.5" }}>
          <strong>Amount:</strong> {amountInWords(total)}
        </div>

        {hr}

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: "10px", color: "#6b7280", lineHeight: "1.7" }}>
          <div style={{ fontWeight: 700, fontSize: "11px", color: "#1f2937" }}>
            Thank you for your visit!
          </div>
          <div>Please visit again</div>
          <div style={{ marginTop: "4px", fontSize: "9px", color: "#9ca3af" }}>
            Generated by SmartDukaan
          </div>
        </div>
      </div>
    );
  }
);

InvoicePrint.displayName = "InvoicePrint";
