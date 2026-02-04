import { Suspense } from "react";
import Layout from "./Layout";
import NotFoundPage from "./NotFoundPage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ScrollToTop from "@/components/shared/ScrollToTop";
import RouteLoader from "@/components/RouteLoader";
import PublicRoutes from "./routes/PublicRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import DashboardRoutes from "./routes/DashboardRoutes";
import VendorRoutes from "./routes/VendorRoutes";
import AdminRoutes from "./routes/AdminRoutes";

function PagesContent() {
  return (
    <>
      <ScrollToTop />
      <Layout>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            {PublicRoutes}
            {AuthRoutes}
            {DashboardRoutes}
            {VendorRoutes}
            {AdminRoutes}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </>
  );
}

export default function Pages() {
  return (
    <Router>
      <PagesContent />
    </Router>
  );
}
