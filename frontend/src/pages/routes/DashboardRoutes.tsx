import { Route } from "react-router-dom";
import { createPageUrl } from "@/utils";
import RoleGate from "@/components/auth/RoleGate";
import {
  OrganizerAIWorkspace,
  PlanWithAI,
  UserCreateEvent,
  UserEvents,
  UserMessages,
  UserSettings
} from "./lazyPages";

export default function DashboardRoutes() {
  return (
    <>
      <Route
        path={createPageUrl("Dashboard")}
        element={
          <RoleGate allowedRoles={["user"]}>
            <OrganizerAIWorkspace />
          </RoleGate>
        }
      />

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
        path="/dashboard/plan-with-ai"
        element={
          <RoleGate allowedRoles={["user"]}>
            <PlanWithAI />
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
}
