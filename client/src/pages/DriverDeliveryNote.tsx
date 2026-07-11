import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";

export default function DriverDeliveryNote() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/driver-note/:id");
  const orderId = params?.id;

  const { data: order, isLoading } = trpc.airtable.getOrderData.useQuery(
    orderId || "",
    { enabled: !!orderId }
  );
  const recordPrint = trpc.airtable.recordPrint.useMutation();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePrint = async () => {
    if (orderId) await recordPrint.mutateAsync({ deliveryIds: [orderId] }).catch(() => undefined);
    window.print();
  };

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

  const delivery = order.order.fields as any;
  const customer = order.customer?.fields as any;
  const orderData = order.order?.fields as any;

  // Get data from order
  const shippingNo = orderData?.['Shipping No'] || 'N/A';
  const orderNo = orderData?.['Internal Order No'] || 'N/A';
  const customerId = customer?.['Customer ID'] || 'N/A';
  const customerName = customer?.['Customer Name'] || 'N/A';
  const phone = customer?.['Phone'] || 'N/A';
  const address = customer?.['Address'] || 'N/A';
  const totalPieces = parseInt(orderData?.['Total Pieces']) || 1;
  const totalWeight = Number(orderData?.['Total Weight']) || 0;
  const driverRemark = orderData?.['Driver Remark'] || '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Action Buttons - Hidden when printing */}
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
            打印
          </Button>
        </div>
      </div>

      {/* Delivery Note Container */}
      <div className="driver-note-container">
        <div className="driver-note-page">
          {/* Header */}
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

          {/* Content */}
          <div className="note-content">
            {/* Row 1: Shipping No and Order No */}
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

            {/* Row 2: Customer ID and Customer Name */}
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

            {/* Row 3: Phone */}
            <div className="note-row">
              <div className="note-col-full">
                <div className="field-label">聯絡電話</div>
                <div className="field-value" style={{fontSize: '19px'}}>{phone}</div>
              </div>
            </div>

            {/* Row 4: Address */}
            <div className="note-row">
              <div className="note-col-full">
                <div className="field-label">送貨地址</div>
                <div className="field-value field-value-address" style={{fontSize: '16px'}}>{address}</div>
              </div>
            </div>

            {/* Row 5: Total Pieces and Total Weight */}
            <div className="note-row">
              <div className="note-col">
                <div className="field-label">總件數</div>
                <div className="field-value">{totalPieces}</div>
              </div>
              <div className="note-col">
                <div className="field-label">總重量</div>
                <div className="field-value">{totalWeight} KG</div>
              </div>
            </div>

            {/* Row 6: Driver Remark */}
            <div className="note-row">
              <div className="note-col-full">
                <div className="field-label">備註</div>
                <div className="field-value field-value-remark">{driverRemark}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="note-footer">
            <div className="footer-text"></div>
            <div className="footer-text"></div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
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

        /* Header */
        .note-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 2px solid #000;
        }

        .note-title {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .title-text {
          font-size: 14px;
          font-weight: 700;
          line-height: 1.2;
        }

        .subtitle-text {
          font-size: 12px;
          font-weight: 500;
          line-height: 1.2;
        }

        .note-logo-container {
          display: flex;
          align-items: center;
        }

        .note-logo {
          height: 40px;
          width: auto;
        }

        /* Content */
        .note-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .note-row {
          display: flex;
          gap: 6px;
        }

        .note-col {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .note-col-full {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .field-label {
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .field-value {
          font-size: 14px;
          font-weight: 600;
          padding-bottom: 3px;
          border-bottom: 1px solid #000;
          min-height: 22px;
          display: flex;
          align-items: center;
        }

        .field-value-address {
          min-height: 35px;
          align-items: flex-start;
          word-wrap: break-word;
          overflow-wrap: break-word;
          font-size: 12px;
        }

        .field-value-remark {
          min-height: 30px;
          align-items: flex-start;
          word-wrap: break-word;
          overflow-wrap: break-word;
          font-size: 12px;
        }

        /* Footer */
        .note-footer {
          display: flex;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 6px;
          border-top: 1px solid #000;
        }

        .footer-text {
          font-size: 11px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
