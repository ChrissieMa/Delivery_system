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
      levels: f["No. of Levels"] ? `${f["No. of Levels"]}層${f["Level Heights"] ? `｜層高 ${f["Level Heights"]}` : ""}` : "",
      accessories,
    };
  });
}

export default function DeliveryLabelCard({ label }: { label: any }) {
  const itemDetails = label.itemDetails || [];
  const accessoryLength = itemDetails.reduce((sum: number, item: any) => sum + item.accessories.join("、").length, 0);
  const density = itemDetails.length > 2 || accessoryLength > 90 ? "dense" : itemDetails.length > 1 || accessoryLength > 55 ? "compact" : "normal";

  return (
    <div className={`lks-label page-break ${density}`}>
      <header className="label-header">
        <img src="/lks-logo.png" alt="LKS Display Box" />
        <div className="label-heading">
          <div className="brand">LKS DISPLAY BOX</div>
          <div className="subtitle">Package Detail</div>
        </div>
      </header>

      <section className="reference-section">
        <div><span>Shipping No.</span><strong>{label.shippingNo}</strong></div>
        <div><span>Order No.</span><strong>{label.orderNo}</strong></div>
      </section>

      <section className="piece-section">
        <div className="piece-number">{label.boxNo}/{label.totalBoxes}</div>
        <div className="piece-caption">Total Pieces：{label.totalBoxes}</div>
      </section>

      <section className="items-section">
        {itemDetails.map((item: any) => (
          <div key={item.key} className="item-detail">
            <div className="item-type">{item.itemType}</div>
            <div>內尺寸　{item.dimensions}{item.levels ? `｜${item.levels}` : ""}</div>
            <div>配件：{item.accessories.length ? item.accessories.join("、") : "無"}</div>
          </div>
        ))}
        {!itemDetails.length ? <div className="item-detail"><div className="item-type">Package</div></div> : null}
      </section>

      {label.note ? <div className="package-note">⚠ Package Note：{label.note}</div> : null}

      <section className="contact-section">
        <div className="contact-row"><span>Customer No.</span><strong>{label.customerNo}</strong></div>
        <div className="contact-row"><span>Phone No.</span><strong>{label.phone}</strong></div>
        <div className="contact-row address"><span>Address</span><strong>{label.address}</strong></div>
      </section>

      <footer>Total Pieces：{label.totalBoxes}</footer>

      <style>{`
        .lks-label{width:100mm;height:150mm;box-sizing:border-box;background:#fff;color:#111;padding:5.5mm 6mm 4.5mm;display:flex;flex-direction:column;overflow:hidden;font-family:Arial,"Noto Sans TC","Microsoft JhengHei",sans-serif}
        .label-header{height:19mm;flex:0 0 19mm;display:flex;align-items:center;border-bottom:.55mm solid #555;padding-bottom:2mm;box-sizing:border-box}.label-header img{width:23mm;height:14mm;object-fit:contain;flex:0 0 23mm}.label-heading{flex:1;text-align:right;min-width:0}.brand{font-size:20pt;line-height:1;font-weight:900;white-space:nowrap}.subtitle{font-size:12.5pt;line-height:1.15;font-weight:700;margin-top:1mm}
        .reference-section{flex:0 0 13mm;padding:2.5mm 7mm 1mm;box-sizing:border-box;font-size:12.5pt;font-weight:700;line-height:1.25}.reference-section>div{display:grid;grid-template-columns:29mm 1fr;gap:2mm}.reference-section span{text-align:left}.reference-section strong{white-space:nowrap}
        .piece-section{flex:0 0 38mm;text-align:center;display:flex;flex-direction:column;justify-content:center}.piece-number{font-size:78pt;font-weight:900;line-height:.82;letter-spacing:-3pt;white-space:nowrap}.piece-caption{font-size:12pt;line-height:1.1;margin-top:2mm}
        .items-section{min-height:23mm;max-height:34mm;border:.65mm solid #222;padding:2mm 3mm;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;gap:1.5mm;overflow:hidden;text-align:center;font-size:12.5pt;font-weight:700;line-height:1.22}.item-detail+.item-detail{border-top:.3mm solid #999;padding-top:1.5mm}.item-type{font-size:14pt;font-weight:900;margin-bottom:.5mm}.compact .items-section{font-size:10.8pt;line-height:1.18}.compact .item-type{font-size:12pt}.dense .items-section{font-size:9.2pt;line-height:1.12;gap:.8mm;padding:1.3mm 2mm}.dense .item-type{font-size:10.5pt;margin-bottom:.2mm}.dense .item-detail+.item-detail{padding-top:.8mm}
        .package-note{flex:0 0 auto;margin-top:1.5mm;border:.45mm solid #e46141;background:#fff7ed;padding:1.2mm 2mm;box-sizing:border-box;font-size:10.5pt;font-weight:800;color:#c2410c;line-height:1.2}
        .contact-section{flex:0 0 auto;padding:3mm 5mm 1.5mm;font-size:11.5pt;font-weight:700;line-height:1.25}.contact-row{display:grid;grid-template-columns:30mm 1fr;gap:2mm;margin-bottom:.8mm}.contact-row span{text-align:left}.contact-row strong{word-break:break-word}.contact-row.address strong{font-size:10.5pt;line-height:1.2}
        footer{margin-top:auto;border-top:.45mm solid #555;padding-top:2mm;text-align:center;font-size:11.5pt;line-height:1.1}
        @media print{.lks-label{width:100mm!important;height:150mm!important;margin:0!important;page-break-after:always!important}@page{size:100mm 150mm;margin:0}}
      `}</style>
    </div>
  );
}
