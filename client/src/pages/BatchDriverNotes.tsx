import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Loader2, FileDown } from "lucide-react";
import DriverNoteCard from "@/components/DriverNoteCard";
import { createDriverNotesPdf } from "@/lib/driver-note-pdf";
import { saveAs } from "file-saver";
import { toast } from "sonner";

export default function BatchDriverNotes() {
  const [isCreatingPdf, setIsCreatingPdf] = useState(false);
  const [, setLocation] = useLocation(); const [, params] = useRoute("/driver-notes/:ids");
  const ids = decodeURIComponent(params?.ids || "").split(",").map((id) => id.trim()).filter(Boolean);
  const results = trpc.useQueries((t) => ids.map((id) => t.airtable.getOrderData(id)));
  const recordPrint = trpc.airtable.recordPrint.useMutation(); const loading = results.some((r) => r.isLoading); const orders = results.map((r) => r.data).filter(Boolean) as any[];
  const print = async () => { await recordPrint.mutateAsync({ deliveryIds: ids }).catch(() => undefined); window.print(); };
  const exportFixedPdf = async () => {
    const pages = Array.from(document.querySelectorAll<HTMLElement>("[data-driver-note-page]"));
    setIsCreatingPdf(true);

    try {
      const pdfBlob = await createDriverNotesPdf(pages);
      await recordPrint.mutateAsync({ deliveryIds: ids }).catch(() => undefined);

      const filename = `LKS_Driver_Notes_100x150_${new Date().toISOString().slice(0, 10)}.pdf`;
      const pdfFile = new File([pdfBlob], filename, { type: "application/pdf" });
      const shareData: ShareData = { files: [pdfFile], title: "LKS Driver Delivery Notes" };

      if (
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare(shareData)
      ) {
        try {
          await navigator.share(shareData);
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
        }
      }

      saveAs(pdfBlob, filename);
      toast.success("100×150mm PDF 已下載");
    } catch (error) {
      console.error("Unable to create fixed-size Driver Note PDF", error);
      toast.error("PDF 製作失敗，請再試一次");
    } finally {
      setIsCreatingPdf(false);
    }
  };
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!orders.length) return <div className="min-h-screen flex items-center justify-center">Order not found</div>;
  return <div className="min-h-screen bg-slate-100"><div className="no-print p-3 bg-white border-b flex justify-between gap-2"><Button variant="outline" onClick={() => setLocation("/")}><ArrowLeft className="h-4 w-4 mr-2" />返回</Button><div className="flex gap-2"><Button variant="outline" className="hidden md:flex" onClick={print}><Printer className="h-4 w-4 mr-2" />電腦列印</Button><Button onClick={exportFixedPdf} disabled={isCreatingPdf}>{isCreatingPdf ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}{isCreatingPdf ? "製作 PDF..." : "分享 100×150 PDF"}</Button></div></div><div className="driver-note-batch py-8 flex flex-col items-center gap-8">{orders.map((data) => <DriverNoteCard key={data.order.id} data={data} />)}</div><style>{`@page{size:100mm 150mm;margin:0}@media print{.no-print{display:none!important}html,body,#root{width:100mm!important;margin:0!important;padding:0!important;background:#fff!important}.driver-note-batch{display:block!important;width:100mm!important;margin:0!important;padding:0!important}.page-break:last-child{break-after:auto!important;page-break-after:auto!important}}`}</style></div>;
}
