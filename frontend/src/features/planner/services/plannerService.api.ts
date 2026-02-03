import { PlannerService } from "@/features/planner/types";

const notImplemented = () => {
  throw new Error("plannerService.api not implemented");
};

export const plannerServiceApi: PlannerService = {
  async sendMessage() {
    return notImplemented();
  },
  createNewSession() {
    return notImplemented();
  },
  seedSessions() {
    return notImplemented();
  },
  retitleSessionFromFirstMessage() {
    return notImplemented();
  },
  async approveLayout() {
    return notImplemented();
  }
};
