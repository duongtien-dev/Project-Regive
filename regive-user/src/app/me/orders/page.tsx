'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Alert, Tag, Modal, Steps, Input, message, Popconfirm } from 'antd';
import { Package, RefreshCw, Eye, CreditCard, Truck, MapPin, XCircle, CheckCircle2, Clock } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import { Order } from '@/types';
import { formatVND, formatDate } from '@/lib/format';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';

const ORDER_STEPS = [
  { key: 'pending', title: 'Chờ thanh toán' },
  { key: 'paid', title: 'Đã thanh toán' },
  { key: 'processing', title: 'Đang chuẩn bị' },
  { key: 'shipped', title: 'Đang giao hàng' },
  { key: 'completed', title: 'Hoàn thành' },
];

function getStepIndex(status: string): number {
  if (status === 'cancelled') return -1;
  const idx = ORDER_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

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

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    try {
      setCancellingId(orderToCancel._id);
      await orderService.cancelOrder(orderToCancel._id, cancelReason);
      message.success('Đã hủy đơn hàng thành công');
      setCancelModalOpen(false);
      setOrderToCancel(null);
      setCancelReason('');
      fetchOrders();
    } catch (err: any) {
      message.error(err.message || 'Không thể hủy đơn hàng');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <DashboardLayout
      title="Đơn Hàng Marketplace"
      subtitle="Theo dõi quá trình giao nhận, lịch sử vận chuyển và trạng thái thanh toán các vật phẩm bạn đã mua"
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button icon={<RefreshCw className="w-4 h-4" />} onClick={fetchOrders} className="rounded-xl">
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
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-all"
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
                        <Package className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold">{item.name}</span>
                        <span className="text-gray-400">× {item.quantity}</span>
                      </div>
                      <span className="font-bold text-emerald-800">{formatVND(item.price * item.quantity)}</span>
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
                      <>
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
                        <Button
                          danger
                          size="small"
                          icon={<XCircle className="w-3.5 h-3.5" />}
                          onClick={() => {
                            setOrderToCancel(o);
                            setCancelModalOpen(true);
                          }}
                          className="rounded-lg text-xs"
                        >
                          Hủy đơn
                        </Button>
                      </>
                    )}

                    <Button
                      size="small"
                      icon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => setSelectedOrder(o)}
                      className="rounded-lg text-xs"
                    >
                      Chi tiết & Tiến độ
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order detail modal with Steps Timeline */}
        <Modal
          title={<span className="font-bold text-base text-gray-900">Chi Tiết Đơn Hàng</span>}
          open={!!selectedOrder}
          onCancel={() => setSelectedOrder(null)}
          footer={null}
          width={600}
          className="rounded-2xl"
        >
          {selectedOrder && (
            <div className="py-2 space-y-5 text-xs text-gray-600">
              {/* Status Timeline */}
              {selectedOrder.status !== 'cancelled' ? (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-3">
                    Tiến độ thực hiện
                  </span>
                  <Steps
                    size="small"
                    current={getStepIndex(selectedOrder.status)}
                    items={ORDER_STEPS.map((s) => ({ title: s.title }))}
                  />
                </div>
              ) : (
                <Alert
                  type="warning"
                  message="Đơn hàng đã hủy"
                  description="Đơn hàng này đã bị hủy theo yêu cầu của bạn hoặc đã quá hạn thanh toán."
                  showIcon
                  className="rounded-xl"
                />
              )}

              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span>Mã đơn hàng:</span>
                <span className="font-mono font-bold text-gray-900">{selectedOrder.orderCode}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Trạng thái:</span>
                <StatusBadge type="order" status={selectedOrder.status} />
              </div>

              <div className="space-y-2 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
                <span className="font-bold text-emerald-950 block mb-1">Vật phẩm trong đơn:</span>
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.name} (×{it.quantity})</span>
                    <span className="font-bold text-emerald-900">{formatVND(it.price * itemQuantity(it))}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-emerald-200 flex justify-between font-black text-emerald-700 text-sm">
                  <span>Tổng tiền thanh toán:</span>
                  <span>{formatVND(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <p><strong>Số điện thoại:</strong> {selectedOrder.phone || 'Chưa cung cấp'}</p>
                <p><strong>Địa chỉ nhận hàng:</strong> {selectedOrder.shippingAddress || 'Chưa cung cấp'}</p>
                {selectedOrder.note && <p><strong>Ghi chú:</strong> {selectedOrder.note}</p>}
              </div>

              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="pt-2 border-t border-gray-100 space-y-1.5">
                  <span className="font-bold text-gray-800 block">Lịch sử nhật ký:</span>
                  {selectedOrder.statusHistory.map((h, i) => (
                    <div key={i} className="flex justify-between text-gray-400">
                      <span>{h.status} {h.note ? `— ${h.note}` : ''}</span>
                      <span>{formatDate(h.at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Cancel Order Modal */}
        <Modal
          title="Xác Nhận Hủy Đơn Hàng"
          open={cancelModalOpen}
          onCancel={() => {
            setCancelModalOpen(false);
            setOrderToCancel(null);
          }}
          onOk={handleConfirmCancel}
          confirmLoading={Boolean(cancellingId)}
          okText="Xác nhận hủy"
          cancelText="Đóng"
          okButtonProps={{ danger: true, className: 'rounded-xl' }}
          cancelButtonProps={{ className: 'rounded-xl' }}
        >
          <div className="py-2 space-y-3 text-sm text-gray-600">
            <p>
              Bạn có chắc chắn muốn hủy đơn hàng{' '}
              <strong className="font-mono text-gray-900">{orderToCancel?.orderCode}</strong> không?
            </p>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Lý do hủy đơn (không bắt buộc):
              </label>
              <Input.TextArea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do đổi ý hoặc muốn thay đổi số lượng..."
                className="!rounded-xl"
              />
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

function itemQuantity(it: any): number {
  return it.quantity || 1;
}
