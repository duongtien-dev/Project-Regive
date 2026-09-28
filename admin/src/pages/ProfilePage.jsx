import { useState } from 'react';
import { authApi } from '../api/client';
import { Button, Card, Field, Input, PageHeader, Textarea } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LABELS } from '../lib/constants';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [saving, setSaving] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authApi.updateMe(form);
      setUser(res.data.user);
      toast.success('Đã cập nhật hồ sơ');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <PageHeader eyebrow="Tài khoản" title="Hồ sơ" description={`Vai trò: ${LABELS.role[user?.role] || user?.role}`} />
      <Card>
        <form className="space-y-3" onSubmit={onSubmit}>
          <Field label="Email">
            <Input value={user?.email || ''} disabled />
          </Field>
          <Field label="Họ tên">
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </Field>
          <Field label="Điện thoại">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Địa chỉ">
            <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <Button type="submit" disabled={saving}>
            {saving ? 'Đang lưu…' : 'Lưu hồ sơ'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
