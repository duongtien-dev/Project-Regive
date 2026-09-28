import { useState } from 'react';
import { paymentApi } from '../api/client';
import { Badge, Card, EmptyState, ErrorBox, FilterSelect, PageHeader, Spinner, Table } from '../components/ui';
import { LABELS } from '../lib/constants';
import { displayName, formatDate, formatVnd, oid } from '../lib/format';
import { useAsync } from '../lib/hooks';

export default function PaymentsPage() {
  const [status, setStatus] = useState('');
  const [purpose, setPurpose] = useState('');
  const { data, loading, error } = useAsync(() => paymentApi.list({ status, purpose }), [status, purpose]);
  const payments = data?.data?.payments || [];

  return (
    <div>
      <PageHeader
        eyebrow="Sprint 2"
        title="Thanh toán"
        description="Sandbox gateway. Nhân sự xem toàn bộ giao dịch đơn hàng và quyên góp tiền."
      />
      <div className="mb-4 grid max-w-xl gap-3 sm:grid-cols-2">
        <FilterSelect
          value={status}
          onChange={setStatus}
          options={Object.entries(LABELS.payment).map(([value, label]) => ({ value, label }))}
        />
        <FilterSelect
          value={purpose}
          onChange={setPurpose}
          options={Object.entries(LABELS.purpose).map(([value, label]) => ({ value, label }))}
        />
      </div>
      {loading ? <Spinner /> : null}
      <ErrorBox error={error} />
      {!loading && !payments.length ? <EmptyState title="Chưa có thanh toán" /> : null}
      {payments.length ? (
        <Card>
          <Table
            rowKey={(row) => oid(row) || row.paymentCode}
            rows={payments}
            columns={[
              { key: 'code', header: 'Mã', render: (row) => <span className="font-medium">{row.paymentCode}</span> },
              { key: 'payer', header: 'Người trả', render: (row) => displayName(row.payer) },
              { key: 'purpose', header: 'Loại', render: (row) => <Badge value={row.purpose} map={LABELS.purpose} /> },
              { key: 'amount', header: 'Số tiền', render: (row) => formatVnd(row.amount) },
              { key: 'status', header: 'TT', render: (row) => <Badge value={row.status} map={LABELS.payment} /> },
              {
                key: 'ref',
                header: 'Tham chiếu',
                render: (row) => row.order?.orderCode || (row.donation ? 'Donation' : '—'),
              },
              { key: 'at', header: 'Lúc', render: (row) => formatDate(row.paidAt || row.createdAt) },
            ]}
          />
        </Card>
      ) : null}
    </div>
  );
}
