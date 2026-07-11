import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import DriverNoteCard from "@/components/DriverNoteCard";

export default function BatchDriverNotes() {
  const [, setLocation] = useLocation(); const [, params] = useRoute("/driver-notes/:ids");
  const ids = decodeURIComponent(params?.ids || "").split(",").map((id) => id.trim()).filter(Boolean);
  const results = trpc.useQueries((t) => ids.map((id) => t.airtable.getOrderData(id)));
  const recordPrint = trpc.airtable.recordPrint.useMutation(); const loading = results.some((r) => r.isLoading); const orders = results.map((r) => r.data).filter(Boolean) as any[];
  const print = async () => { await recordPrint.mutateAsync({ deliveryIds: ids }).catch(() => undefined); window.print(); };
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!orders.length) return <div className="min-h-screen flex items-center justify-center">Order not found</div>;
  return <div className="min-h-screen bg-slate-100"><div className="no-print p-3 bg-white border-b flex justify-between"><Button variant="outline" onClick={() => setLocation("/")}><ArrowLeft className="h-4 w-4 mr-2" />返回</Button><Button onClick={print}><Printer className="h-4 w-4 mr-2" />打印全部</Button></div><div className="py-8 flex flex-col items-center gap-8">{orders.map((data) => <DriverNoteCard key={data.order.id} data={data} />)}</div><style>{`@media print{.no-print{display:none!important}body{margin:0}.page-break:last-child{page-break-after:auto!important}}`}</style></div>;
}
