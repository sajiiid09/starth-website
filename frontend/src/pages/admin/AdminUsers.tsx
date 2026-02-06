import React, { useEffect, useState } from "react";
import { SpinnerGap } from "@phosphor-icons/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@/api/entities";

type UserRow = {
  id: string;
  name: string;
  role: string;
  status: string;
};

function normalizeUser(raw: any): UserRow {
  const data = raw.data ?? raw;
  const fullName =
    data.full_name ??
    ([data.first_name, data.last_name].filter(Boolean).join(" ") || data.email) ??
    "Unknown";

  return {
    id: raw.id ?? data.id ?? crypto.randomUUID(),
    name: fullName,
    role: (data.role ?? "user").charAt(0).toUpperCase() + (data.role ?? "user").slice(1),
    status: data.is_verified ? "Active" : "Pending",
  };
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const raw = await User.list();
        const list = Array.isArray(raw) ? raw : (raw as any)?.data ?? [];
        setUsers(list.map(normalizeUser));
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <SpinnerGap className="size-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Users
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">User management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review onboarding status and engagement trends.
        </p>
      </div>

      <Card className="border-none shadow-soft">
        <CardContent className="p-6">
          {users.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No users found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-gray-900">{user.name}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-semibold text-brand-teal">
                        {user.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
