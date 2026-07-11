import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import { useRoute, useLocation } from "wouter";
import DeliveryLabelCard, { buildLabelItemDetails } from "@/components/DeliveryLabelCard";

export default function LabelsPrint() {
  const [, params] = useRoute("/labels/:id");
  const [, setLocation] = useLocation();
  const orderIds = decodeURIComponent(params?.id || "").split(",").map((id) => id.trim()).filter(Boolean);
  const results = trpc.useQueries((t) => orderIds.map((id) => t.airtable.getOrderData(id)));
  const recordPrint = trpc.airtable.recordPrint.useMutation();
  const loading = results.some((result) => result.isLoading);
  const orders = results.map((result) => result.data).filter(Boolean) as any[];
  const handlePrint = async () => { await recordPrint.mutateAsync({ deliveryIds: orderIds }).catch(() => undefined); window.print(); };
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  const labels = orders.flatMap((data) => {
    const { order, packages = [], customer, orderItems = [] } = data;
    const totalBoxes = Number(order.fields["Total Pieces"] || packages.length || 1);
    const sourcePackages = packages.length ? packages : Array.from({ length: totalBoxes }, (_, index) => ({ id: `fallback-${index}`, fields: { "Box No": index + 1, Note: "" } }));
    const itemDetails = buildLabelItemDetails(orderItems);
    return sourcePackages.map((pkg: any, index: number) => ({
      key: `${order.id}-${pkg.id}`, shippingNo: order.fields["Shipping No"] || "N/A", orderNo: order.fields["Internal Order No"] || "N/A",
      customerNo: customer?.fields["Customer ID"] || "N/A", phone: customer?.fields.Phone || "N/A", address: customer?.fields.Address || "N/A",
      boxNo: pkg.fields["Box No"] || index + 1, totalBoxes, note: pkg.fields.Note || "", itemDetails,
    }));
  });
  if (!labels.length) return <div className="min-h-screen flex items-center justify-center">找不到訂單資料</div>;
  return <div className="min-h-screen bg-slate-100"><div className="no-print sticky top-0 z-10 bg-white border-b p-3 flex justify-between"><Button variant="outline" onClick={() => setLocation("/")}><ArrowLeft className="h-4 w-4 mr-2" />返回</Button><Button onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />打印全部 {labels.length} 張</Button></div><div className="py-8 flex flex-col items-center gap-8">{labels.map((label) => <DeliveryLabelCard key={label.key} label={label} />)}</div><style>{`@media print{.no-print{display:none!important}body{margin:0}.page-break:last-child{page-break-after:auto!important}}`}</style></div>;
}
