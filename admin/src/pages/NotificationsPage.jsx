import { notificationApi } from '../api/client';
import { Badge, Button, Card, DataState, PageHeader, Skeleton } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { formatDate, oid } from '../lib/format';
import { useAsync } from '../lib/hooks';

function NotificationsSkeleton() {
  return (
    <div role="status" className="space-y-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-24 rounded-3xl" />
      ))}
      <span className="sr-only">Đang tải thông báo…</span>
    </div>
  );
}

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
      <DataState
        loading={loading}
        error={error}
        isEmpty={!items.length}
        onRetry={reload}
        skeleton={<NotificationsSkeleton />}
        emptyTitle="Không có thông báo"
        emptyDescription="Thông báo mới sẽ xuất hiện tại đây."
      >
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
      </DataState>
    </div>
  );
}
