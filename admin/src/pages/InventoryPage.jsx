import { useState } from 'react';
import { Link } from 'react-router-dom';
import { inventoryApi, productApi } from '../api/client';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBox,
  Field,
  FilterSelect,
  Input,
  PageHeader,
  Select,
  Spinner,
  StatCard,
  Table,
} from '../components/ui';
import { useToast } from '../context/ToastContext';
import { LABELS } from '../lib/constants';
import { formatDate, formatVnd, oid } from '../lib/format';
import { useAsync } from '../lib/hooks';

export default function InventoryPage() {
  const toast = useToast();
  const [txType, setTxType] = useState('');
  const summary = useAsync(() => inventoryApi.summary(), []);
  const txs = useAsync(() => inventoryApi.transactions({ type: txType }), [txType]);
  const products = useAsync(() => productApi.list(), []);
  const [form, setForm] = useState({ productId: '', quantity: 1, newQuantity: 0, storageLocation: '', reason: '' });
  const [saving, setSaving] = useState('');

  const stock = summary.data?.data;
  const catalog = products.data?.data?.products || [];

  async function submit(kind) {
    setSaving(kind);
    try {
      if (kind === 'in') {
        await inventoryApi.stockIn({
          productId: form.productId,
          quantity: Number(form.quantity),
          storageLocation: form.storageLocation,
          reason: form.reason || 'Stock in',
        });
      } else if (kind === 'out') {
        await inventoryApi.stockOut({
          productId: form.productId,
          quantity: Number(form.quantity),
          storageLocation: form.storageLocation,
          reason: form.reason || 'Stock out',
        });
      } else {
        await inventoryApi.adjust({
          productId: form.productId,
          newQuantity: Number(form.newQuantity),
          storageLocation: form.storageLocation,
          reason: form.reason || 'Stock adjust',
        });
      }
      toast.success('Đã ghi nhận giao dịch kho');
      summary.reload();
      txs.reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving('');
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Sprint 2"
        title="Kho & tồn"
        description="Nhập, xuất, điều chỉnh tồn. Publish marketplace cần sản phẩm còn hàng."
      />

      {summary.loading ? <Spinner /> : null}
      <ErrorBox error={summary.error} />
      {stock ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <StatCard label="SKU còn hàng" value={stock.totalSku} />
          <StatCard label="Tổng đơn vị" value={stock.totalUnits} />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="font-display mb-4 text-xl">Ghi nhận kho</h2>
          <div className="space-y-3">
            <Field label="Sản phẩm">
              <Select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
                <option value="">Chọn sản phẩm</option>
                {catalog.map((p) => (
                  <option key={oid(p)} value={oid(p)}>
                    {p.name} ({p.stockQuantity})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Số lượng nhập/xuất">
              <Input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </Field>
            <Field label="Số lượng mới (điều chỉnh)">
              <Input type="number" min="0" value={form.newQuantity} onChange={(e) => setForm({ ...form, newQuantity: e.target.value })} />
            </Field>
            <Field label="Vị trí">
              <Input value={form.storageLocation} onChange={(e) => setForm({ ...form, storageLocation: e.target.value })} />
            </Field>
            <Field label="Lý do">
              <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button disabled={!form.productId || saving} onClick={() => submit('in')}>
                Nhập
              </Button>
              <Button variant="outline" disabled={!form.productId || saving} onClick={() => submit('out')}>
                Xuất
              </Button>
              <Button variant="lime" disabled={!form.productId || saving} onClick={() => submit('adjust')}>
                Điều chỉnh
              </Button>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-display mb-4 text-xl">Tồn hiện tại</h2>
          {stock?.products?.length ? (
            <Table
              rowKey={(row) => oid(row)}
              rows={stock.products}
              columns={[
                {
                  key: 'name',
                  header: 'SP',
                  render: (row) => (
                    <Link className="font-medium text-moss hover:underline" to={`/products/${oid(row)}`}>
                      {row.name}
                    </Link>
                  ),
                },
                { key: 'category', header: 'Danh mục' },
                { key: 'qty', header: 'SL', render: (row) => row.stockQuantity },
                { key: 'loc', header: 'Vị trí', render: (row) => row.storageLocation || '—' },
                { key: 'price', header: 'Giá', render: (row) => formatVnd(row.price) },
                { key: 'status', header: 'TT', render: (row) => <Badge value={row.status} map={LABELS.product} /> },
              ]}
            />
          ) : (
            <EmptyState title="Kho trống" description="Nhập kho sau khi đánh giá sản phẩm." />
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl">Lịch sử giao dịch</h2>
          <div className="w-48">
            <FilterSelect
              value={txType}
              onChange={setTxType}
              options={Object.entries(LABELS.inventory).map(([value, label]) => ({ value, label }))}
            />
          </div>
        </div>
        {txs.loading ? <Spinner /> : null}
        <ErrorBox error={txs.error} />
        {txs.data?.data?.transactions?.length ? (
          <Table
            rowKey={(row) => oid(row)}
            rows={txs.data.data.transactions}
            columns={[
              { key: 'product', header: 'SP', render: (row) => row.product?.name || '—' },
              { key: 'type', header: 'Loại', render: (row) => <Badge value={row.type} map={LABELS.inventory} /> },
              { key: 'qty', header: 'SL', render: (row) => row.quantity },
              { key: 'stock', header: 'Tồn', render: (row) => `${row.previousStock} → ${row.newStock}` },
              { key: 'reason', header: 'Lý do', render: (row) => row.reason || '—' },
              { key: 'at', header: 'Lúc', render: (row) => formatDate(row.createdAt) },
            ]}
          />
        ) : (
          !txs.loading && <p className="text-sm text-ink/50">Chưa có giao dịch.</p>
        )}
      </Card>
    </div>
  );
}
