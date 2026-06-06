'use client';

import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function CustomerInvoice() {

  const [, recordParams] = useRoute('/customer-invoice/:id');
  const [, shippingParams] = useRoute('/i/:shippingNo');

  const recordId = recordParams?.id;
  const shippingNo = shippingParams?.shippingNo;

  const orderId = recordId ?? shippingNo;

  const [isClient, setIsClient] = useState(false);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

 const { data: order, isLoading: loading } = trpc.airtable.getOrderData.useQuery(
  recordId || shippingNo || '',
  { enabled: !!(recordId || shippingNo) && isClient }
);

  // Update page title dynamically when order data is loaded
  useEffect(() => {
    if (order) {
      const orderNo = order.order.fields['Internal Order No'] || '';
      const shippingNoValue = order.order.fields['Shipping No'] || 'N/A';
      document.title = `LKS 送貨單 - ${orderNo} (${shippingNo})`;

      // Update OG meta tags for WhatsApp preview
      const updateMeta = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.content = content;
      };
      updateMeta('og:title', `LKS 送貨單 - ${orderNo}`);
      updateMeta('og:description', `配送號: ${shippingNo} | 訂單號: ${orderNo}`);
    }
    return () => {
      document.title = 'LKS Display Box';
    };
  }, [order]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isClient) return null;

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Invalid order ID</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  // Extract data
  const shippingNoDisplay = order.order.fields['Shipping No'] || 'N/A';
  const orderNo = order.order.fields['Internal Order No'] || 'N/A';
  const deliveryDate = order.order.fields['Delivery Date'] || 'N/A';

  // Customer ID from Order_2026 → Customer ID (from Customer) 2
  const order2026Fields = (order as any).order2026?.fields;
  const customerIdFromOrder = order2026Fields?.['Customer ID (from Customer)']?.[0]
    || order.customer?.fields['Customer ID']
    || 'N/A';

  const customerName = order.customer?.fields['Customer Name'] || 'N/A';
  const phone = order.customer?.fields['Phone'] || 'N/A';
  const address = order.customer?.fields['Address'] || 'N/A';
  const items = order.orderItems || [];

  // From Deliveries table
  const totalPieces = order.order.fields['Total Pieces'] || 0;
  const totalWeight = order.order.fields['Total Weight'] || 0;
  const shippingFee = order.order.fields['Customer Shipping Fee'] || 0;
  const shippingPaidBy = order.order.fields['Shipping Paid By'] || 'N/A';

  // Parse accessories: handle both array and string types from Airtable
  const parseAccessories = (raw: string | string[] | undefined): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map(s => String(s).trim()).filter(s => s.length > 0 && s !== '-');
    }
    const str = String(raw);
    if (str.trim() === '' || str.trim() === '-') return [];
    return str.split(/[,，;\n]+/).map(s => s.trim()).filter(s => s.length > 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Invoice Content */}
      <div className="invoice-page">
        {/* Header: Logo | Title | Company Info */}
        <div className="invoice-header">
          <div className="invoice-logo">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663253730031/dEsUrrvecqqFg5CteTMEZc/LKSnewLOGO透明2023_2674f8ba.png"
              style={{ width: '100%', height: 'auto' }}
              alt="LKS Logo"
              crossOrigin="anonymous"
            />
          </div>
          <div className="invoice-title">
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#E67E22' }}>送貨單</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#E67E22' }}>Deliver Note</div>
          </div>
          <div className="invoice-company">
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>LKS Display Box</div>
            <div>香港九龍觀塘成業街7號</div>
            <div>寧晉中心35樓G1室</div>
            <div>68983722</div>
            <div>lksdisplaybox@gmail.com</div>
            <div><a href="https://lksdisplaybox.online" target="_blank" rel="noopener noreferrer">lksdisplaybox.online</a></div>
          </div>
        </div>

        {/* Order Info Row */}
        <div className="info-grid-3">
          <div>
            <div className="label-orange">配送號</div>
            <div className="value-large">{shippingNoDisplay}</div>
          </div>
          <div>
            <div className="label-orange">訂單號</div>
            <div className="value-large">{orderNo}</div>
          </div>
          <div>
            <div className="label-orange">預計送貨日期</div>
            <div>{deliveryDate}</div>
          </div>
        </div>

        {/* Customer Info Row */}
        <div className="info-grid-2">
          <div>
            <div className="label-orange">客戶號碼</div>
            <div style={{ marginBottom: '8px' }}>{customerIdFromOrder}</div>
            <div className="label-orange">聯絡電話</div>
            <div>{phone}</div>
          </div>
          <div>
            <div className="label-orange">客戶名稱</div>
            <div style={{ marginBottom: '8px' }}>{customerName}</div>
            <div className="label-orange">送貨地址</div>
            <div style={{ fontSize: '13px' }}>{address}</div>
          </div>
        </div>

        {/* Order Items Table */}
        <div style={{ marginBottom: '12px' }}>
          <div className="label-orange" style={{ marginBottom: '6px' }}>訂單內容</div>
          <table className="items-table">
            <thead>
              <tr style={{ backgroundColor: '#E67E22', color: 'white' }}>
                <th>種類</th>
                <th>內尺寸 (CM)</th>
                <th style={{ textAlign: 'center' }}>層數</th>
                <th>層高</th>
                <th>配件</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#999' }}>無訂單項目</td>
                </tr>
              ) : (
                items.map((item: any, index: number) => {
                  const accessories = parseAccessories(item.fields?.['Accessories']);
                  return (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
                      <td>{item.fields?.['Item Type'] || item.fields?.['Item Ref'] || 'N/A'}</td>
                      <td>{`${item.fields?.['Inter L'] || '-'} x ${item.fields?.['Inter D'] || '-'} x ${item.fields?.['Inter H'] || '-'}`}</td>
                      <td style={{ textAlign: 'center' }}>{item.fields?.['No. of Levels'] || '-'}</td>
                      <td>{item.fields?.['Level Heights'] || '-'}</td>
                      <td>
                        {accessories.length === 0 ? (
                          <span>-</span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {accessories.map((acc, i) => (
                              <span key={i} className="acc-tag">{acc}</span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Row */}
        <div className="info-grid-3" style={{ marginBottom: '12px' }}>
          <div>
            <div className="label-orange">總件數</div>
            <div className="value-large">{totalPieces}</div>
          </div>
          <div>
            <div className="label-orange">總重量</div>
            <div className="value-large">{totalWeight} KG</div>
          </div>
          <div>
            <div className="label-orange">運費</div>
            <div className="value-large" style={{ color: '#E67E22' }}>${shippingFee}</div>
          </div>
        </div>

        {/* Shipping Paid By */}
        <div style={{ marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #ddd' }}>
          <div className="label-orange">付款方式</div>
          <div style={{ fontSize: '14px' }}>{shippingPaidBy}</div>
        </div>

        {/* Payment Methods */}
        <div style={{ marginBottom: '12px' }}>
          <div className="label-orange" style={{ marginBottom: '8px' }}>付款方法</div>
          <div className="payment-grid">
            {/* Bank Transfer */}
            <div>
              <div style={{ fontWeight: 'bold', color: '#E67E22', marginBottom: '3px' }}>銀行轉帳</div>
              <div>銀行：HSBC</div>
              <div>帳號：582 664 967 838</div>
            </div>
            {/* FPS */}
            <div>
              <div style={{ fontWeight: 'bold', color: '#E67E22', marginBottom: '3px' }}>轉數快 (FPS)</div>
              <div>電話號碼：68983722</div>
            </div>
            {/* Payme */}
            <div>
              <div style={{ fontWeight: 'bold', color: '#E67E22', marginBottom: '3px' }}>PayMe</div>
              <a href="https://qr.payme.hsbc.com.hk/2/EjV1LxhqMwvqL6h5MN9n3r" target="_blank" rel="noopener noreferrer">按此即時付款</a>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #ddd', fontSize: '12px' }}>
          <div className="label-orange" style={{ marginBottom: '6px', fontSize: '13px' }}>條款及細則</div>
          <ol style={{ marginLeft: '18px', color: '#000000', lineHeight: '1.7' }}>
            <li>由送貨起計，三天內包補板，過左三天後才發現有爆板請再購買壞板。</li>
            <li>如發現強行安裝而弄花或損壞，恕不會補發！</li>
            <li>如客戶要求LKS司機在收貨地址以外地方收貨，均不會為損壞板件補發。</li>
            <li>司機大約會在兩天內聯絡，請耐心等待司機聯絡相約送貨時間。</li>
            <li>LKS Display Box 保留最終決定權。</li>
          </ol>
        </div>
      </div>

      <style>{`
        .invoice-page {
          background: #ffffff;
          padding: 12mm;
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          font-size: 14px;
          line-height: 1.4;
          color: #000000;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          border-bottom: 3px solid #E67E22;
          padding-bottom: 12px;
        }
        .invoice-logo { flex: 0 0 auto; width: 110px; }
        .invoice-title { flex: 1; text-align: center; padding-top: 10px; }
        .invoice-company { flex: 0 0 auto; text-align: right; font-size: 13px; line-height: 1.6; }
        .label-orange { font-weight: bold; color: #E67E22; margin-bottom: 4px; font-size: 14px; }
        .value-large { font-size: 17px; font-weight: bold; }
        .info-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        .info-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        .payment-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; font-size: 13px; }
        .items-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 7px; }
        .items-table th { border-color: #E67E22; }
        .acc-tag {
          display: inline-block;
          border: 1px solid #E67E22;
          border-radius: 3px;
          padding: 1px 5px;
          font-size: 12px;
          color: #E67E22;
          background-color: #fff8f0;
        }
        .print-hidden { display: flex; }

        @media print {
          .print-hidden { display: none !important; }
          body { margin: 0; padding: 0; background: white; }
          @page { size: A4; margin: 0; }
          .invoice-page {
            width: 210mm !important;
            min-height: 297mm !important;
            padding: 12mm !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
        }

        @media (max-width: 768px) {
          .invoice-page {
            width: 100% !important;
            padding: 4mm !important;
            min-height: auto !important;
          }
          .info-grid-3, .info-grid-2, .payment-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
