import { Route } from "react-router-dom";
import RoleGate from "@/components/auth/RoleGate";
import { hasAdminOpsTools } from "@/features/admin/config";
import {
  AdminAuditLogs,
  AdminBookingDetail,
  AdminBookings,
  AdminDashboardHome,
  AdminDisputeDetail,
  AdminDisputes,
  AdminFinanceOverview,
  AdminOps,
  AdminPayments,
  AdminPayouts,
  AdminSettings,
  AdminTemplates,
  AdminUsers,
  AdminVendorReview,
  AdminVendors
} from "./lazyPages";

const AdminRoutes = (
  <>
    <Route
      path="/admin"
      element={
        <RoleGate allowedRoles={["admin"]}>
          <AdminDashboardHome />
        </RoleGate>
      }
    />

    <Route
      path="/admin/users"
      element={
        <RoleGate allowedRoles={["admin"]}>
          <AdminUsers />
        </RoleGate>
      }
    />

    <Route
      path="/admin/vendors"
      element={
        <RoleGate allowedRoles={["admin"]}>
          <AdminVendors />
        </RoleGate>
      }
    />

    <Route
      path="/admin/vendors/:vendorId"
      element={
        <RoleGate allowedRoles={["admin"]}>
          <AdminVendorReview />
        </RoleGate>
      }
    />

    <Route
      path="/admin/finance"
      element={
        <RoleGate allowedRoles={["admin"]}>
          <AdminFinanceOverview />
        </RoleGate>
      }
    />

    <Route
      path="/admin/bookings"
      element={
        <RoleGate allowedRoles={["admin"]}>
          <AdminBookings />
        </RoleGate>
      }
    />

    <Route
      path="/admin/bookings/:bookingId"
      element={
        <RoleGate allowedRoles={["admin"]}>
          <AdminBookingDetail />
        </RoleGate>
      }
    />

    <Route
      path="/admin/payments"
      element={
        <RoleGate allowedRoles={["admin"]}>
          <AdminPayments />
        </RoleGate>
      }
    />

    <Route
      path="/admin/payouts"
      element={
        <RoleGate allowedRoles={["admin"]}>
          <AdminPayouts />
        </RoleGate>
      }
    />

    <Route
      path="/admin/audit"
      element={
        <RoleGate allowedRoles={["admin"]}>
          <AdminAuditLogs />
        </RoleGate>
      }
    />

    <Route
      path="/admin/disputes"
      element={
        <RoleGate allowedRoles={["admin"]}>
          <AdminDisputes />
        </RoleGate>
      }
    />

    <Route
      path="/admin/disputes/:disputeId"
      element={
        <RoleGate allowedRoles={["admin"]}>
          <AdminDisputeDetail />
        </RoleGate>
      }
    />

    {hasAdminOpsTools && (
      <Route
        path="/admin/ops"
        element={
          <RoleGate allowedRoles={["admin"]}>
            <AdminOps />
          </RoleGate>
        }
      />
    )}

    <Route
      path="/admin/templates"
      element={
        <RoleGate allowedRoles={["admin"]}>
          <AdminTemplates />
        </RoleGate>
      }
    />

    <Route
      path="/admin/settings"
      element={
        <RoleGate allowedRoles={["admin"]}>
          <AdminSettings />
        </RoleGate>
      }
    />
  </>
);

export default AdminRoutes;
