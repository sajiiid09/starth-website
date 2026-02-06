import { Navigate, Route } from "react-router-dom";
import { createPageUrl } from "@/utils";
import RoleGate from "@/components/auth/RoleGate";
import {
  PlanWithAI,
  UserCreateEvent,
  UserEvents,
  UserMarketplace,
  UserMessages,
  UserSettings,
  UserTemplates,
  SuccessPage
} from "./lazyPages";

const DashboardRoutes = (
  <>
    {/* Redirect dashboard home to AI Planner */}
    <Route
      path={createPageUrl("Dashboard")}
      element={<Navigate to="/dashboard/ai-planner" replace />}
    />

    <Route path="/dashboard/home" element={<Navigate to="/dashboard/ai-planner" replace />} />

    <Route
      path="/dashboard/ai-planner"
      element={
        <RoleGate allowedRoles={["user"]}>
          <PlanWithAI />
        </RoleGate>
      }
    />

    <Route path="/dashboard/plan-with-ai" element={<Navigate to="/dashboard/ai-planner" replace />} />

    <Route
      path="/dashboard/events"
      element={
        <RoleGate allowedRoles={["user"]}>
          <UserEvents />
        </RoleGate>
      }
    />

    <Route
      path="/dashboard/templates"
      element={
        <RoleGate allowedRoles={["user"]}>
          <UserTemplates />
        </RoleGate>
      }
    />

    <Route
      path="/dashboard/marketplace"
      element={
        <RoleGate allowedRoles={["user"]}>
          <UserMarketplace />
        </RoleGate>
      }
    />

    <Route
      path="/dashboard/create"
      element={
        <RoleGate allowedRoles={["user"]}>
          <UserCreateEvent />
        </RoleGate>
      }
    />

    <Route
      path="/dashboard/messages"
      element={
        <RoleGate allowedRoles={["user"]}>
          <UserMessages />
        </RoleGate>
      }
    />

    <Route
      path="/dashboard/settings"
      element={
        <RoleGate allowedRoles={["user"]}>
          <UserSettings />
        </RoleGate>
      }
    />

    <Route
      path="/dashboard/success"
      element={
        <RoleGate allowedRoles={["user"]}>
          <SuccessPage />
        </RoleGate>
      }
    />
  </>
);

export default DashboardRoutes;
