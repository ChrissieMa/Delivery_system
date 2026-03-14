import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import { useRoute, useLocation } from "wouter";
import { useRef } from "react";

export default function LabelsPrint() {
  const [, params] = useRoute("/labels/:id");
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

  const { order, packages, customer } = data;
  const totalBoxes = order.fields["Total Pieces"] || packages.length;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="no-print bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-600">共 {packages.length} 個標籤</span>
            <Button onClick={handlePrint} className="flex-1 sm:flex-none">
              <Printer className="w-4 h-4 mr-2" />
              打印所有標籤
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div ref={printRef} className="space-y-8">
          {packages.map((pkg) => {
            const boxNo = pkg.fields["Box No"] || 0;
            
            return (
              <div 
                key={pkg.id} 
                className="bg-white p-4 shadow-lg mx-auto border-4 border-slate-800 page-break"
                style={{ width: "105mm", height: "148mm", display: "flex", flexDirection: "column" }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="text-orange-600 font-bold text-xl">LKS</div>
                    <div className="text-orange-600 font-bold text-sm">DISPLAY BOX</div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col justify-between">
                  {/* Shipping Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-bold w-24 flex-shrink-0">Shipping No:</span>
                      <span className="font-semibold text-base">{order.fields["Shipping No"]}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-bold w-24 flex-shrink-0">Order:</span>
                      <span className="font-medium">{order.fields["Internal Order No"] || "N/A"}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-bold w-24 flex-shrink-0">Customer No:</span>
                      <span className="font-medium">{customer?.fields["Customer Code"] || "N/A"}</span>
                    </div>
                  </div>

                  {/* Box Number - Large */}
                  <div className="text-center my-4">
                    <div className="text-6xl font-bold text-slate-900 leading-none">
                      {boxNo} / {totalBoxes}
                    </div>
                    <div className="text-lg font-medium text-slate-600 mt-1">
                      Box {boxNo} of {totalBoxes}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-2 text-sm border-t-2 border-slate-300 pt-3">
                    <div className="flex items-center">
                      <span className="font-bold w-16 flex-shrink-0">Phone:</span>
                      <span className="font-medium">{customer?.fields.Phone || "N/A"}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-bold w-16 flex-shrink-0">Address:</span>
                      <span className="font-medium text-xs leading-tight flex-1 break-words">{customer?.fields.Address || "N/A"}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-3 pt-2 border-t border-slate-300 text-center text-xs text-slate-600">
                    Total Pieces: {totalBoxes}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .container { padding: 0; max-width: 100%; }
          .page-break {
            page-break-after: always;
            margin: 0;
          }
          .page-break:last-child {
            page-break-after: auto;
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
