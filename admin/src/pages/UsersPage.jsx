import { useState } from 'react';
import { authApi } from '../api/client';
import { Badge, Card, EmptyState, ErrorBox, FilterSelect, PageHeader, Spinner, Table } from '../components/ui';
import { LABELS, ROLES } from '../lib/constants';
import { formatDate, oid } from '../lib/format';
import { useAsync } from '../lib/hooks';

export default function UsersPage() {
  const [role, setRole] = useState('');
  const { data, loading, error } = useAsync(() => authApi.users({ role }), [role]);
  const users = data?.data?.users || [];

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Người dùng"
        description="Danh sách tài khoản theo role. Tạo ADMIN/EMPLOYEE chỉ qua seed — public register chỉ USER/BENEFICIARY."
      />
      <div className="mb-4 max-w-xs">
        <FilterSelect
          value={role}
          onChange={setRole}
          options={Object.values(ROLES).map((value) => ({ value, label: LABELS.role[value] }))}
        />
      </div>
      {loading ? <Spinner /> : null}
      <ErrorBox error={error} />
      {!loading && !users.length ? <EmptyState title="Không có người dùng" /> : null}
      {users.length ? (
        <Card>
          <Table
            rowKey={(row) => oid(row)}
            rows={users}
            columns={[
              {
                key: 'name',
                header: 'Họ tên',
                render: (row) => (
                  <div>
                    <p className="font-medium">{row.fullName}</p>
                    <p className="text-xs text-ink/50">{row.email}</p>
                  </div>
                ),
              },
              { key: 'role', header: 'Vai trò', render: (row) => <Badge value={row.role} map={LABELS.role} /> },
              { key: 'phone', header: 'Điện thoại', render: (row) => row.phone || '—' },
              {
                key: 'active',
                header: 'Tài khoản',
                render: (row) => (row.isActive ? 'Hoạt động' : 'Khoá'),
              },
              {
                key: 'bene',
                header: 'Hộ gia đình',
                render: (row) =>
                  row.role === 'BENEFICIARY' ? row.beneficiaryInfo?.householdSize || '—' : '—',
              },
              { key: 'at', header: 'Tạo lúc', render: (row) => formatDate(row.createdAt) },
            ]}
          />
        </Card>
      ) : null}
    </div>
  );
}
