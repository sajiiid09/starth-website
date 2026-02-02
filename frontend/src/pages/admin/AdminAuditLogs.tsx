import React from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useAdminQuery } from "@/features/admin/hooks/useAdminQuery";
import { adminService } from "@/features/admin/services/adminService";
import type { AdminResourceType } from "@/features/admin/types";

const resourceTypes: Array<AdminResourceType> = ["VENDOR", "BOOKING", "PAYMENT", "PAYOUT", "DISPUTE"];

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });

const TableSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="grid grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((__, col) => (
            <Skeleton key={col} className="h-8 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
};

const AdminAuditLogs: React.FC = () => {
  const [query, setQuery] = React.useState("");
  const [action, setAction] = React.useState<string>("ALL");
  const [resourceType, setResourceType] = React.useState<string>("ALL");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  const { data, isLoading, error, refetch } = useAdminQuery(
    () =>
      adminService.listAuditLogs({
        q: query || undefined,
        action: action === "ALL" ? undefined : action,
        resourceType: resourceType === "ALL" ? undefined : (resourceType as AdminResourceType)
      }),
    [query, action, resourceType]
  );

  const actions = React.useMemo(() => {
    const actionSet = new Set((data ?? []).map((entry) => entry.action));
    return Array.from(actionSet).sort();
  }, [data]);

  const filteredByDate = React.useMemo(() => {
    return (data ?? []).filter((entry) => {
      const ts = new Date(entry.timestamp).getTime();
      if (dateFrom) {
        const start = new Date(`${dateFrom}T00:00:00`).getTime();
        if (ts < start) return false;
      }
      if (dateTo) {
        const end = new Date(`${dateTo}T23:59:59`).getTime();
        if (ts > end) return false;
      }
      return true;
    });
  }, [data, dateFrom, dateTo]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">Control Plane</p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Audit logs</h1>
        <p className="mt-2 text-sm text-gray-600">Track admin actions and inspect metadata per event.</p>
      </div>

      <Card className="border-none shadow-soft">
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-3 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search logs"
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All actions</SelectItem>
                {actions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={resourceType} onValueChange={setResourceType}>
              <SelectTrigger>
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All resources</SelectItem>
                {resourceTypes.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-2">
              <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
              <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
            </div>
          </div>

          {isLoading && <TableSkeleton />}

          {!isLoading && error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              Failed to load audit logs. {error.message}
              <Button variant="outline" className="mt-3" onClick={() => void refetch()}>
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !error && filteredByDate.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-600">
              No audit logs match your filters.
            </div>
          )}

          {!isLoading && !error && filteredByDate.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead className="text-right">Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredByDate.map((entry) => {
                  const isOpen = Boolean(expanded[entry.id]);
                  return (
                    <React.Fragment key={entry.id}>
                      <TableRow>
                        <TableCell>{dateTime(entry.timestamp)}</TableCell>
                        <TableCell>{entry.actor}</TableCell>
                        <TableCell className="font-medium">{entry.action}</TableCell>
                        <TableCell>{entry.resourceType} · {entry.resourceId}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpanded((prev) => ({ ...prev, [entry.id]: !isOpen }))}
                          >
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            {isOpen ? "Hide" : "View"}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-gray-50">
                            <pre className="whitespace-pre-wrap text-xs text-gray-700">
                              {JSON.stringify(entry.metadata ?? {}, null, 2)}
                            </pre>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuditLogs;
