import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import DriverNoteCard from "@/components/DriverNoteCard";

export default function DriverDeliveryNote() {
  const [, setLocation] = useLocation(); const [, params] = useRoute("/driver-note/:id"); const id = params?.id;
  const { data, isLoading } = trpc.airtable.getOrderData.useQuery(id || "", { enabled: !!id });
  const recordPrint = trpc.airtable.recordPrint.useMutation();
  const print = async () => { if (id) await recordPrint.mutateAsync({ deliveryIds: [id] }).catch(() => undefined); window.print(); };
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center">Order not found</div>;
  return <div className="min-h-screen bg-slate-100"><div className="no-print p-3 bg-white border-b flex justify-between"><Button variant="outline" onClick={() => setLocation("/")}><ArrowLeft className="h-4 w-4 mr-2" />返回</Button><Button onClick={print}><Printer className="h-4 w-4 mr-2" />打印</Button></div><div className="py-8 flex justify-center"><DriverNoteCard data={data} /></div><style>{`@media print{.no-print{display:none!important}body{margin:0}}`}</style></div>;
}
