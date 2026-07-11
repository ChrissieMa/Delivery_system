export function buildLabelItemDetails(orderItems: any[]) {
  return (orderItems || []).map((item: any) => {
    const f = item.fields || {};
    const rawType = String(f["Item Type"] || "");
    const itemType = rawType.includes("Display Case") ? "Display Case" : "Display Box";
    const accessories = Array.isArray(f.Accessories)
      ? f.Accessories.map(String)
      : String(f.Accessories || "").split(/[,，;\n]+/).map((value) => value.trim()).filter(Boolean);
    return {
      key: item.id,
      itemType,
      dimensions: `${f["Inter L"] || "-"} × ${f["Inter D"] || "-"} × ${f["Inter H"] || "-"}cm`,
      levels: f["No. of Levels"] ? `${f["No. of Levels"]}層` : "",
      accessories,
    };
  });
}

export default function DeliveryLabelCard({ label }: { label: any }) {
  return (
    <div className="lks-label page-break">
      <img src="/lks-logo.png" alt="LKS Display Box" className="label-logo" />
      <div className="label-title">LKS DISPLAY BOX</div>
      <div className="label-subtitle">Package Detail</div>
      <div className="label-rule top-rule" />

      <div className="shipping-label">Shipping No：</div>
      <div className="shipping-value">{label.shippingNo}</div>
      <div className="order-label">Order No.：</div>
      <div className="order-value">{label.orderNo}</div>

      <div className="piece-number">{label.boxNo}/{label.totalBoxes}</div>
      <div className="piece-total-top">Total Pieces：{label.totalBoxes}</div>

      <div className="item-box">
        <div className="item-lines">
          {(label.itemDetails || []).map((item: any) => (
            <div key={item.key} className="item-block">
              <div>{item.itemType}</div>
              <div>內尺寸 {item.dimensions}{item.levels ? `｜${item.levels}` : ""}</div>
              <div>配件：{item.accessories.length ? item.accessories.join("、") : "無"}</div>
            </div>
          ))}
          {label.note ? <div className="package-note">⚠ {label.note}</div> : null}
        </div>
      </div>

      <div className="customer-label">Customer No.：</div>
      <div className="customer-value">{label.customerNo}</div>
      <div className="phone-label">Phone No.：</div>
      <div className="phone-value">{label.phone}</div>
      <div className="address-label">Address：</div>
      <div className="address-value">{label.address}</div>

      <div className="label-rule bottom-rule" />
      <div className="piece-total-bottom">Total Pieces：{label.totalBoxes}</div>

      <style>{`
        .lks-label{position:relative;width:100mm;height:150mm;box-sizing:border-box;background:#fff;color:#000;overflow:hidden;font-family:Arial,Helvetica,sans-serif}
        .label-logo{position:absolute;left:4.7mm;top:4.6mm;width:20.1mm;height:13.7mm;object-fit:contain}
        .label-title{position:absolute;left:22.45mm;top:2.7mm;width:73.3mm;height:12mm;text-align:center;font-size:22.7pt;line-height:1.15;font-weight:700;white-space:nowrap}
        .label-subtitle{position:absolute;left:44.4mm;top:9.65mm;width:51.35mm;height:9.2mm;text-align:center;font-size:14.7pt;line-height:1.2;font-weight:700;white-space:nowrap}
        .label-rule{position:absolute;left:4.65mm;width:90.8mm;border-top:.45mm solid #555}.top-rule{top:22mm}.bottom-rule{top:137mm}
        .shipping-label,.order-label,.customer-label,.phone-label,.address-label{position:absolute;font-size:13.3pt;line-height:1.1;font-weight:700;text-align:right}
        .shipping-value,.order-value,.customer-value{position:absolute;font-size:13.3pt;line-height:1.1;font-weight:700}
        .phone-value,.address-value{position:absolute;font-size:12pt;line-height:1.15;font-weight:700}
        .shipping-label{left:4.6mm;top:24.35mm;width:27mm}.shipping-value{left:31.7mm;top:24.95mm;width:25mm}
        .order-label{left:4.6mm;top:28.95mm;width:26mm}.order-value{left:31.7mm;top:29.55mm;width:30mm}
        .piece-number{position:absolute;left:23.4mm;top:32.25mm;width:53.1mm;height:42.8mm;text-align:center;font-size:128pt;line-height:.95;font-weight:700;letter-spacing:-4pt;white-space:nowrap}
        .piece-total-top{position:absolute;left:8.25mm;top:67.1mm;width:83.5mm;text-align:center;font-size:13.3pt;line-height:1.1;font-weight:400}
        .item-box{position:absolute;left:6.45mm;top:78.2mm;width:87mm;height:24.25mm;border:.7mm solid #111;box-sizing:border-box;display:flex;align-items:center;justify-content:center;padding:1.5mm 3mm;overflow:hidden}
        .item-lines{width:100%;text-align:center;font-size:13.3pt;line-height:1.25;font-weight:700}.item-block+.item-block{margin-top:1.2mm;padding-top:1.2mm;border-top:.3mm solid #777}.package-note{margin-top:1mm;color:#d35400;font-size:11pt;font-weight:700}
        .customer-label{left:4.6mm;top:105.6mm;width:32.7mm}.customer-value{left:31.7mm;top:106.35mm;width:32mm}
        .phone-label{left:4.6mm;top:109.9mm;width:31.7mm}.phone-value{left:31.7mm;top:110.6mm;width:34mm}
        .address-label{left:4.6mm;top:114.8mm;width:31.7mm}.address-value{left:31.7mm;top:115mm;width:63mm;min-height:10mm;word-break:break-word}
        .piece-total-bottom{position:absolute;left:8.25mm;top:138.2mm;width:83.5mm;text-align:center;font-size:12pt;line-height:1.1;font-weight:400}
        @media print{.lks-label{width:100mm!important;height:150mm!important;margin:0!important;page-break-after:always!important}@page{size:100mm 150mm;margin:0}}
      `}</style>
    </div>
  );
}
