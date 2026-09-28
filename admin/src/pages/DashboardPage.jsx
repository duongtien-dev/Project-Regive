import { Link } from 'react-router-dom';
import { reportApi } from '../api/client';
import { Badge, Card, EmptyState, ErrorBox, PageHeader, Spinner, StatCard, Table } from '../components/ui';
import { useAsync } from '../lib/hooks';
import { LABELS } from '../lib/constants';
import { displayName, formatDate, formatVnd, oid } from '../lib/format';

export default function DashboardPage() {
  const { data, loading, error } = useAsync(() => reportApi.overview(), []);
  const overview = data?.data;

  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} />;
  if (!overview) return <EmptyState title="Chưa có dữ liệu báo cáo" />;

  const { summary, recentOrders, recentPayments, recentStockMoves } = overview;

  return (
    <div>
      <PageHeader
        eyebrow="Báo cáo"
        title="Tổng quan vận hành"
        description="Doanh thu marketplace, quyên góp tiền, tồn kho thấp và hoạt động gần đây."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Doanh thu bán hàng" value={formatVnd(summary.orderRevenue)} hint="Thanh toán đơn thành công" />
        <StatCard label="Quyên góp tiền" value={formatVnd(summary.donationRevenue)} hint={`${summary.moneyDonationsCompleted} khoản hoàn tất`} />
        <StatCard label="Đơn chờ xử lý" value={summary.ordersPending} hint={`${summary.ordersPaid} đơn đã thanh toán/xử lý`} />
        <StatCard label="Tồn kho thấp" value={summary.lowStock} hint={`${summary.listedProducts}/${summary.totalProducts} SP đang bán`} />
      </div>

      <div className="mt-6 space-y-4">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl">Đơn gần đây</h2>
            <Link className="text-sm text-moss hover:underline" to="/orders">
              Xem tất cả
            </Link>
          </div>
          {recentOrders?.length ? (
            <Table
              compact
              rowKey={(row) => oid(row)}
              rows={recentOrders}
              columns={[
                {
                  key: 'order',
                  header: 'Mã',
                  render: (row) => (
                    <Link className="font-medium text-moss hover:underline" to="/orders">
                      {row.orderCode}
                    </Link>
                  ),
                },
                {
                  key: 'buyer',
                  header: 'Người mua',
                  render: (row) => displayName(row.buyer),
                },
                {
                  key: 'status',
                  header: 'Trạng thái',
                  render: (row) => <Badge value={row.status} map={LABELS.order} />,
                },
                {
                  key: 'total',
                  header: 'Tổng',
                  render: (row) => formatVnd(row.totalAmount),
                },
                {
                  key: 'at',
                  header: 'Ngày',
                  render: (row) => formatDate(row.createdAt),
                },
              ]}
            />
          ) : (
            <p className="text-sm text-ink/50">Chưa có đơn.</p>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl">Thanh toán</h2>
            <Link className="text-sm text-moss hover:underline" to="/payments">
              Xem tất cả
            </Link>
          </div>
          {recentPayments?.length ? (
            <Table
              compact
              rowKey={(row) => oid(row)}
              rows={recentPayments}
              columns={[
                { key: 'code', header: 'Mã', render: (row) => row.paymentCode },
                { key: 'payer', header: 'Người trả', render: (row) => displayName(row.payer) },
                { key: 'purpose', header: 'Loại', render: (row) => <Badge value={row.purpose} map={LABELS.purpose} /> },
                { key: 'amount', header: 'Số tiền', render: (row) => formatVnd(row.amount) },
                { key: 'at', header: 'Lúc', render: (row) => formatDate(row.paidAt) },
              ]}
            />
          ) : (
            <p className="text-sm text-ink/50">Chưa có thanh toán.</p>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl">Kho gần đây</h2>
            <Link className="text-sm text-moss hover:underline" to="/inventory">
              Xem tất cả
            </Link>
          </div>
          {recentStockMoves?.length ? (
            <Table
              compact
              rowKey={(row) => oid(row)}
              rows={recentStockMoves}
              columns={[
                { key: 'product', header: 'Sản phẩm', render: (row) => row.product?.name || '—' },
                { key: 'type', header: 'Loại', render: (row) => <Badge value={row.type} map={LABELS.inventory} /> },
                { key: 'qty', header: 'Thay đổi', render: (row) => `${row.previousStock} → ${row.newStock}` },
                { key: 'reason', header: 'Lý do', render: (row) => row.reason || '—' },
                { key: 'at', header: 'Lúc', render: (row) => formatDate(row.createdAt) },
              ]}
            />
          ) : (
            <p className="text-sm text-ink/50">Chưa có giao dịch kho.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
