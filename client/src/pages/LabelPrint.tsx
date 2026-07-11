import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import DeliveryLabelCard, { buildLabelItemDetails } from "@/components/DeliveryLabelCard";

export default function LabelPrint() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/label/:id");
  const orderId = params?.id;
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const { data, isLoading } = trpc.airtable.getOrderData.useQuery(orderId || "", { enabled: !!orderId && ready });
  const recordPrint = trpc.airtable.recordPrint.useMutation();
  const handlePrint = async () => { if (orderId) await recordPrint.mutateAsync({ deliveryIds: [orderId] }).catch(() => undefined); window.print(); };
  if (!ready) return null;
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center">Order not found</div>;
  const { order, packages = [], customer, orderItems = [] } = data;
  const totalBoxes = Number(order.fields["Total Pieces"] || packages.length || 1);
  const sourcePackages = packages.length ? packages : Array.from({ length: totalBoxes }, (_, index) => ({ id: `fallback-${index}`, fields: { "Box No": index + 1, Note: "" } }));
  const itemDetails = buildLabelItemDetails(orderItems);
  const labels = sourcePackages.map((pkg: any, index: number) => ({
    key: pkg.id,
    shippingNo: order.fields["Shipping No"] || "N/A", orderNo: order.fields["Internal Order No"] || "N/A",
    customerNo: customer?.fields["Customer ID"] || "N/A", phone: customer?.fields.Phone || "N/A", address: customer?.fields.Address || "N/A",
    boxNo: pkg.fields["Box No"] || index + 1, totalBoxes, note: pkg.fields.Note || "", itemDetails,
  }));
  return <div className="min-h-screen bg-slate-100"><div className="no-print sticky top-0 z-10 bg-white border-b p-3 flex justify-between"><Button variant="outline" onClick={() => setLocation("/")}><ArrowLeft className="h-4 w-4 mr-2" />返回</Button><Button onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />打印 {labels.length} 張</Button></div><div className="py-8 flex flex-col items-center gap-8">{labels.map((label) => <DeliveryLabelCard key={label.key} label={label} />)}</div><style>{`@media print{.no-print{display:none!important}body{margin:0}.page-break:last-child{page-break-after:auto!important}}`}</style></div>;
}
