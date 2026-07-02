import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import { useRoute, useLocation } from "wouter";

const LOGO_URL =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663253730031/UjVLCiWwuWacGoGL.png";

export default function LabelsPrint() {
  const [, params] = useRoute("/labels/:id");
  const [, setLocation] = useLocation();

  const rawIds = params?.id || "";
  const orderIds = decodeURIComponent(rawIds)
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const queryResults = trpc.useQueries((t) =>
    orderIds.map((id) => t.airtable.getOrderData(id))
  );

  const isLoading = queryResults.some((result) => result.isLoading);
  const allOrders = queryResults
    .map((result) => result.data)
    .filter(Boolean) as Array<any>;

  const handlePrint = () => {
    window.print();
  };

  if (!orderIds.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>找不到訂單資料</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (allOrders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>找不到訂單數據</p>
      </div>
    );
  }

  const allLabels = allOrders.flatMap((data) => {
    const { order, packages = [], customer } = data;
    const totalBoxes = Number(order.fields["Total Pieces"] || packages.length || 1);

    const sourcePackages = packages.length
      ? packages
      : Array.from({ length: totalBoxes }, (_unused, index) => ({
          id: `fallback-${index + 1}`,
          fields: { "Box No": index + 1, Note: "" },
        }));

    return sourcePackages.map((pkg: any, index: number) => {
      const boxNo = pkg.fields["Box No"] || index + 1;
      return {
        key: `${order.id}-${pkg.id || boxNo}`,
        shippingNo: order.fields["Shipping No"] || "N/A",
        orderNo: order.fields["Internal Order No"] || "N/A",
        customerNo: customer?.fields["Customer ID"] || "N/A",
        phone: customer?.fields.Phone || "N/A",
        address: customer?.fields.Address || "N/A",
        note: pkg.fields?.Note || "",
        boxNo,
        totalBoxes,
      };
    });
  });

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="no-print bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container py-4 flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <span className="text-sm text-slate-600">共 {allLabels.length} 個標籤</span>
            <Button onClick={handlePrint} className="flex-1 sm:flex-none">
              <Printer className="w-4 h-4 mr-2" />
              打印所有標籤
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="space-y-8 flex flex-col items-center">
          {allLabels.map((label) => (
            <div key={label.key} className="print-label-card page-break">
              <div className="print-label-header">
                <div className="print-label-brand">LKS DISPLAY BOX</div>
                <img src={LOGO_URL} alt="LKS Display Box" className="print-label-logo" />
              </div>

              <div className="print-label-main">
                <div className="print-label-topinfo">
                  <div className="print-info-row shipping-row">
                    <span className="print-info-label">Shipping No:</span>
                    <span className="print-info-value shipping-value">{label.shippingNo}</span>
                  </div>
                  <div className="print-info-row">
                    <span className="print-info-label">Order:</span>
                    <span className="print-info-value">{label.orderNo}</span>
                  </div>
                  <div className="print-info-row">
                    <span className="print-info-label">Customer No:</span>
                    <span className="print-info-value">{label.customerNo}</span>
                  </div>
                </div>

                <div className="print-piece-center">
                  <div className="print-piece-number">
                    {label.boxNo} / {label.totalBoxes}
                  </div>
                  <div className="print-piece-subtitle">
                    Box {label.boxNo} of {label.totalBoxes}
                  </div>
                </div>

                <div className="print-contact-section">
                  <div className="print-contact-row">
                    <span className="print-contact-label">Phone:</span>
                    <span className="print-contact-value">{label.phone}</span>
                  </div>
                  <div className="print-contact-row address-row">
                    <span className="print-contact-label">Address:</span>
                    <span className="print-contact-value address-value">{label.address}</span>
                  </div>
                  {label.note ? (
                    <div className="print-contact-row note-row">
                      <span className="print-contact-label">Note:</span>
                      <span className="print-contact-value address-value">{label.note}</span>
                    </div>
                  ) : null}
                </div>

                <div className="print-footer">Total Pieces: {label.totalBoxes}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .print-label-card {
          width: 105mm;
          min-height: 148mm;
          background: white;
          border: 4px solid #1f2937;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
          padding: 18px 20px 16px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          font-family: "Arial", "Noto Sans TC", "Microsoft JhengHei", sans-serif;
        }

        .print-label-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 5px solid #1f2937;
          padding-bottom: 12px;
          margin-bottom: 18px;
        }

        .print-label-brand {
          color: #e85d04;
          font-weight: 800;
          font-size: 29px;
          line-height: 1;
          letter-spacing: 0.4px;
        }

        .print-label-logo {
          width: 74px;
          height: auto;
          object-fit: contain;
          flex-shrink: 0;
        }

        .print-label-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .print-label-topinfo {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .print-info-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
          line-height: 1.15;
        }

        .print-info-label {
          font-size: 22px;
          font-weight: 800;
          color: #1f1f1f;
          min-width: 170px;
          flex-shrink: 0;
        }

        .print-info-value {
          font-size: 21px;
          font-weight: 700;
          color: #1f1f1f;
          word-break: break-word;
        }

        .shipping-value {
          font-size: 26px;
        }

        .print-piece-center {
          text-align: center;
          margin: 24px 0 20px;
        }

        .print-piece-number {
          font-size: 104px;
          font-weight: 800;
          line-height: 0.92;
          color: #0f172a;
          letter-spacing: -2px;
        }

        .print-piece-subtitle {
          margin-top: 8px;
          font-size: 26px;
          font-weight: 700;
          color: #59657a;
        }

        .print-contact-section {
          border-top: 3px solid #cbd5e1;
          border-bottom: 3px solid #cbd5e1;
          padding: 14px 0 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .print-contact-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
          line-height: 1.25;
        }

        .address-row, .note-row {
          align-items: flex-start;
        }

        .print-contact-label {
          font-size: 21px;
          font-weight: 800;
          color: #1f1f1f;
          min-width: 95px;
          flex-shrink: 0;
        }

        .print-contact-value {
          font-size: 20px;
          font-weight: 700;
          color: #1f1f1f;
          word-break: break-word;
        }

        .address-value {
          line-height: 1.35;
          flex: 1;
        }

        .print-footer {
          text-align: center;
          font-size: 18px;
          color: #64748b;
          padding-top: 12px;
          font-weight: 600;
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            margin: 0;
            padding: 0;
            background: white;
          }

          .no-print {
            display: none !important;
          }

          .container {
            padding: 0 !important;
            max-width: 100% !important;
          }

          .page-break {
            page-break-after: always;
            break-after: page;
            margin: 0;
            box-shadow: none;
          }

          .page-break:last-child {
            page-break-after: auto;
            break-after: auto;
          }

          @page {
            size: A6;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
