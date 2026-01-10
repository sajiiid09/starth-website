import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

const users = [
  { name: "Ava Chen", role: "User", status: "Active" },
  { name: "Jordan Miles", role: "User", status: "Pending" },
  { name: "Elena Park", role: "User", status: "Active" }
];

const AdminUsers: React.FC = () => {
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
                <TableRow key={user.name}>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
