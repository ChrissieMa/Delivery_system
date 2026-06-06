import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";

export default function BatchDriverNotes() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/driver-notes/:ids");

  const rawIds = params?.ids || "";
  const orderIds = rawIds
    .split(",")
    .map((id) => decodeURIComponent(id).trim())
    .filter(Boolean);

  const queryResults = trpc.useQueries((t) =>
    orderIds.map((id) => t.airtable.getOrderData(id))
  );

  const isLoading = queryResults.some((result) => result.isLoading);
  const hasError = queryResults.some((result) => result.error);
  const allOrders = queryResults
    .map((result) => result.data)
    .filter(Boolean) as Array<any>;

  const handlePrint = () => {
    window.print();
  };

  if (!orderIds.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Missing order IDs</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (hasError || allOrders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-2 md:px-4 py-2 md:py-3 flex gap-1 md:gap-2 justify-between items-center">
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
            打印全部 Driver Note
          </Button>
        </div>
      </div>

      <div className="driver-note-container">
        {allOrders.map((item) => {
          const orderData = item.order?.fields as any;
          const customer = item.customer?.fields as any;
          const shippingNo = orderData?.["Shipping No"] || "N/A";
          const orderNo = orderData?.["Internal Order No"] || "N/A";
          const customerId = customer?.["Customer ID"] || "N/A";
          const customerName = customer?.["Customer Name"] || "N/A";
          const phone = customer?.["Phone"] || "N/A";
          const address = customer?.["Address"] || "N/A";
          const totalPieces = parseInt(orderData?.["Total Pieces"]) || 1;
          const driverRemark = orderData?.["Driver Remark"] || "";

          return (
            <div key={item.order.id} className="driver-note-page">
              <div className="note-header">
                <div className="note-title">
                  <div className="title-text">LKS Display Box</div>
                  <div className="subtitle-text">Driver Delivery Note</div>
                </div>
                <div className="note-logo-container">
                  <img
                    src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663253730031/UjVLCiWwuWacGoGL.png"
                    alt="LKS Display Box"
                    className="note-logo"
                  />
                </div>
              </div>

              <div className="note-content">
                <div className="note-row">
                  <div className="note-col">
                    <div className="field-label">配送號</div>
                    <div className="field-value">{shippingNo}</div>
                  </div>
                  <div className="note-col">
                    <div className="field-label">訂單號</div>
                    <div className="field-value">{orderNo}</div>
                  </div>
                </div>

                <div className="note-row">
                  <div className="note-col">
                    <div className="field-label">客戶號碼</div>
                    <div className="field-value">{customerId}</div>
                  </div>
                  <div className="note-col">
                    <div className="field-label">客戶名稱</div>
                    <div className="field-value">{customerName}</div>
                  </div>
                </div>

                <div className="note-row">
                  <div className="note-col-full">
                    <div className="field-label">聯絡電話</div>
                    <div className="field-value" style={{ fontSize: "19px" }}>{phone}</div>
                  </div>
                </div>

                <div className="note-row">
                  <div className="note-col-full">
                    <div className="field-label">送貨地址</div>
                    <div className="field-value field-value-address" style={{ fontSize: "16px" }}>{address}</div>
                  </div>
                </div>

                <div className="note-row">
                  <div className="note-col-full">
                    <div className="field-label">總件數</div>
                    <div className="field-value">{totalPieces}</div>
                  </div>
                </div>

                <div className="note-row">
                  <div className="note-col-full">
                    <div className="field-label">備註</div>
                    <div className="field-value field-value-remark">{driverRemark}</div>
                  </div>
                </div>
              </div>

              <div className="note-footer">
                <div className="footer-text"></div>
                <div className="footer-text"></div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap');

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            margin: 0;
            padding: 0;
          }

          .driver-note-container {
            width: 100%;
            height: 100%;
          }

          .driver-note-page {
            width: 100mm;
            height: 150mm;
            padding: 8mm;
            margin: 0;
            box-sizing: border-box;
            font-family: "Noto Sans TC", "Microsoft YaHei", "微軟正黑體", "SimHei", sans-serif;
            page-break-after: always;
            display: flex;
            flex-direction: column;
          }

          .driver-note-page:last-child {
            page-break-after: auto;
          }

          @page {
            size: 100mm 150mm;
            margin: 0;
          }
        }

        @media screen {
          .driver-note-container {
            padding: 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2rem;
          }

          .driver-note-page {
            width: 100mm;
            height: 150mm;
            padding: 8mm;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            box-sizing: border-box;
            font-family: "Noto Sans TC", "Microsoft YaHei", "微軟正黑體", "SimHei", sans-serif;
            display: flex;
            flex-direction: column;
          }
        }

        .note-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 2px solid #000;
        }
        .note-title { display: flex; flex-direction: column; gap: 2px; }
        .title-text { font-size: 14px; font-weight: 700; line-height: 1.2; }
        .subtitle-text { font-size: 12px; font-weight: 500; line-height: 1.2; }
        .note-logo-container { width: 22mm; height: 16mm; display: flex; align-items: center; justify-content: center; }
        .note-logo { max-width: 100%; max-height: 100%; object-fit: contain; }
        .note-content { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .note-row { display: flex; gap: 6px; }
        .note-col, .note-col-full {
          border: 1px solid #000;
          padding: 4px 5px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-height: 44px;
        }
        .note-col { flex: 1; }
        .note-col-full { width: 100%; }
        .field-label { font-size: 10px; font-weight: 700; color: #555; }
        .field-value { font-size: 15px; font-weight: 600; line-height: 1.25; word-break: break-word; }
        .field-value-address { font-size: 14px; line-height: 1.35; }
        .field-value-remark { font-size: 13px; min-height: 28px; }
        .note-footer { display: flex; justify-content: space-between; margin-top: 6px; padding-top: 4px; border-top: 1px solid #000; min-height: 12px; }
        .footer-text { font-size: 9px; color: #666; }
      `}</style>
    </div>
  );
}
