'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Select, Button, Alert, Tag, Modal } from 'antd';
import { Gift, RefreshCw, Eye, CreditCard } from 'lucide-react';
import { donationService } from '@/services/donationService';
import { paymentService } from '@/services/paymentService';
import { Donation } from '@/types';
import { formatVND, formatDate } from '@/lib/format';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';

export default function MyDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await donationService.getMyDonations();
      setDonations(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách quyên góp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const filteredDonations = useMemo(() => {
    if (typeFilter === 'all') return donations;
    return donations.filter((d) => d.type === typeFilter);
  }, [donations, typeFilter]);

  const handlePayPendingDonation = async (donationId: string) => {
    try {
      setPayingId(donationId);
      const payment = await paymentService.create({
        purpose: 'donation',
        donationId,
      });
      const paymentId = payment.id || payment._id;
      window.location.href = `/payments/${paymentId}/checkout`;
    } catch (err: any) {
      setError(err.message || 'Không thể tạo phiên thanh toán');
      setPayingId(null);
    }
  };

  return (
    <DashboardLayout
      title="Lịch Sử Quyên Góp"
      subtitle="Theo dõi toàn bộ các khoản đóng góp tiền mặt và hiện vật của bạn"
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            className="w-48"
            options={[
              { label: 'Tất cả loại hình', value: 'all' },
              { label: 'Tiền mặt (Money)', value: 'money' },
              { label: 'Hiện vật (Product)', value: 'product' },
            ]}
          />

          <Button icon={<RefreshCw className="w-4 h-4" />} onClick={fetchDonations}>
            Làm mới
          </Button>
        </div>

        {error && <Alert message="Lỗi" description={error} type="error" showIcon />}

        {loading ? (
          <TableSkeleton rows={5} />
        ) : filteredDonations.length === 0 ? (
          <EmptyState
            title="Chưa có quyên góp nào"
            description="Bạn chưa thực hiện quyên góp nào thuộc danh mục này."
            actionText="Khám phá chiến dịch"
            actionHref="/campaigns"
          />
        ) : (
          <div className="space-y-4">
            {filteredDonations.map((d) => {
              const campaignTitle =
                typeof d.campaign === 'object' && d.campaign?.title
                  ? d.campaign.title
                  : 'Chiến dịch thiện nguyện';

              return (
                <div
                  key={d._id}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Tag color={d.type === 'money' ? 'emerald' : 'cyan'} className="font-semibold">
                        {d.type === 'money' ? 'Tiền mặt' : 'Hiện vật'}
                      </Tag>
                      <StatusBadge type="donation" status={d.status} />
                      <span className="text-xs text-gray-400 font-mono">#{d._id.slice(-6)}</span>
                    </div>

                    <h4 className="font-bold text-gray-900 text-sm">{campaignTitle}</h4>

                    <div className="text-xs text-gray-500 space-y-0.5">
                      {d.type === 'money' ? (
                        <p>
                          Số tiền quyên góp:{' '}
                          <strong className="text-emerald-700 font-bold text-sm">
                            {formatVND(d.amount)}
                          </strong>
                        </p>
                      ) : (
                        <p>
                          Vật phẩm:{' '}
                          <strong className="text-teal-700">
                            {d.productInfo?.name} (Số lượng: {d.productInfo?.quantity})
                          </strong>
                        </p>
                      )}
                      {d.note && <p className="italic text-gray-400">"{d.note}"</p>}
                    </div>

                    <span className="text-[11px] text-gray-400 block">
                      Ngày tạo: {formatDate(d.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {d.type === 'money' && d.status === 'pending' && (
                      <Button
                        type="primary"
                        size="small"
                        loading={payingId === d._id}
                        icon={<CreditCard className="w-3.5 h-3.5" />}
                        onClick={() => handlePayPendingDonation(d._id)}
                        className="bg-emerald-600 rounded-lg text-xs"
                      >
                        Thanh toán ngay
                      </Button>
                    )}

                    <Button
                      size="small"
                      icon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => setSelectedDonation(d)}
                      className="rounded-lg text-xs"
                    >
                      Chi tiết
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detail Modal */}
        <Modal
          title="Chi Tiết Quyên Góp"
          open={!!selectedDonation}
          onCancel={() => setSelectedDonation(null)}
          footer={null}
        >
          {selectedDonation && (
            <div className="py-2 space-y-4 text-xs text-gray-600">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span>Mã quyên góp:</span>
                <span className="font-mono font-bold">{selectedDonation._id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Hình thức:</span>
                <span className="font-bold capitalize">{selectedDonation.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Trạng thái:</span>
                <StatusBadge type="donation" status={selectedDonation.status} />
              </div>
              {selectedDonation.type === 'money' ? (
                <div className="flex justify-between items-center">
                  <span>Số tiền:</span>
                  <span className="text-base font-bold text-emerald-700">
                    {formatVND(selectedDonation.amount)}
                  </span>
                </div>
              ) : (
                <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p><strong>Tên vật phẩm:</strong> {selectedDonation.productInfo?.name}</p>
                  <p><strong>Số lượng:</strong> {selectedDonation.productInfo?.quantity}</p>
                  <p><strong>Tình trạng:</strong> {selectedDonation.productInfo?.conditionNote || '—'}</p>
                  <p><strong>Mô tả:</strong> {selectedDonation.productInfo?.description || '—'}</p>
                </div>
              )}
              {selectedDonation.note && (
                <div>
                  <span className="text-gray-400 block mb-1">Ghi chú người gửi:</span>
                  <p className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    {selectedDonation.note}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
