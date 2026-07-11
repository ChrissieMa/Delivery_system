import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";

const LOGO_URL =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663253730031/UjVLCiWwuWacGoGL.png";

export default function LabelPrint() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/label/:id");
  const orderId = params?.id;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: order, isLoading } = trpc.airtable.getOrderData.useQuery(
    orderId || "",
    { enabled: !!orderId && isClient }
  );
  const recordPrint = trpc.airtable.recordPrint.useMutation();

  const handlePrint = async () => {
    if (orderId) await recordPrint.mutateAsync({ deliveryIds: [orderId] }).catch(() => undefined);
    window.print();
  };

  if (!isClient) {
    return null;
  }

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Missing order ID</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Order not found</p>
      </div>
    );
  }

  const orderData = order.order?.fields as any;
  const customer = order.customer?.fields as any;
  const packages = order.packages || [];
  const itemDetails = (order.orderItems || []).map((item: any) => {
    const f = item.fields || {};
    const dims = [f["Inter L"], f["Inter D"], f["Inter H"]].filter((v) => v !== undefined && v !== "").join(" × ");
    const accessories = Array.isArray(f.Accessories) ? f.Accessories.join("、") : (f.Accessories || "");
    return [
      f["Item No"] || f["Item Ref"],
      [f["Item Type"], f["For What"]].filter(Boolean).join(" / "),
      dims ? `內尺寸 ${dims}cm` : "",
      f["No. of Levels"] ? `${f["No. of Levels"]}層${f["Level Heights"] ? `（${f["Level Heights"]}）` : ""}` : "",
      accessories ? `配件：${accessories}` : "",
    ].filter(Boolean).join("｜");
  });

  const shippingNo = orderData?.["Shipping No"] || "N/A";
  const orderNo = orderData?.["Internal Order No"] || "N/A";
  const customerId = customer?.["Customer ID"] || "N/A";
  const phone = customer?.["Phone"] || "N/A";
  const address = customer?.["Address"] || "N/A";
  const totalPieces = parseInt(orderData?.["Total Pieces"]) || 1;

  const labels = Array.from({ length: totalPieces }, (_, i) => {
    const packageData = packages[i]?.fields as any;
    return {
      labelNum: i + 1,
      note: packageData?.["Note"] || "",
    };
  });

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="no-print sticky top-0 z-10 bg-white border-b border-gray-200 px-2 md:px-4 py-2 md:py-3 flex gap-1 md:gap-2 justify-between items-center shadow-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation("/")}
          className="flex items-center gap-1 text-xs md:text-sm"
        >
          <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
          返回
        </Button>
        <div className="flex gap-1 md:gap-2 flex-wrap">
          <Button
            onClick={handlePrint}
            size="sm"
            className="flex items-center gap-1 md:gap-2 bg-[#E67E22] hover:bg-[#D35400] text-white text-xs md:text-sm"
          >
            <Printer className="h-3 w-3 md:h-4 md:w-4" />
            打印 {totalPieces} 張
          </Button>
        </div>
      </div>

      <div className="container py-8">
        <div className="space-y-8 flex flex-col items-center">
          {labels.map((label) => (
            <div key={label.labelNum} className="print-label-card page-break">
              <div className="print-label-header">
                <div className="print-label-brand">LKS DISPLAY BOX</div>
                <img src={LOGO_URL} alt="LKS Display Box" className="print-label-logo" />
              </div>

              <div className="print-label-main">
                <div className="print-label-topinfo">
                  <div className="print-info-row shipping-row">
                    <span className="print-info-label">Shipping No:</span>
                    <span className="print-info-value shipping-value">{shippingNo}</span>
                  </div>
                  <div className="print-info-row">
                    <span className="print-info-label">Order:</span>
                    <span className="print-info-value">{orderNo}</span>
                  </div>
                  <div className="print-info-row">
                    <span className="print-info-label">Customer No:</span>
                    <span className="print-info-value">{customerId}</span>
                  </div>
                </div>

                <div className="print-piece-center">
                  <div className="print-piece-number">
                    {label.labelNum} / {totalPieces}
                  </div>
                  <div className="print-piece-subtitle">
                    Box {label.labelNum} of {totalPieces}
                  </div>
                </div>

                {itemDetails.length ? (
                  <div className="print-item-details">
                    {itemDetails.map((line: string, index: number) => <div key={index}>{line}</div>)}
                  </div>
                ) : null}

                <div className="print-contact-section">
                  <div className="print-contact-row">
                    <span className="print-contact-label">Phone:</span>
                    <span className="print-contact-value">{phone}</span>
                  </div>
                  <div className="print-contact-row address-row">
                    <span className="print-contact-label">Address:</span>
                    <span className="print-contact-value address-value">{address}</span>
                  </div>
                  {label.note ? (
                    <div className="print-contact-row note-row">
                      <span className="print-contact-label">Note:</span>
                      <span className="print-contact-value address-value">{label.note}</span>
                    </div>
                  ) : null}
                </div>

                <div className="print-footer">Total Pieces: {totalPieces}</div>
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

        .print-item-details {
          border: 2px solid #1f2937;
          padding: 8px 10px;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.35;
          margin-bottom: 10px;
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
