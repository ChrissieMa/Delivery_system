'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Printer, FileText, Users, Download, X, CheckSquare, Square, Copy, Check } from 'lucide-react';

const STATUS_OPTIONS = ['全部', '到貨', '已送貨', '已完成'];

export default function OrderList() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState('全部');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyInvoiceLink = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/customer-invoice/${orderId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(orderId);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedId(orderId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const { data: orders = [], isLoading } = trpc.airtable.listOrders.useQuery();

  const filteredOrders = useMemo(() => {
    let result = orders as any[];

    // Filter by status
    if (statusFilter !== '全部') {
      result = result.filter((order: any) => {
        const status = order.fields['Delivery Status'] || '';
        return status === statusFilter;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((order: any) => {
        const shippingNo = (order.fields['Shipping No'] || '').toLowerCase();
        const orderNo = (order.fields['Internal Order No'] || '').toLowerCase();
        return shippingNo.includes(query) || orderNo.includes(query);
      });
    }

    return result;
  }, [orders, searchQuery, statusFilter]);

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const clearSelection = () => {
    setSelectedOrders(new Set());
  };

  const selectAll = () => {
    const allIds = new Set(filteredOrders.map((o: any) => o.id as string));
    setSelectedOrders(allIds);
  };

  const isAllSelected = filteredOrders.length > 0 && filteredOrders.every((o: any) => selectedOrders.has(o.id));

  const handleBatchDownload = () => {
    if (selectedOrders.size === 0) return;
    const ids = Array.from(selectedOrders);
    if (ids.length === 1) {
      navigate(`/customer-invoice/${ids[0]}`);
    } else {
      // Navigate to batch print page with all selected IDs
      const idsParam = ids.join(',');
      navigate(`/batch-invoice/${encodeURIComponent(idsParam)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container px-2 md:px-4 py-4 md:py-8">
      <div className="mb-4 md:mb-8">
  <h1 className="text-2xl md:text-4xl font-bold text-slate-900">
    LKS Shipping System
  </h1>
</div>
        
        {/* Search, Filter and Actions */}
        <div className="mb-4 md:mb-6 bg-white rounded-lg shadow-sm p-3 md:p-4 space-y-3">
          {/* Search */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder="搜索訂單號或配送號..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Bulk Actions Row */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={isAllSelected ? clearSelection : selectAll}
              className="flex items-center gap-2 text-xs md:text-sm"
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              {isAllSelected ? '取消全選' : '全選'}
            </Button>

            {selectedOrders.size > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  className="flex items-center gap-2 text-xs md:text-sm"
                >
                  <X className="w-4 h-4" />
                  清除選擇
                </Button>
                <Button
                  size="sm"
                  onClick={handleBatchDownload}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm"
                >
                  <Download className="w-4 h-4" />
                  批量下載 PDF ({selectedOrders.size})
                </Button>
              </>
            )}

            {selectedOrders.size > 0 && (
              <span className="text-sm text-slate-600">已選擇 {selectedOrders.size} 個訂單</span>
            )}
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-slate-500">加載中...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">沒有找到訂單</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {filteredOrders.map((order: any) => {
              const isSelected = selectedOrders.has(order.id);
              return (
                <Card
                  key={order.id}
                  className={`p-3 md:p-4 cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                  }`}
                  onClick={() => toggleOrderSelection(order.id)}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOrderSelection(order.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm md:text-base">
                            配送號: {order.fields['Shipping No'] || 'N/A'}
                          </p>
                          <p className="text-xs md:text-sm text-slate-600">
                            訂單: {order.fields['Internal Order No'] || 'N/A'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                          {order.fields['Delivery Status'] && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs md:text-sm font-medium">
                              {order.fields['Delivery Status']}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs md:text-sm">
                            <FileText className="w-3 h-3 md:w-4 md:h-4" />
                            {order.fields['Status'] || '待處理'}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs md:text-sm">
                        <div>
                          <span className="text-slate-600">配送日期:</span>
                          <p className="font-medium text-slate-900">{order.fields['Delivery Date'] || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">總件數:</span>
                          <p className="font-medium text-slate-900">{order.fields['Total Pieces'] || 0}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">總重量:</span>
                          <p className="font-medium text-slate-900">{order.fields['Total Weight'] || 0} KG</p>
                        </div>
                        <div>
                          <span className="text-slate-600">運費:</span>
                          <p className="font-medium text-slate-900">${order.fields['Customer Shipping Fee'] || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 md:mt-4 ml-7 md:ml-10">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/label/${order.id}`);
                      }}
                      className="text-xs md:text-sm"
                    >
                      <Printer className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      打印標籤
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/driver-note/${order.id}`);
                      }}
                      className="text-xs md:text-sm"
                    >
                      <Users className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      司機單
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/customer-invoice/${order.id}`);
                      }}
                      className="text-xs md:text-sm bg-green-50 hover:bg-green-100 text-green-700"
                    >
                      <FileText className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      收運費單
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleCopyInvoiceLink(e, order.id)}
                      className={`text-xs md:text-sm transition-colors ${
                        copiedId === order.id
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                      }`}
                    >
                      {copiedId === order.id ? (
                        <><Check className="w-3 h-3 md:w-4 md:h-4 mr-1" />已複製！</>
                      ) : (
                        <><Copy className="w-3 h-3 md:w-4 md:h-4 mr-1" />複製連結</>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
