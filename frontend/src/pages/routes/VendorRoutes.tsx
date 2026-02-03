import { Route } from "react-router-dom";
import RoleGate from "@/components/auth/RoleGate";
import {
  ServiceOnboarding,
  VendorCalendar,
  VendorDashboardHome,
  VendorInquiries,
  VendorListings,
  VendorProfile,
  VendorSettings,
  VendorSubmission,
  VendorTypeSelect,
  VenueOnboarding
} from "./lazyPages";

export default function VendorRoutes() {
  return (
    <>
      <Route
        path="/vendor"
        element={
          <RoleGate allowedRoles={["vendor"]}>
            <VendorDashboardHome />
          </RoleGate>
        }
      />

      <Route
        path="/vendor/listings"
        element={
          <RoleGate allowedRoles={["vendor"]}>
            <VendorListings />
          </RoleGate>
        }
      />

      <Route
        path="/vendor/inquiries"
        element={
          <RoleGate allowedRoles={["vendor"]}>
            <VendorInquiries />
          </RoleGate>
        }
      />

      <Route
        path="/vendor/calendar"
        element={
          <RoleGate allowedRoles={["vendor"]}>
            <VendorCalendar />
          </RoleGate>
        }
      />

      <Route
        path="/vendor/settings"
        element={
          <RoleGate allowedRoles={["vendor"]}>
            <VendorSettings />
          </RoleGate>
        }
      />

      <Route
        path="/vendor/onboarding/select"
        element={
          <RoleGate allowedRoles={["vendor"]}>
            <VendorTypeSelect />
          </RoleGate>
        }
      />

      <Route
        path="/vendor/onboarding/venue"
        element={
          <RoleGate allowedRoles={["vendor"]}>
            <VenueOnboarding />
          </RoleGate>
        }
      />

      <Route
        path="/vendor/onboarding/service"
        element={
          <RoleGate allowedRoles={["vendor"]}>
            <ServiceOnboarding />
          </RoleGate>
        }
      />

      <Route
        path="/vendor/profile"
        element={
          <RoleGate allowedRoles={["vendor"]}>
            <VendorProfile />
          </RoleGate>
        }
      />

      <Route
        path="/vendor/submission"
        element={
          <RoleGate allowedRoles={["vendor"]}>
            <VendorSubmission />
          </RoleGate>
        }
      />
    </>
  );
}
