import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, PackagePlus, Truck } from "lucide-react";
import { toast } from "sonner";

type Draft = {
  totalPieces: string;
  totalWeight: string;
  deliveryDate: string;
  estimatedArrival: string;
  driverRemark: string;
};

const emptyDraft = (): Draft => ({
  totalPieces: "1",
  totalWeight: "",
  deliveryDate: "",
  estimatedArrival: "",
  driverRemark: "",
});

export default function PendingDeliveries() {
  const [, setLocation] = useLocation();
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const utils = trpc.useUtils();
  const { data: orders = [], isLoading } = trpc.airtable.listPendingDeliveryOrders.useQuery();
  const createDelivery = trpc.airtable.createDelivery.useMutation({
    onSuccess: async () => {
      toast.success("Delivery 及 Packages 已建立");
      await Promise.all([
        utils.airtable.listPendingDeliveryOrders.invalidate(),
        utils.airtable.listOrders.invalidate(),
      ]);
    },
    onError: (error) => toast.error(error.message || "建立 Delivery 失敗"),
  });

  const getDraft = (id: string) => drafts[id] || emptyDraft();
  const updateDraft = (id: string, patch: Partial<Draft>) => {
    setDrafts((current) => ({ ...current, [id]: { ...getDraft(id), ...patch } }));
  };

  const submit = (order: any) => {
    const draft = getDraft(order.id);
    const totalPieces = Number(draft.totalPieces);
    const totalWeight = Number(draft.totalWeight);
    if (!Number.isInteger(totalPieces) || totalPieces < 1) {
      toast.error("請輸入正確總件數");
      return;
    }
    if (!(totalWeight > 0)) {
      toast.error("請輸入總重量");
      return;
    }
    createDelivery.mutate({
      orderId: order.id,
      totalPieces,
      totalWeight,
      deliveryDate: draft.deliveryDate || undefined,
      estimatedArrival: draft.estimatedArrival || undefined,
      driverRemark: draft.driverRemark || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="container flex items-center justify-between gap-3 py-4">
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />返回 Delivery 列表
          </Button>
          <div className="text-right">
            <h1 className="text-xl font-bold text-slate-900">待處理送貨</h1>
            <p className="text-xs text-slate-500">只顯示已付款但未建立 Delivery 嘅 Order</p>
          </div>
        </div>
      </div>

      <div className="container space-y-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : orders.length === 0 ? (
          <Card className="p-10 text-center">
            <Truck className="mx-auto mb-3 h-10 w-10 text-green-600" />
            <p className="font-semibold">暫時冇待處理送貨</p>
          </Card>
        ) : orders.map((order: any) => {
          const fields = order.fields || {};
          const draft = getDraft(order.id);
          const orderNo = fields["Internal 1 Order No"] || fields["Internal Order No"] || order.id;
          const customerName = fields["Customer name(from Customer)"]?.[0] || "";
          const phone = fields["Phone (from Customer)"]?.[0] || "";
          const itemRefs = fields["Item Ref (from Order Items)"] || [];
          return (
            <Card key={order.id} className="p-4 md:p-5">
              <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row">
                <div>
                  <div className="text-xl font-bold text-orange-600">{orderNo}</div>
                  <div className="text-sm text-slate-600">{customerName} {phone ? `｜${phone}` : ""}</div>
                  <div className="mt-1 text-xs text-slate-500">Items：{itemRefs.length ? itemRefs.join("、") : "未有 Item Ref"}</div>
                </div>
                <div className="text-xs text-slate-500">財務月份：{fields["Order Month & Year"] || "跟原 Order"}</div>
              </div>

              <div className="grid gap-3 md:grid-cols-5">
                <label className="text-sm font-medium">總重量 KG *
                  <Input type="number" min="0.01" step="0.01" value={draft.totalWeight} onChange={(e) => updateDraft(order.id, { totalWeight: e.target.value })} />
                </label>
                <label className="text-sm font-medium">總件數 *
                  <Input type="number" min="1" step="1" value={draft.totalPieces} onChange={(e) => updateDraft(order.id, { totalPieces: e.target.value })} />
                </label>
                <label className="text-sm font-medium">上車日期
                  <Input type="date" value={draft.deliveryDate} onChange={(e) => updateDraft(order.id, { deliveryDate: e.target.value })} />
                </label>
                <label className="text-sm font-medium">預計送貨日期
                  <Input type="date" value={draft.estimatedArrival} onChange={(e) => updateDraft(order.id, { estimatedArrival: e.target.value })} />
                </label>
                <label className="text-sm font-medium">司機備註
                  <Input value={draft.driverRemark} onChange={(e) => updateDraft(order.id, { driverRemark: e.target.value })} placeholder="可留空" />
                </label>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">建立後會自動產生 {Math.max(1, Number(draft.totalPieces) || 1)} 個 Packages。</p>
                <Button disabled={createDelivery.isPending} onClick={() => submit(order)} className="bg-orange-600 hover:bg-orange-700">
                  {createDelivery.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackagePlus className="mr-2 h-4 w-4" />}
                  建立 Delivery
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
