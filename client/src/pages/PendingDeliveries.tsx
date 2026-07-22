import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, PackagePlus, Truck, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import {
  accessoriesOf,
  chinaFreightPackages,
  chinaFreightWeight,
  defaultBasePackages,
  hasLight,
  positiveNumber,
  totalPackagesForItems,
} from "@/lib/pendingDelivery";

type Draft = {
  itemWeights: Record<string, string>;
  basePackages: Record<string, string>;
  packageNotes: string[];
  deliveryDate: string;
  estimatedArrival: string;
  driverRemark: string;
};

const itemName = (item: any) => item.fields?.["Item No"] || item.fields?.["Item Ref"] || item.id;

const buildDraft = (items: any[]): Draft => ({
  itemWeights: Object.fromEntries(items.map((item) => [
    item.id,
    String(chinaFreightWeight(item) ?? positiveNumber(item.fields?.["Estimated HK Delivery Weight KG"]) ?? ""),
  ])),
  basePackages: Object.fromEntries(items.map((item) => [
    item.id,
    String(chinaFreightPackages(item) ?? defaultBasePackages(item)),
  ])),
  packageNotes: [],
  deliveryDate: "",
  estimatedArrival: "",
  driverRemark: "",
});

export default function PendingDeliveries() {
  const [, setLocation] = useLocation();
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const utils = trpc.useUtils();
  const { data: entries = [], isLoading } = trpc.airtable.listPendingDeliveryOrders.useQuery();
  const createDelivery = trpc.airtable.createDelivery.useMutation({
    onSuccess: async () => {
      toast.success("Delivery 及 Packages 已建立");
      await Promise.all([utils.airtable.listPendingDeliveryOrders.invalidate(), utils.airtable.listOrders.invalidate()]);
    },
    onError: (error) => toast.error(error.message || "建立 Delivery 失敗", { duration: 10000 }),
  });

  const getDraft = (orderId: string, items: any[]) => drafts[orderId] || buildDraft(items);
  const updateDraft = (orderId: string, items: any[], updater: (draft: Draft) => Draft) => {
    setDrafts((current) => ({ ...current, [orderId]: updater(current[orderId] || buildDraft(items)) }));
  };

  const packageCount = (items: any[], draft: Draft) => totalPackagesForItems(items, draft.basePackages);

  const submit = (entry: any) => {
    const order = entry.order;
    const items = entry.orderItems || [];
    const draft = getDraft(order.id, items);
    if (items.some((item: any) => !(Number(draft.itemWeights[item.id]) > 0))) {
      toast.error("請逐個 Item 輸入重量");
      return;
    }
    createDelivery.mutate({
      orderId: order.id,
      items: items.map((item: any) => ({
        id: item.id,
        weight: Number(draft.itemWeights[item.id]),
        basePackages: Math.max(1, Math.floor(Number(draft.basePackages[item.id]) || 1)),
      })),
      packageNotes: Array.from({ length: packageCount(items, draft) }, (_, index) => draft.packageNotes[index] || ""),
      deliveryDate: draft.deliveryDate || undefined,
      estimatedArrival: draft.estimatedArrival || undefined,
      driverRemark: draft.driverRemark || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="container flex items-center justify-between gap-3 py-4">
          <Button variant="ghost" onClick={() => setLocation("/")}><ArrowLeft className="mr-2 h-4 w-4" />返回列表</Button>
          <div className="text-right"><h1 className="text-xl font-bold">待處理送貨</h1><p className="text-xs text-slate-500">Paid、未有 Delivery</p></div>
        </div>
      </div>

      <div className="container space-y-5 py-6">
        {isLoading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
        : entries.length === 0 ? <Card className="p-10 text-center"><Truck className="mx-auto mb-3 h-10 w-10 text-green-600" /><p className="font-semibold">暫時冇待處理送貨</p></Card>
        : entries.map((entry: any) => {
          const order = entry.order;
          const items = entry.orderItems || [];
          const fields = order.fields || {};
          const draft = getDraft(order.id, items);
          const pieces = packageCount(items, draft);
          const totalWeight = items.reduce((sum: number, item: any) => sum + (Number(draft.itemWeights[item.id]) || 0), 0);
          return (
            <Card key={order.id} className="p-4 md:p-5">
              <div className="mb-4 flex justify-between gap-3">
                <div><div className="text-xl font-bold text-orange-600">{fields["Internal 1 Order No"] || fields["Internal Order No"]}</div><div className="text-sm text-slate-600">{fields["Customer name(from Customer)"]?.[0] || ""}｜{fields["Phone (from Customer)"]?.[0] || ""}</div></div>
                <div className="text-right text-sm"><div>總重量：<b>{totalWeight.toFixed(2)} KG</b></div><div>總 Packages：<b>{pieces}</b></div></div>
              </div>

              <div className="space-y-3">
                {items.map((item: any) => {
                  const f = item.fields || {};
                  const accessories = accessoriesOf(item);
                  const light = hasLight(item);
                  const linkedWeight = chinaFreightWeight(item);
                  const linkedPackages = chinaFreightPackages(item);
                  return (
                    <div key={item.id} className="rounded-lg border bg-white p-3">
                      <div className="mb-2 font-bold">{itemName(item)}｜{f["Item Type"] || "Item"}</div>
                      <div className="mb-3 text-xs text-slate-600">內尺寸：{f["Inter L"] || "-"} × {f["Inter D"] || "-"} × {f["Inter H"] || "-"}cm　{f["No. of Levels"] ? `｜${f["No. of Levels"]}層` : ""}<br />配件：{accessories.join("、") || "無"}</div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="text-sm font-medium">
                          此 Item 重量 KG {linkedWeight === undefined ? "*" : ""}
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            disabled={linkedWeight !== undefined}
                            value={draft.itemWeights[item.id] || ""}
                            onChange={(e) => updateDraft(order.id, items, (d) => ({ ...d, itemWeights: { ...d.itemWeights, [item.id]: e.target.value } }))}
                          />
                          {linkedWeight !== undefined ? <span className="mt-1 block text-xs font-normal text-green-700">已由大陸運費輸入帶入</span> : <span className="mt-1 block text-xs font-normal text-amber-700">舊資料未有重量，請手動補入</span>}
                        </label>
                        <label className="text-sm font-medium">
                          主件 Packages
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            disabled={linkedPackages !== undefined}
                            value={draft.basePackages[item.id] || "1"}
                            onChange={(e) => updateDraft(order.id, items, (d) => ({ ...d, basePackages: { ...d.basePackages, [item.id]: e.target.value } }))}
                          />
                          {linkedPackages !== undefined ? <span className="mt-1 block text-xs font-normal text-green-700">已由大陸運費件數帶入</span> : <span className="mt-1 block text-xs font-normal text-amber-700">舊資料未有件數，請手動補入</span>}
                        </label>
                      </div>
                      {light ? <div className="mt-2 flex items-center gap-2 rounded bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800"><Lightbulb className="h-4 w-4" />偵測到燈配件：自動額外 +1 Package</div> : null}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-lg border bg-slate-50 p-3">
                <div className="mb-2 font-bold">Package Notes（可留空）</div>
                <div className="grid gap-2 md:grid-cols-2">
                  {Array.from({ length: pieces }, (_, index) => <label key={index} className="text-xs font-medium">Package {index + 1} / {pieces}<Input value={draft.packageNotes[index] || ""} placeholder="例如：燈件，請先開此箱" onChange={(e) => updateDraft(order.id, items, (d) => { const notes = [...d.packageNotes]; notes[index] = e.target.value; return { ...d, packageNotes: notes }; })} /></label>)}
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <label className="text-sm font-medium">上車日期<Input type="date" value={draft.deliveryDate} onChange={(e) => updateDraft(order.id, items, (d) => ({ ...d, deliveryDate: e.target.value }))} /></label>
                <label className="text-sm font-medium">預計送貨日期<Input type="date" value={draft.estimatedArrival} onChange={(e) => updateDraft(order.id, items, (d) => ({ ...d, estimatedArrival: e.target.value }))} /></label>
                <label className="text-sm font-medium">司機備註<Input value={draft.driverRemark} onChange={(e) => updateDraft(order.id, items, (d) => ({ ...d, driverRemark: e.target.value }))} /></label>
              </div>
              <div className="mt-4 flex justify-end"><Button disabled={createDelivery.isPending || items.length === 0} onClick={() => submit(entry)} className="bg-orange-600 hover:bg-orange-700">{createDelivery.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackagePlus className="mr-2 h-4 w-4" />}建立 Delivery＋{pieces} Packages</Button></div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
