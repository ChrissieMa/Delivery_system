export default function DriverNoteCard({ data }: { data: any }) {
  const order = data.order?.fields || {};
  const customer = data.customer?.fields || {};
  const Row = ({ label, value, wide = false }: any) => <div className={wide ? "driver-field wide" : "driver-field"}><span>{label}</span><strong>{value || "N/A"}</strong></div>;
  return <div className="driver-card page-break" data-driver-note-page>
    <div className="driver-header"><div><div className="driver-brand">LKS DISPLAY BOX</div><b>DRIVER DELIVERY NOTE</b></div><img src="/lks-logo.png" /></div>
    <div className="driver-grid"><Row label="配送號" value={order["Shipping No"]} /><Row label="訂單號" value={order["Internal Order No"]} /><Row label="客戶號碼" value={customer["Customer ID"]} /><Row label="客戶名稱" value={customer["Customer Name"]} /><Row label="聯絡電話" value={customer.Phone} wide /><Row label="送貨地址" value={customer.Address} wide /><Row label="總件數" value={order["Total Pieces"] || 0} /><Row label="總重量" value={`${order["Total Weight"] || 0} KG`} /><Row label="備註" value={order["Driver Remark"] || ""} wide /></div>
    <style>{`
      .driver-card{width:100mm;height:150mm;background:#fff;border:3px solid #1f2937;box-sizing:border-box;padding:8mm;font-family:Arial,"Noto Sans TC","Microsoft JhengHei",sans-serif;color:#111;overflow:hidden}.driver-card.pdf-capture{box-shadow:none!important}.driver-header{display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid #1f2937;padding-bottom:6px;margin-bottom:9px}.driver-header img{width:90px;height:56px;object-fit:contain}.driver-brand{font-size:17px;font-weight:900;color:#e85d04}.driver-header b{font-size:11px}.driver-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}.driver-field{border:2px solid #334155;padding:7px;min-height:44px;box-sizing:border-box}.driver-field.wide{grid-column:1/-1}.driver-field span{display:block;font-size:10px;font-weight:800;color:#64748b;margin-bottom:3px}.driver-field strong{font-size:15px;line-height:1.3;word-break:break-word}.driver-field.wide strong{font-size:14px}@page{size:100mm 150mm;margin:0}@media print{.driver-card{width:100mm!important;height:150mm!important;min-height:150mm!important;max-height:150mm!important;margin:0!important;break-after:page;break-inside:avoid;page-break-after:always;page-break-inside:avoid;box-shadow:none!important}}
    `}</style>
  </div>;
}
