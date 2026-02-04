import AppEntry from "../AppEntry";
import { Navigate, Route } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ResetPassword, VerifyEmail } from "./lazyPages";

const AuthRoutes = (
  <>
    <Route path="/app-entry" element={<Navigate to={createPageUrl("AppEntry")} replace />} />
    <Route path="/signin" element={<Navigate to={createPageUrl("AppEntry")} replace />} />

    <Route path={createPageUrl("AppEntry")} element={<AppEntry />} />
    <Route path={createPageUrl("VerifyEmail")} element={<VerifyEmail />} />
    <Route path={createPageUrl("ResetPassword")} element={<ResetPassword />} />
  </>
);

export default AuthRoutes;
