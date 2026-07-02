import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import { useRoute, useLocation } from "wouter";

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
  const hasError = queryResults.some((result) => result.error);
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

    // Some Delivery records do not have linked Package records. Single label print
    // already falls back to Total Pieces; batch label print should behave the same.
    const sourcePackages = packages.length
      ? packages
      : Array.from({ length: totalBoxes }, (_unused, index) => ({
          id: `fallback-${index + 1}`,
          fields: { "Box No": index + 1 },
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
        <div className="space-y-8">
          {allLabels.map((label) => (
            <div
              key={label.key}
              className="bg-white p-4 shadow-lg mx-auto border-4 border-slate-800 page-break"
              style={{ width: "105mm", height: "148mm", display: "flex", flexDirection: "column" }}
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="text-orange-600 font-bold text-xl">LKS</div>
                  <div className="text-orange-600 font-bold text-sm">DISPLAY BOX</div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="font-bold w-24 flex-shrink-0">Shipping No:</span>
                    <span className="font-semibold text-base">{label.shippingNo}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold w-24 flex-shrink-0">Order:</span>
                    <span className="font-medium">{label.orderNo}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold w-24 flex-shrink-0">Customer No:</span>
                    <span className="font-medium">{label.customerNo}</span>
                  </div>
                </div>

                <div className="text-center my-4">
                  <div className="text-6xl font-bold text-slate-900 leading-none">
                    {label.boxNo} / {label.totalBoxes}
                  </div>
                  <div className="text-lg font-medium text-slate-600 mt-1">
                    Box {label.boxNo} of {label.totalBoxes}
                  </div>
                </div>

                <div className="space-y-2 text-sm border-t-2 border-slate-300 pt-3">
                  <div className="flex items-center">
                    <span className="font-bold w-16 flex-shrink-0">Phone:</span>
                    <span className="font-medium">{label.phone}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-bold w-16 flex-shrink-0">Address:</span>
                    <span className="font-medium text-xs leading-tight flex-1 break-words">{label.address}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-300 text-center text-xs text-slate-600">
                  Total Pieces: {label.totalBoxes}
                </div>
              </div>
            </div>
          ))}
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
