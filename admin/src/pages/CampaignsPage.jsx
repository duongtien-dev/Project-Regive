import { useState } from 'react';
import { campaignApi } from '../api/client';
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
  Textarea,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CAMPAIGN_STATUSES, LABELS } from '../lib/constants';
import { formatDateOnly, formatVnd, oid, toDateInput, toIsoEnd, toIsoStart } from '../lib/format';
import { useAsync } from '../lib/hooks';

const emptyForm = {
  title: '',
  description: '',
  goal: '',
  location: '',
  startDate: '',
  endDate: '',
  status: 'draft',
  targetAmount: 0,
};

export default function CampaignsPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [status, setStatus] = useState('');
  const { data, loading, error, reload } = useAsync(() => campaignApi.listAll({ status }), [status]);
  const campaigns = data?.data?.campaigns || [];
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(campaign) {
    setEditing(campaign);
    setForm({
      title: campaign.title || '',
      description: campaign.description || '',
      goal: campaign.goal || '',
      location: campaign.location || '',
      startDate: toDateInput(campaign.startDate),
      endDate: toDateInput(campaign.endDate),
      status: campaign.status || 'draft',
      targetAmount: campaign.targetAmount || 0,
    });
    setOpen(true);
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        startDate: toIsoStart(form.startDate),
        endDate: toIsoEnd(form.endDate),
        targetAmount: Number(form.targetAmount) || 0,
      };
      if (editing) await campaignApi.update(oid(editing), payload);
      else await campaignApi.create(payload);
      toast.success(editing ? 'Đã cập nhật chiến dịch' : 'Đã tạo chiến dịch');
      setOpen(false);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(campaign) {
    if (!window.confirm(`Xoá chiến dịch “${campaign.title}”?`)) return;
    try {
      await campaignApi.remove(oid(campaign));
      toast.success('Đã xoá chiến dịch');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Sprint 1"
        title="Chiến dịch"
        description="Admin tạo, sửa, đóng chiến dịch. Nhân viên xem toàn bộ trạng thái."
        actions={
          isAdmin ? (
            <Button onClick={openCreate}>Tạo chiến dịch</Button>
          ) : null
        }
      />

      <div className="mb-4 max-w-xs">
        <FilterSelect
          value={status}
          onChange={setStatus}
          options={CAMPAIGN_STATUSES.map((s) => ({ value: s, label: LABELS.campaign[s] }))}
        />
      </div>

      {loading ? <Spinner /> : null}
      <ErrorBox error={error} />

      {!loading && !campaigns.length ? (
        <EmptyState title="Chưa có chiến dịch" description="Tạo chiến dịch đầu tiên để bắt đầu quyên góp." />
      ) : null}

      {!loading && campaigns.length ? (
        <Card>
          <Table
            rowKey={(row) => oid(row)}
            rows={campaigns}
            columns={[
              { key: 'title', header: 'Tên', render: (row) => <span className="font-medium">{row.title}</span> },
              { key: 'location', header: 'Địa điểm' },
              {
                key: 'status',
                header: 'Trạng thái',
                render: (row) => <Badge value={row.status} map={LABELS.campaign} />,
              },
              {
                key: 'money',
                header: 'Gây quỹ',
                render: (row) => `${formatVnd(row.raisedAmount)} / ${formatVnd(row.targetAmount)}`,
              },
              {
                key: 'dates',
                header: 'Thời gian',
                render: (row) => `${formatDateOnly(row.startDate)} – ${formatDateOnly(row.endDate)}`,
              },
              {
                key: 'actions',
                header: '',
                className: 'text-right',
                render: (row) =>
                  isAdmin ? (
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => openEdit(row)}>
                        Sửa
                      </Button>
                      <Button variant="danger" onClick={() => onDelete(row)}>
                        Xoá
                      </Button>
                    </div>
                  ) : null,
              },
            ]}
          />
        </Card>
      ) : null}

      <Modal open={open} title={editing ? 'Sửa chiến dịch' : 'Tạo chiến dịch'} onClose={() => setOpen(false)}>
        <form className="space-y-3" onSubmit={onSave}>
          <Field label="Tiêu đề">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </Field>
          <Field label="Mô tả">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </Field>
          <Field label="Mục tiêu">
            <Input value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} required />
          </Field>
          <Field label="Địa điểm">
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bắt đầu">
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </Field>
            <Field label="Kết thúc">
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Trạng thái">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {CAMPAIGN_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {LABELS.campaign[s]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Số tiền mục tiêu">
              <Input
                type="number"
                min="0"
                value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
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
