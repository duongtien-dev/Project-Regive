import { useState } from 'react';
import { volunteerApi } from '../api/client';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBox,
  Field,
  FilterSelect,
  Input,
  Modal,
  PageHeader,
  Select,
  Spinner,
  Table,
} from '../components/ui';
import { useToast } from '../context/ToastContext';
import { LABELS, VOLUNTEER_REVIEW } from '../lib/constants';
import { displayName, formatDate, oid, toDateInput, toIsoStart } from '../lib/format';
import { useAsync } from '../lib/hooks';

export default function VolunteersPage() {
  const toast = useToast();
  const [status, setStatus] = useState('');
  const { data, loading, error, reload } = useAsync(() => volunteerApi.list({ status }), [status]);
  const rows = data?.data?.registrations || [];
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({ status: 'approved', date: '', timeSlot: '', location: '' });
  const [saving, setSaving] = useState(false);

  function openReview(row) {
    setCurrent(row);
    setForm({
      status: row.status === 'pending' ? 'approved' : row.status,
      date: toDateInput(row.schedule?.date),
      timeSlot: row.schedule?.timeSlot || '',
      location: row.schedule?.location || row.campaign?.location || '',
    });
  }

  async function onReview(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await volunteerApi.review(oid(current), {
        status: form.status,
        schedule: {
          date: form.date ? toIsoStart(form.date) : undefined,
          timeSlot: form.timeSlot,
          location: form.location,
        },
      });
      toast.success('Đã duyệt tình nguyện viên');
      setCurrent(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Sprint 1"
        title="Tình nguyện viên"
        description="Duyệt đăng ký và gán lịch / địa điểm cho chiến dịch."
      />
      <div className="mb-4 max-w-xs">
        <FilterSelect
          value={status}
          onChange={setStatus}
          options={Object.entries(LABELS.volunteer).map(([value, label]) => ({ value, label }))}
        />
      </div>
      {loading ? <Spinner /> : null}
      <ErrorBox error={error} />
      {!loading && !rows.length ? <EmptyState title="Chưa có đăng ký tình nguyện" /> : null}
      {rows.length ? (
        <Card>
          <Table
            rowKey={(row) => oid(row)}
            rows={rows}
            columns={[
              {
                key: 'user',
                header: 'Tình nguyện viên',
                render: (row) => (
                  <div>
                    <p className="font-medium">{displayName(row.user)}</p>
                    <p className="text-xs text-ink/50">{row.user?.phone || row.user?.email}</p>
                  </div>
                ),
              },
              { key: 'campaign', header: 'Chiến dịch', render: (row) => row.campaign?.title || '—' },
              { key: 'skills', header: 'Kỹ năng', render: (row) => row.skills || '—' },
              {
                key: 'status',
                header: 'Trạng thái',
                render: (row) => <Badge value={row.status} map={LABELS.volunteer} />,
              },
              {
                key: 'schedule',
                header: 'Lịch',
                render: (row) =>
                  row.schedule?.date
                    ? `${formatDate(row.schedule.date)} · ${row.schedule.timeSlot || ''}`
                    : '—',
              },
              {
                key: 'actions',
                header: '',
                render: (row) => (
                  <Button variant="ghost" onClick={() => openReview(row)}>
                    Duyệt
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      ) : null}

      <Modal open={Boolean(current)} title="Duyệt tình nguyện viên" onClose={() => setCurrent(null)}>
        <form className="space-y-3" onSubmit={onReview}>
          <Field label="Kết quả">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {VOLUNTEER_REVIEW.map((s) => (
                <option key={s} value={s}>
                  {LABELS.volunteer[s]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Ngày">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Khung giờ">
            <Input value={form.timeSlot} onChange={(e) => setForm({ ...form, timeSlot: e.target.value })} placeholder="08:00–12:00" />
          </Field>
          <Field label="Địa điểm">
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setCurrent(null)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Đang lưu…' : 'Lưu'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
