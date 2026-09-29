'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Alert, Tag, Modal } from 'antd';
import { Package, RefreshCw, Eye, CreditCard, Truck, MapPin } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import { Order } from '@/types';
import { formatVND, formatDate } from '@/lib/format';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePayOrder = async (orderId: string) => {
    try {
      setPayingId(orderId);
      const payment = await paymentService.create({
        purpose: 'order',
        orderId,
      });
      const paymentId = payment.id || payment._id;
      window.location.href = `/payments/${paymentId}/checkout`;
    } catch (err: any) {
      setError(err.message || 'Không thể tạo phiên thanh toán cho đơn hàng');
      setPayingId(null);
    }
  };

  return (
    <DashboardLayout
      title="Đơn Hàng Marketplace"
      subtitle="Theo dõi quá trình giao nhận và trạng thái thanh toán các vật phẩm bạn đã mua"
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button icon={<RefreshCw className="w-4 h-4" />} onClick={fetchOrders}>
            Làm mới
          </Button>
        </div>

        {error && <Alert message="Lỗi" description={error} type="error" showIcon />}

        {loading ? (
          <TableSkeleton rows={4} />
        ) : orders.length === 0 ? (
          <EmptyState
            title="Chưa có đơn hàng nào"
            description="Hãy ủng hộ quỹ bằng cách mua sắm các vật phẩm tuần hoàn trên Marketplace."
            actionText="Đến Chợ vật phẩm"
            actionHref="/marketplace"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div
                key={o._id}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-gray-900 text-sm">
                      {o.orderCode}
                    </span>
                    <span className="text-xs text-gray-400">• {formatDate(o.createdAt)}</span>
                  </div>
                  <StatusBadge type="order" status={o.status} />
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {o.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs text-gray-700">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-400">× {item.quantity}</span>
                      </div>
                      <span className="font-semibold">{formatVND(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Shipping address & Total */}
                <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Giao tới: {o.shippingAddress || 'Chưa cung cấp'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-gray-400 mr-2">Tổng tiền:</span>
                      <span className="text-base font-black text-emerald-700">
                        {formatVND(o.totalAmount)}
                      </span>
                    </div>

                    {o.status === 'pending' && (
                      <Button
                        type="primary"
                        size="small"
                        loading={payingId === o._id}
                        icon={<CreditCard className="w-3.5 h-3.5" />}
                        onClick={() => handlePayOrder(o._id)}
                        className="bg-emerald-600 rounded-lg text-xs"
                      >
                        Thanh toán
                      </Button>
                    )}

                    <Button
                      size="small"
                      icon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => setSelectedOrder(o)}
                      className="rounded-lg text-xs"
                    >
                      Chi tiết
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order detail modal */}
        <Modal
          title="Chi Tiết Đơn Hàng"
          open={!!selectedOrder}
          onCancel={() => setSelectedOrder(null)}
          footer={null}
        >
          {selectedOrder && (
            <div className="py-2 space-y-4 text-xs text-gray-600">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span>Mã đơn hàng:</span>
                <span className="font-mono font-bold">{selectedOrder.orderCode}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Trạng thái:</span>
                <StatusBadge type="order" status={selectedOrder.status} />
              </div>

              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="font-bold text-gray-800 block mb-1">Danh sách sản phẩm:</span>
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.name} (×{it.quantity})</span>
                    <span className="font-semibold">{formatVND(it.price * it.quantity)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-emerald-700">
                  <span>Tổng cộng:</span>
                  <span>{formatVND(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p><strong>Người nhận:</strong> {selectedOrder.phone}</p>
                <p><strong>Địa chỉ giao:</strong> {selectedOrder.shippingAddress}</p>
                {selectedOrder.note && <p><strong>Ghi chú:</strong> {selectedOrder.note}</p>}
              </div>

              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="pt-2 border-t border-gray-100 space-y-1.5">
                  <span className="font-bold text-gray-800 block">Lịch sử trạng thái:</span>
                  {selectedOrder.statusHistory.map((h, i) => (
                    <div key={i} className="flex justify-between text-gray-400">
                      <span>{h.status} {h.note ? `(${h.note})` : ''}</span>
                      <span>{formatDate(h.at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
