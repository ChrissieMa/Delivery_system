import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";

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

  const handlePrint = () => {
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

  // Get data from order
  const shippingNo = orderData?.['Shipping No'] || 'N/A';
  const orderNo = orderData?.['Internal Order No'] || 'N/A';
  const customerId = customer?.['Customer ID'] || customer?.['Customer Code'] || 'N/A';
  const customerName = customer?.['Customer Name'] || 'N/A';
  const phone = customer?.['Phone'] || 'N/A';
  const address = customer?.['Address'] || 'N/A';
  const totalPieces = parseInt(orderData?.['Total Pieces']) || 1;

  // Generate labels array with package notes
  const labels = Array.from({ length: totalPieces }, (_, i) => {
    const packageData = packages[i]?.fields as any;
    return {
      labelNum: i + 1,
      note: packageData?.['Note'] || ''
    };
  });

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
            打印 {totalPieces} 張
          </Button>
        </div>
      </div>

      {/* Labels Container */}
      <div className="label-container">
        {labels.map((label) => (
          <div key={label.labelNum} className="label-page">
            {/* Header with Title and Logo */}
            <div className="label-header">
              <div className="label-title">
                <div className="title-line">LKS Display Box</div>
                <div className="title-line">Shipping Note</div>
              </div>
              <div className="label-logo-container">
                <img
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663253730031/UjVLCiWwuWacGoGL.png"
                  alt="LKS Display Box"
                  className="label-logo"
                />
              </div>
            </div>

            {/* Content Grid */}
            <div className="label-content">
              {/* Row 1: Order No and Shipping No */}
              <div className="label-row">
                <div className="label-col">
                  <div className="field-label">Order No.</div>
                  <div className="field-value">{orderNo}</div>
                </div>
                <div className="label-col">
                  <div className="field-label">運輸單號</div>
                  <div className="field-value">{shippingNo}</div>
                </div>
              </div>

              {/* Row 2: Customer ID and Customer Name */}
              <div className="label-row">
                <div className="label-col">
                  <div className="field-label">客戶號碼</div>
                  <div className="field-value">{customerId}</div>
                </div>
                <div className="label-col">
                  <div className="field-label">客人姓名</div>
                  <div className="field-value">{customerName}</div>
                </div>
              </div>

              {/* Row 3: Phone */}
              <div className="label-row">
                <div className="label-col">
                  <div className="field-label">送貨電話</div>
                  <div className="field-value">{phone}</div>
                </div>
                <div className="label-col">
                  <div className="field-label">客人電話</div>
                  <div className="field-value">{phone}</div>
                </div>
              </div>

              {/* Row 4: Address (full width) */}
              <div className="label-row">
                <div className="label-col-full">
                  <div className="field-label">送貨地址</div>
                  <div className="field-value field-value-address">{address}</div>
                </div>
              </div>

              {/* Row 5: Notes and Total Pieces */}
              <div className="label-row">
                <div className="label-col">
                  <div className="field-label">備註</div>
                  <div className="field-value field-value-note">{label.note}</div>
                </div>
                <div className="label-col">
                  <div className="field-label">件數</div>
                  <div className="field-label-center">總數</div>
                  <div className="field-value-pieces">{label.labelNum} / {totalPieces}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
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
          
          .label-container {
            width: 100%;
            height: 100%;
          }
          
          .label-page {
            width: 100mm;
            height: 150mm;
            padding: 8mm;
            margin: 0;
            box-sizing: border-box;
            font-family: "Noto Sans TC", "Microsoft YaHei", "微軟正黑體", "SimHei", sans-serif;
            page-break-after: always;
            display: block;
          }
          
          .label-page:last-child {
            page-break-after: auto;
          }
          
          @page {
            size: 100mm 150mm;
            margin: 0;
          }
        }
        
        @media screen {
          .label-container {
            padding: 0.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
          
          .label-page {
            width: 100%;
            max-width: 380px;
            padding: 16px;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            box-sizing: border-box;
            font-family: "Noto Sans TC", "Microsoft YaHei", "微軟正黑體", "SimHei", sans-serif;
            border-radius: 4px;
          }
        }

        /* Header */
        .label-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 6px;
          border-bottom: 2px solid #000;
        }

        .label-title {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .title-line {
          font-size: 16px;
          font-weight: 500;
          line-height: 1.2;
        }

        .label-logo-container {
          display: flex;
          align-items: center;
        }

        .label-logo {
          height: 45px;
          width: auto;
        }

        /* Content Grid */
        .label-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .label-row {
          display: flex;
          gap: 8px;
        }

        .label-col {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .label-col-full {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .field-label {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .field-label-center {
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          margin: 4px 0;
        }

        .field-value {
          font-size: 16px;
          font-weight: 700;
          padding-bottom: 4px;
          border-bottom: 1px solid #000;
          min-height: 28px;
          display: flex;
          align-items: center;
        }

        .field-value-address {
          min-height: 35px;
          align-items: flex-start;
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: pre-wrap;
          font-size: 14px;
        }

        .field-value-note {
          min-height: 50px;
          align-items: flex-start;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .field-value-pieces {
          font-size: 32px;
          font-weight: 700;
          text-align: center;
          padding: 8px 0;
          border-bottom: 1px solid #000;
        }
      `}</style>
    </div>
  );
}
