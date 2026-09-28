import { notificationApi } from '../api/client';
import { Badge, Button, Card, EmptyState, ErrorBox, PageHeader, Spinner } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { formatDate, oid } from '../lib/format';
import { useAsync } from '../lib/hooks';

export default function NotificationsPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => notificationApi.list(), []);
  const items = data?.data?.notifications || [];

  async function markOne(item) {
    try {
      await notificationApi.read(oid(item));
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function markAll() {
    try {
      await notificationApi.readAll();
      toast.success('Đã đánh dấu tất cả đã đọc');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="In-app"
        title="Thông báo"
        description="Thông báo gắn với tài khoản đang đăng nhập (đổi trạng thái donation, volunteer, order…)."
        actions={<Button variant="ghost" onClick={markAll}>Đánh dấu tất cả đã đọc</Button>}
      />
      {loading ? <Spinner /> : null}
      <ErrorBox error={error} />
      {!loading && !items.length ? <EmptyState title="Không có thông báo" /> : null}
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={oid(item)} className={item.isRead ? 'opacity-70' : ''}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-medium">{item.title}</p>
                  {!item.isRead ? <Badge value="pending" map={{ pending: 'Mới' }} /> : null}
                </div>
                <p className="text-sm text-ink/70">{item.message}</p>
                <p className="mt-2 text-xs text-ink/45">
                  {item.type} · {formatDate(item.createdAt)}
                </p>
              </div>
              {!item.isRead ? (
                <Button variant="ghost" onClick={() => markOne(item)}>
                  Đã đọc
                </Button>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
