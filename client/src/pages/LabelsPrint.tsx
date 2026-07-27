import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, ArrowLeft, FileDown, Share2 } from "lucide-react";
import { useRoute, useLocation } from "wouter";
import DeliveryLabelCard, { buildLabelItemDetails } from "@/components/DeliveryLabelCard";
import { createLabelsPdf, type DeliveryLabelData } from "@/lib/label-pdf";
import { toast } from "sonner";

type PreparedPdf = {
  blob: Blob;
  file: File;
  filename: string;
};

export default function LabelsPrint() {
  const [isCreatingPdf, setIsCreatingPdf] = useState(false);
  const [preparedPdf, setPreparedPdf] = useState<PreparedPdf | null>(null);
  const [, params] = useRoute("/labels/:id");
  const [, setLocation] = useLocation();
  const orderIds = decodeURIComponent(params?.id || "").split(",").map((id) => id.trim()).filter(Boolean);
  const results = trpc.useQueries((t) => orderIds.map((id) => t.airtable.getOrderData(id)));
  const recordPrint = trpc.airtable.recordPrint.useMutation();
  const loading = results.some((result) => result.isLoading);
  const orders = results.map((result) => result.data).filter(Boolean) as any[];
  const labels: DeliveryLabelData[] = orders.flatMap((data) => {
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

  const handlePrint = async () => {
    await recordPrint.mutateAsync({ deliveryIds: orderIds }).catch(() => undefined);
    window.print();
  };

  const downloadPdf = ({ blob, filename }: PreparedPdf) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    toast.success("Label PDF 已下載");
  };

  const sharePdf = async (pdf: PreparedPdf) => {
    const shareData: ShareData = {
      files: [pdf.file],
      title: "LKS Product Labels",
    };

    try {
      if (
        typeof navigator.share !== "function" ||
        typeof navigator.canShare !== "function" ||
        !navigator.canShare(shareData)
      ) {
        downloadPdf(pdf);
        return;
      }
      await navigator.share(shareData);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.warn("Unable to open the Label PDF share sheet", error);
      toast.info("PDF 已製作完成，請再按一次「分享 PDF」");
    }
  };

  const exportFixedPdf = async () => {
    setIsCreatingPdf(true);

    try {
      const pdfBlob = await createLabelsPdf(labels);
      await recordPrint.mutateAsync({ deliveryIds: orderIds }).catch(() => undefined);
      const filename = `LKS_Product_Labels_100x150_${new Date().toISOString().slice(0, 10)}.pdf`;
      const file = new File([pdfBlob], filename, { type: "application/pdf" });
      const nextPdf = { blob: pdfBlob, file, filename };
      setPreparedPdf(nextPdf);
      await sharePdf(nextPdf);
    } catch (error) {
      console.error("Unable to create fixed-size Product Label PDF", error);
      toast.error("Label PDF 製作失敗，請再試一次");
    } finally {
      setIsCreatingPdf(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!labels.length) return <div className="min-h-screen flex items-center justify-center">找不到訂單資料</div>;
  return <div className="min-h-screen bg-slate-100"><div className="no-print sticky top-0 z-10 bg-white border-b p-3 flex justify-between gap-2"><Button variant="outline" onClick={() => setLocation("/")}><ArrowLeft className="h-4 w-4 mr-2" />返回</Button><div className="flex flex-wrap justify-end gap-2"><Button variant="outline" className="hidden md:flex" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />電腦列印</Button>{preparedPdf ? <><Button onClick={() => sharePdf(preparedPdf)}><Share2 className="h-4 w-4 mr-2" />分享 PDF</Button><Button variant="outline" onClick={() => downloadPdf(preparedPdf)}><FileDown className="h-4 w-4 mr-2" />下載 PDF</Button></> : <Button onClick={exportFixedPdf} disabled={isCreatingPdf}>{isCreatingPdf ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}{isCreatingPdf ? "製作 Label PDF..." : `分享 100×150 PDF（${labels.length}張）`}</Button>}</div></div><div className="label-batch py-8 flex flex-col items-center gap-8">{labels.map((label: any) => <DeliveryLabelCard key={label.key} label={label} />)}</div><style>{`@page{size:100mm 150mm;margin:0}@media print{.no-print{display:none!important}html,body,#root{width:100mm!important;margin:0!important;padding:0!important;background:#fff!important}.label-batch{display:block!important;width:100mm!important;margin:0!important;padding:0!important}.page-break:last-child{break-after:auto!important;page-break-after:auto!important}}`}</style></div>;
}
