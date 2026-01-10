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

const vendors = [
  { name: "Lumen AV", category: "Production", status: "Active" },
  { name: "Citrine Culinary", category: "Catering", status: "Pending" },
  { name: "Bloom & Beam", category: "Decor", status: "Active" }
];

const AdminVendors: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Vendors
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Vendor management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Approve listings and monitor vendor quality.
        </p>
      </div>

      <Card className="border-none shadow-soft">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.name}>
                  <TableCell className="font-medium text-gray-900">{vendor.name}</TableCell>
                  <TableCell>{vendor.category}</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-semibold text-brand-teal">
                      {vendor.status}
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

export default AdminVendors;
