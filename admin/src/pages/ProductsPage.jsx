import { useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../api/client';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBox,
  FilterSelect,
  PageHeader,
  Spinner,
  Table,
} from '../components/ui';
import { useToast } from '../context/ToastContext';
import { LABELS, PRODUCT_STATUSES } from '../lib/constants';
import { formatVnd, oid } from '../lib/format';
import { useAsync } from '../lib/hooks';

export default function ProductsPage() {
  const toast = useToast();
  const [status, setStatus] = useState('');
  const { data, loading, error, reload } = useAsync(() => productApi.list({ status }), [status]);
  const products = data?.data?.products || [];
  const [busy, setBusy] = useState('');

  async function togglePublish(row) {
    setBusy(oid(row));
    try {
      if (row.listedOnMarketplace) await productApi.unpublish(oid(row));
      else await productApi.publish(oid(row));
      toast.success(row.listedOnMarketplace ? 'Đã gỡ khỏi marketplace' : 'Đã đăng marketplace');
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy('');
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Sprint 2"
        title="Sản phẩm"
        description="Intake → đánh giá (thủ công hoặc AI) → nhập kho → publish. AI không tự đăng bán."
      />
      <div className="mb-4 max-w-xs">
        <FilterSelect
          value={status}
          onChange={setStatus}
          options={PRODUCT_STATUSES.map((s) => ({ value: s, label: LABELS.product[s] }))}
        />
      </div>
      {loading ? <Spinner /> : null}
      <ErrorBox error={error} />
      {!loading && !products.length ? <EmptyState title="Chưa có sản phẩm" /> : null}
      {products.length ? (
        <Card>
          <Table
            rowKey={(row) => oid(row)}
            rows={products}
            columns={[
              {
                key: 'name',
                header: 'Sản phẩm',
                render: (row) => (
                  <Link className="font-medium text-moss hover:underline" to={`/products/${oid(row)}`}>
                    {row.name}
                  </Link>
                ),
              },
              { key: 'category', header: 'Danh mục' },
              {
                key: 'status',
                header: 'Trạng thái',
                render: (row) => <Badge value={row.status} map={LABELS.product} />,
              },
              {
                key: 'condition',
                header: 'Tình trạng',
                render: (row) => <Badge value={row.condition} map={LABELS.condition} />,
              },
              { key: 'stock', header: 'Tồn', render: (row) => row.stockQuantity },
              { key: 'price', header: 'Giá', render: (row) => formatVnd(row.price) },
              {
                key: 'market',
                header: 'Marketplace',
                render: (row) => (row.listedOnMarketplace ? 'Đang bán' : 'Chưa đăng'),
              },
              {
                key: 'actions',
                header: '',
                render: (row) => (
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => togglePublish(row)} disabled={busy === oid(row)}>
                      {row.listedOnMarketplace ? 'Gỡ bán' : 'Đăng bán'}
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      ) : null}
    </div>
  );
}
