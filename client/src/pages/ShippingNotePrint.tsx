import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import { useRoute, useLocation } from "wouter";
import { useRef } from "react";

export default function ShippingNotePrint() {
  const [, params] = useRoute("/shipping/:id");
  const [, setLocation] = useLocation();
  const printRef = useRef<HTMLDivElement>(null);
  
  const { data, isLoading } = trpc.airtable.getOrderData.useQuery(params?.id || "");

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>找不到訂單數據</p>
      </div>
    );
  }

  const { order, orderItems, customer } = data;
  const shippingIncluded = order.fields["Shipping Paid By"] === "Shipping included";

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="no-print bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
          <Button onClick={handlePrint} className="w-full sm:w-auto">
            <Printer className="w-4 h-4 mr-2" />
            打印送貨單
          </Button>
        </div>
      </div>

      <div className="container py-8">
        <div ref={printRef} className="bg-white p-6 shadow-lg mx-auto border-2 border-slate-300" style={{ width: "148mm", minHeight: "210mm" }}>
          {/* Header */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-slate-300">
            <div className="flex items-center gap-4">
              <div className="text-orange-600 font-bold text-3xl">LKS</div>
              <div className="text-orange-600 font-bold text-xl">DISPLAY BOX</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold mb-2">LKS Display Box</div>
              <div className="text-sm">香港九龍觀塘成業街7號寧晉中心35樓G1室</div>
              <div className="text-sm">Phone No: 68983722 E-mail: lksdisplaybox@gmail.com</div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-6">送貨單 Shipping Note</h1>

          {/* Order Info Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6 text-sm border-2 border-slate-300 p-4">
            <div className="flex">
              <span className="font-medium w-32">運輸號碼：</span>
                    <span className="flex-1 border-b border-slate-400">{order.fields["Shipping No"]}</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32">運輸方式：</span>
              <span className="flex-1 border-b border-slate-400">LKS車隊</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32">Order No.：</span>
                    <span className="flex-1 border-b border-slate-400">{order.fields["Internal Order No"] || "N/A"}</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32">上車日期：</span>
              <span className="flex-1 border-b border-slate-400">{order.fields["Delivery Date"] || "2026.1.26"}</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32">客戶號碼：</span>
              <span className="flex-1 border-b border-slate-400">{customer?.fields["Customer ID"]}</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32">預計到貨日：</span>
              <span className="flex-1 border-b border-slate-400">請與司機相約送貨時間</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32">客人姓名：</span>
              <span className="flex-1 border-b border-slate-400">{customer?.fields["Customer Name"]}</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32">客人電話：</span>
              <span className="flex-1 border-b border-slate-400">{customer?.fields.Phone}</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32">送貨電話：</span>
              <span className="flex-1 border-b border-slate-400">{customer?.fields["Delivery Phone"] || customer?.fields.Phone}</span>
            </div>
            <div className="flex col-span-2">
              <span className="font-medium w-32">送貨地址：</span>
              <span className="flex-1 border-b border-slate-400">{customer?.fields.Address}</span>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-6 border-2 border-slate-300 text-sm">
            <thead>
              <tr className="border-b-2 border-slate-300">
                <th className="border-r border-slate-300 p-3 font-bold text-center w-16">項目</th>
                <th className="border-r border-slate-300 p-3 font-bold text-center">內容</th>
                <th className="border-r border-slate-300 p-3 font-bold text-center w-24">件數</th>
                <th className="p-3 font-bold text-center w-24">重量</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-300">
                  <td className="border-r border-slate-300 p-3 text-center">{index + 1}</td>
                  <td className="border-r border-slate-300 p-3">
                    <div className="whitespace-pre-line">{item.fields.Description || item.fields["Item Ref"]}</div>
                  </td>
                  <td className="border-r border-slate-300 p-3 text-center">{item.fields.QTY || 0}</td>
                  <td className="p-3 text-center">{((item.fields.QTY || 0) * 0.2).toFixed(1)} KG</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Notes Section */}
          <div className="mb-6 text-xs border-2 border-slate-300 p-4">
            <div className="font-bold mb-2">客戶注意事項：</div>
            <div className="space-y-1">
              <div>I. 由送貨起計，三天內包補板</div>
              <div>II. 過左三天後才發現有爆板請盡購置壞板。</div>
              <div>III. 如發現強行安裝而弄壞或損壞，恕不會補發！</div>
              <div>IIII. 如客戶要求LKS 司機在收貨地址以外地方收貨，均不會為爆板板件補發。</div>
              <div>II. 由2022年8月開始，所有運費也使用電子付款支付，可使用消費券。</div>
              <div>III. 司機大約會在兩天內聯絡，請耐心等待司機聯絡相約送貨時間。</div>
              <div>IIII. LKS Display Box 保留最終決定權。</div>
            </div>
          </div>

          {/* Footer */}
          <div className="grid grid-cols-2 gap-8 text-sm border-2 border-slate-300 p-4">
            <div className="space-y-2">
              <div className="flex">
                <span className="font-medium w-24">負責司機：</span>
                <span className="flex-1 border-b border-slate-400">Hung</span>
              </div>
              <div className="flex">
                <span className="font-medium w-24">負責同事：</span>
                <span className="flex-1 border-b border-slate-400">Chrissie</span>
              </div>
              <div className="flex">
                <span className="font-medium w-24">簽署：</span>
                <span className="flex-1 border-b border-slate-400"></span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex">
                <span className="font-medium w-24">總重量：</span>
                <span className="flex-1 border-b border-slate-400">{order.fields["Total Weight"] || 0} KG</span>
              </div>
              <div className="flex">
                <span className="font-medium w-24">運費：</span>
                <span className="flex-1 border-b border-slate-400">
                  {shippingIncluded ? "Shipping included" : `HK$ ${order.fields["Customer Shipping Fee"] || 0}`}
                </span>
              </div>
              <div className="flex">
                <span className="font-medium w-24">客戶簽名：</span>
                <span className="flex-1 border-b border-slate-400"></span>
              </div>
            </div>
          </div>

          <div className="text-right mt-4 text-sm">客戶存根</div>
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .container { padding: 0; max-width: 100%; }
          @page {
            size: A5;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
