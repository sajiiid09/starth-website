import { Navigate, Route } from "react-router-dom";
import { createPageUrl } from "@/utils";
import RoleGate from "@/components/auth/RoleGate";
import {
  PlanWithAI,
  UserCreateEvent,
  UserDashboardHome,
  UserEvents,
  UserMessages,
  UserSettings
} from "./lazyPages";

const DashboardRoutes = (
  <>
    <Route
      path={createPageUrl("Dashboard")}
      element={
        <RoleGate allowedRoles={["user"]}>
          <UserDashboardHome />
        </RoleGate>
      }
    />

    <Route path="/dashboard/home" element={<Navigate to={createPageUrl("Dashboard")} replace />} />

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
  </>
);

export default DashboardRoutes;
