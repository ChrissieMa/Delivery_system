import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Printer, Download, ArrowLeft } from "lucide-react";

export default function InvoicePrint() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/invoice/:id");
  const orderId = params?.id;

  const { data: order, isLoading } = trpc.airtable.getOrderData.useQuery(
    orderId || "",
    { enabled: !!orderId }
  );

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
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
  const orderItems = order.orderItems || [];
  const orderData = order.order?.fields as any;

  // Safe number formatting helper
  const formatMoney = (value: any): string => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  // Calculate amounts with safe parsing
  const subTotal = orderItems.reduce((sum: number, item: any) => {
    const amount = parseFloat(item.fields?.Amount) || 0;
    return sum + amount;
  }, 0);
  const discount = parseFloat(orderData?.Discount) || 0;
  const total = parseFloat(orderData?.['Final Amount']) || (subTotal - discount);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Action Buttons - Hidden when printing */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex gap-2 justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation("/")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handlePrint}
            size="sm"
            className="flex items-center gap-2 bg-[#E67E22] hover:bg-[#D35400] text-white"
          >
            <Printer className="h-4 w-4" />
            打印
          </Button>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            下載 PDF
          </Button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="print-container">
        <div className="print-page">
          {/* Header */}
          <table style={{ width: '100%', marginBottom: '15px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ width: '50%', verticalAlign: 'top' }}>
                  <img 
                    src="/lks-logo.png" 
                    alt="LKS Display Box" 
                    style={{ height: '50px', marginBottom: '8px' }}
                  />
                  <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
                    <div>香港九龍觀塘成業街7號寧晉中心35樓G1室</div>
                    <div>Phone: 68983722</div>
                    <div>Email: lksdisplaybox@gmail.com</div>
                  </div>
                </td>
                <td style={{ width: '50%', textAlign: 'right', verticalAlign: 'top' }}>
                  <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#E67E22', margin: '0 0 8px 0' }}>INVOICE</h1>
                  <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
                    <div><strong>Invoice Date:</strong> {delivery?.['Invoice Date'] || 'N/A'}</div>
                    <div><strong>P.O.#:</strong> {delivery?.['Customer Ref'] || 'N/A'}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Bill To */}
          <div style={{ marginBottom: '12px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: '#E67E22', margin: '0 0 6px 0', borderBottom: '2px solid #E67E22', paddingBottom: '3px' }}>BILL TO</h2>
            <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
              <div><strong>Customer ID:</strong> {customer?.['Customer Code'] || 'N/A'}</div>
              <div><strong>Customer Name:</strong> {customer?.['Customer Name'] || 'N/A'}</div>
              <div><strong>Phone:</strong> {customer?.['Phone'] || 'N/A'}</div>
              <div><strong>Address:</strong> {customer?.['Address'] || 'N/A'}</div>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', marginBottom: '12px', borderCollapse: 'collapse', fontSize: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#E67E22', color: 'white' }}>
                <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left', width: '30px' }}>#</th>
                <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left' }}>ITEM & DESCRIPTION</th>
                <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right', width: '50px' }}>QTY</th>
                <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right', width: '80px' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.length > 0 ? (
                orderItems.map((item: any, index: number) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>{index + 1}</td>
                    <td style={{ border: '1px solid #ddd', padding: '6px' }}>{item.fields?.Description || 'N/A'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right' }}>{item.fields?.QTY || 0}</td>
                    <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right' }}>HK$ {formatMoney(item.fields?.Amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                    No items
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <div style={{ width: '250px' }}>
              <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px', borderBottom: '1px solid #ddd' }}><strong>Sub Total:</strong></td>
                    <td style={{ padding: '6px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>HK$ {formatMoney(subTotal)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px', borderBottom: '1px solid #ddd' }}><strong>Discount:</strong></td>
                    <td style={{ padding: '6px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>HK$ {formatMoney(discount)}</td>
                  </tr>
                  <tr style={{ backgroundColor: '#E67E22', color: 'white', fontWeight: 'bold' }}>
                    <td style={{ padding: '8px' }}>TOTAL:</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>HK$ {formatMoney(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '10px', fontSize: '10px' }}>
            <h3 style={{ fontWeight: 'bold', color: '#E67E22', margin: '0 0 4px 0' }}>Notes:</h3>
            <p style={{ margin: 0 }}>Thank you for your support.</p>
          </div>

          {/* Terms & Conditions */}
          <div style={{ borderTop: '2px solid #ddd', paddingTop: '8px', fontSize: '8px', lineHeight: '1.3' }}>
            <h3 style={{ fontWeight: 'bold', color: '#E67E22', margin: '0 0 6px 0' }}>Terms & Conditions</h3>
            
            <div style={{ marginBottom: '6px' }}>
              <p style={{ margin: '0 0 2px 0', fontWeight: 'bold' }}>度身訂造</p>
              <p style={{ margin: '0 0 2px 0' }}>A. 所有我們的展示盒和展示櫃均為度身訂造，根據您的要求進行設計製作。每個訂單都是獨一無二的，根據您提供的具體規格進行定制。</p>
              <p style={{ margin: '0 0 2px 0' }}>B. 所有訂製產品均需要客戶提供尺寸，我們會提供尺寸參考，但並不一定代表此尺寸為最適合的尺寸，閣下應自行確認所需尺寸。</p>
              <p style={{ margin: '0 0 2px 0' }}>C. 我們以交付高質量的客製化產品為榮。然而，請注意，由於手工製作的特性和材料本身的特點，顏色、質地或尺寸可能會出現輕微的變化。這些變化不構成瑕疵，應視為客製化產品獨特魅力的一部分。</p>
              <p style={{ margin: '0 0 2px 0' }}>D. 由於客製化產品的個性化特點，一般情況下，一旦開始生產，將不接受取消或退貨，除非存在製造缺陷或運送過程中的損壞。請在下單前仔細審查和確認所有訂單細節。</p>
            </div>
            
            <div style={{ marginBottom: '6px' }}>
              <p style={{ margin: '0 0 2px 0', fontWeight: 'bold' }}>訂單</p>
              <p style={{ margin: '0 0 2px 0' }}>A. 所有商品均以港幣作為結帳貨幣單位。</p>
              <p style={{ margin: '0 0 2px 0' }}>B. 顧客在本網站或經電話提交訂單後，即會被視為同意接受本銷售條款並受其約束。</p>
              <p style={{ margin: '0 0 2px 0' }}>C. 訂單一經確認，將形成具有法律約束力的合同。</p>
              <p style={{ margin: '0 0 2px 0' }}>D. 顧客應在實際商品送抵前支付所有金額。</p>
            </div>

            <div style={{ marginBottom: '6px' }}>
              <p style={{ margin: '0 0 2px 0', fontWeight: 'bold' }}>送貨服務</p>
              <p style={{ margin: '0 0 2px 0' }}>A. 使用LKS車隊送貨均有三天內包補板，人為損壞除外。</p>
              <p style={{ margin: '0 0 2px 0' }}>B. 選擇其他速遞公司送貨，所有裂痕/損壞不設補板。</p>
              <p style={{ margin: '0 0 2px 0' }}>C. 所有送貨服務均［運費到付］，運費是由每件貨物重量計算，地區不限（偏遠地區除外)。</p>
            </div>

            <div style={{ marginBottom: '6px' }}>
              <p style={{ margin: '0 0 2px 0', fontWeight: 'bold' }}>適用法律</p>
              <p style={{ margin: 0 }}>本網站及條款與細則受香港法律約束並按香港法律解釋。</p>
            </div>

            <p style={{ margin: '6px 0 0 0', fontWeight: 'bold' }}>LKS Display Box保留解釋及修訂此服務之條款及細則之權利，如有任何爭議，本公司保留最終決定權。</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          .print-container {
            width: 100%;
            height: 100%;
          }
          
          .print-page {
            width: 210mm;
            height: 297mm;
            padding: 15mm;
            margin: 0;
            box-sizing: border-box;
            font-family: "Microsoft YaHei", "微軟正黑體", "SimHei", sans-serif;
          }
          
          @page {
            size: A4;
            margin: 0;
          }
        }
        
        @media screen {
          .print-container {
            padding: 2rem;
            display: flex;
            justify-content: center;
          }
          
          .print-page {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            box-sizing: border-box;
            font-family: "Microsoft YaHei", "微軟正黑體", "SimHei", sans-serif;
          }
        }
      `}</style>
    </div>
  );
}
