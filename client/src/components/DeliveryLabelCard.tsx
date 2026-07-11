const LOGO_URL = "/lks-logo.png";

export function buildLabelItemDetails(orderItems: any[]) {
  return (orderItems || []).map((item: any) => {
    const f = item.fields || {};
    const accessories = Array.isArray(f.Accessories) ? f.Accessories.map(String) : String(f.Accessories || "").split(/[,，;\n]+/).filter(Boolean);
    return {
      key: item.id,
      itemType: f["Item Type"] || "Item",
      dimensions: `${f["Inter L"] || "-"} × ${f["Inter D"] || "-"} × ${f["Inter H"] || "-"}cm`,
      levels: f["No. of Levels"] ? `${f["No. of Levels"]}層${f["Level Heights"] ? `｜層高 ${f["Level Heights"]}` : ""}` : "",
      accessories,
    };
  });
}

export default function DeliveryLabelCard({ label }: { label: any }) {
  return (
    <div className="lks-label-card page-break">
      <div className="lks-label-header">
        <div className="lks-label-brand">LKS DISPLAY BOX</div>
        <img src={LOGO_URL} alt="LKS Display Box" className="lks-label-logo" />
      </div>
      <div className="lks-label-refs">
        <b>Shipping：{label.shippingNo}</b><span>Order：{label.orderNo}</span><span>Customer：{label.customerNo}</span>
      </div>
      <div className="lks-label-box"><strong>{label.boxNo} / {label.totalBoxes}</strong><span>BOX</span></div>
      <div className="lks-label-items">
        {(label.itemDetails || []).map((item: any) => (
          <div key={item.key} className="lks-label-item">
            <div className="item-type">{item.itemType}</div>
            <div>內尺寸 {item.dimensions}</div>
            {item.levels ? <div>{item.levels}</div> : null}
            <div>配件：{item.accessories.length ? item.accessories.join("、") : "無"}</div>
          </div>
        ))}
      </div>
      {label.note ? <div className="lks-label-note">⚠ {label.note}</div> : null}
      <div className="lks-label-contact"><div>Phone：{label.phone}</div><div>Address：{label.address}</div></div>
      <style>{`
        .lks-label-card{width:105mm;height:148mm;background:#fff;border:3px solid #1f2937;box-sizing:border-box;padding:8mm;display:flex;flex-direction:column;font-family:Arial,"Noto Sans TC","Microsoft JhengHei",sans-serif;color:#111;overflow:hidden}
        .lks-label-header{display:flex;align-items:center;justify-content:space-between;border-bottom:4px solid #1f2937;padding-bottom:5px}
        .lks-label-brand{font-size:18px;font-weight:900;color:#e85d04;letter-spacing:.2px}
        .lks-label-logo{width:94px;height:54px;object-fit:contain}
        .lks-label-refs{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:13px;padding:7px 0;border-bottom:1px solid #94a3b8}
        .lks-label-box{text-align:center;padding:5px 0;display:flex;align-items:baseline;justify-content:center;gap:8px}.lks-label-box strong{font-size:48px;line-height:1}.lks-label-box span{font-size:15px;font-weight:800}
        .lks-label-items{display:flex;flex-direction:column;gap:5px;overflow:hidden}.lks-label-item{border:2px solid #334155;padding:5px 7px;font-size:13px;font-weight:700;line-height:1.35}.lks-label-item .item-type{font-size:15px;color:#d35400;font-weight:900}
        .lks-label-note{margin-top:6px;border:2px solid #e85d04;background:#fff7ed;padding:6px 8px;font-size:14px;font-weight:900}
        .lks-label-contact{margin-top:auto;border-top:2px solid #334155;padding-top:5px;font-size:12px;font-weight:700;line-height:1.35;word-break:break-word}
        @media print{.lks-label-card{width:105mm!important;height:148mm!important;margin:0!important;box-shadow:none!important;page-break-after:always}@page{size:105mm 148mm;margin:0}}
      `}</style>
    </div>
  );
}
