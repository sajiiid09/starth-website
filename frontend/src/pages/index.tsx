import Layout from "./Layout";

import Home from "./Home";

import AIPlanner from "./AIPlanner";

import DFY from "./DFY";

import Marketplace from "./Marketplace";

import CaseStudies from "./CaseStudies";


import CreateEvent from "./CreateEvent";

import Events from "./Events";

import ListSpace from "./ListSpace";

import VenueDetails from "./VenueDetails";

import ServiceDetails from "./ServiceDetails";

import EventDetails from "./EventDetails";

import EditEvent from "./EditEvent";

import PlanDetails from "./PlanDetails";

import VenuePortal from "./VenuePortal";

import ProviderPortal from "./ProviderPortal";

import VenueOrganization from "./VenueOrganization";

import VenueListings from "./VenueListings";

import VenueInsurance from "./VenueInsurance";

import VenueDocuments from "./VenueDocuments";

import VenueAvailability from "./VenueAvailability";

import VenueSettings from "./VenueSettings";

import Checklist from "./Checklist";

import EventMarketingDashboard from "./EventMarketingDashboard";

import Marketing from "./Marketing";

import ProviderServices from "./ProviderServices";

import ProviderDocuments from "./ProviderDocuments";

import ProviderInsurance from "./ProviderInsurance";

import VenueMessages from "./VenueMessages";

import ProviderSettings from "./ProviderSettings";

import ProviderMessages from "./ProviderMessages";

import ProviderOrganization from "./ProviderOrganization";

import Messages from "./Messages";

import PaymentMethods from "./PaymentMethods";

import AddVenue from "./AddVenue";

import ProfileSettings from "./ProfileSettings";

import EventCalendar from "./EventCalendar";

import About from "./About";

import Contact from "./Contact";

import Terms from "./Terms";

import Privacy from "./Privacy";

import DashboardPreview from "./DashboardPreview";

import EditVenue from "./EditVenue";

import VerifyEmail from "./VerifyEmail";

import ResetPassword from "./ResetPassword";

import AppStrathwell from "./AppStrathwell";

import AppEntry from "./AppEntry";

import WhyStrathwell from "./WhyStrathwell";

import VirtualRobotics from "./VirtualRobotics";

import EventBuilder from "./EventBuilder";

import Templates from "./Templates";

import Vendors from "./Vendors";

import Legals from "./Legals";

import Reviews from "./Reviews";

import Legal from "./Legal";
import NotFoundPage from "./NotFoundPage";

import TemplateDetails from "./TemplateDetails";

import MarketplaceDetails from "./MarketplaceDetails";

import PlansPage from "./PlansPage";

import OrganizerAIWorkspace from "./dashboard/OrganizerAIWorkspace";

import UserEvents from "./dashboard/UserEvents";

import UserCreateEvent from "./dashboard/UserCreateEvent";

import UserMessages from "./dashboard/UserMessages";

import UserSettings from "./dashboard/UserSettings";

import PlanWithAI from "./dashboard/PlanWithAI";

import VendorDashboardHome from "./vendor/VendorDashboardHome";

import VendorListings from "./vendor/VendorListings";

import VendorInquiries from "./vendor/VendorInquiries";

import VendorCalendar from "./vendor/VendorCalendar";

import VendorSettings from "./vendor/VendorSettings";

import VenueOnboarding from "./vendor/VenueOnboarding";

import ServiceOnboarding from "./vendor/ServiceOnboarding";

import VendorTypeSelect from "./vendor/VendorTypeSelect";

import VendorProfile from "./vendor/VendorProfile";

import VendorSubmission from "./vendor/VendorSubmission";

import AdminDashboardHome from "./admin/AdminDashboardHome";
import AdminFinanceOverview from "./admin/AdminFinanceOverview";
import AdminBookings from "./admin/AdminBookings";
import AdminBookingDetail from "./admin/AdminBookingDetail";
import AdminPayments from "./admin/AdminPayments";
import AdminPayouts from "./admin/AdminPayouts";
import AdminAuditLogs from "./admin/AdminAuditLogs";
import AdminDisputes from "./admin/AdminDisputes";
import AdminDisputeDetail from "./admin/AdminDisputeDetail";
import AdminOps from "./admin/AdminOps";

import AdminUsers from "./admin/AdminUsers";

import AdminVendors from "./admin/AdminVendors";
import AdminVendorReview from "./admin/AdminVendorReview";

import AdminTemplates from "./admin/AdminTemplates";

import AdminSettings from "./admin/AdminSettings";

import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import RoleGate from "@/components/auth/RoleGate";
import ScrollToTop from "@/components/shared/ScrollToTop";
import { hasAdminOpsTools } from "@/features/admin/config";

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    return (
        <>
            <ScrollToTop />
            <Layout>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path={createPageUrl("Home")} element={<Navigate to="/" replace />} />

                <Route path="/app-entry" element={<Navigate to={createPageUrl("AppEntry")} replace />} />

                <Route path="/signin" element={<Navigate to={createPageUrl("AppEntry")} replace />} />
                
                <Route path={createPageUrl("AIPlanner")} element={<AIPlanner />} />
                
                <Route path={createPageUrl("DFY")} element={<DFY />} />
                
                <Route path={createPageUrl("Marketplace")} element={<Marketplace />} />

                <Route path="/marketplace/:id" element={<MarketplaceDetails />} />
                
                <Route path={createPageUrl("CaseStudies")} element={<CaseStudies />} />
                
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
                
                <Route path={createPageUrl("CreateEvent")} element={<CreateEvent />} />
                
                <Route path={createPageUrl("Events")} element={<Events />} />
                
                <Route path={createPageUrl("ListSpace")} element={<ListSpace />} />
                
                <Route path={createPageUrl("VenueDetails")} element={<VenueDetails />} />
                
                <Route path={createPageUrl("ServiceDetails")} element={<ServiceDetails />} />
                
                <Route path={createPageUrl("EventDetails")} element={<EventDetails />} />
                
                <Route path={createPageUrl("EditEvent")} element={<EditEvent />} />
                
                <Route path={createPageUrl("PlanDetails")} element={<PlanDetails />} />
                
                <Route path={createPageUrl("VenuePortal")} element={<VenuePortal />} />
                
                <Route path={createPageUrl("ProviderPortal")} element={<ProviderPortal />} />
                
                <Route path={createPageUrl("VenueOrganization")} element={<VenueOrganization />} />
                
                <Route path={createPageUrl("VenueListings")} element={<VenueListings />} />
                
                <Route path={createPageUrl("VenueInsurance")} element={<VenueInsurance />} />
                
                <Route path={createPageUrl("VenueDocuments")} element={<VenueDocuments />} />
                
                <Route path={createPageUrl("VenueAvailability")} element={<VenueAvailability />} />
                
                <Route path={createPageUrl("VenueSettings")} element={<VenueSettings />} />
                
                <Route path={createPageUrl("Checklist")} element={<Checklist />} />
                
                <Route path={createPageUrl("EventMarketingDashboard")} element={<EventMarketingDashboard />} />
                
                <Route path={createPageUrl("Marketing")} element={<Marketing />} />
                
                <Route path={createPageUrl("ProviderServices")} element={<ProviderServices />} />
                
                <Route path={createPageUrl("ProviderDocuments")} element={<ProviderDocuments />} />
                
                <Route path={createPageUrl("ProviderInsurance")} element={<ProviderInsurance />} />
                
                <Route path={createPageUrl("VenueMessages")} element={<VenueMessages />} />
                
                <Route path={createPageUrl("ProviderSettings")} element={<ProviderSettings />} />
                
                <Route path={createPageUrl("ProviderMessages")} element={<ProviderMessages />} />
                
                <Route path={createPageUrl("ProviderOrganization")} element={<ProviderOrganization />} />
                
                <Route path={createPageUrl("Messages")} element={<Messages />} />
                
                <Route path={createPageUrl("PaymentMethods")} element={<PaymentMethods />} />
                
                <Route path={createPageUrl("AddVenue")} element={<AddVenue />} />
                
                <Route path={createPageUrl("ProfileSettings")} element={<ProfileSettings />} />
                
                <Route path={createPageUrl("EventCalendar")} element={<EventCalendar />} />
                
                <Route path={createPageUrl("About")} element={<About />} />
                
                <Route path={createPageUrl("Contact")} element={<Contact />} />
                
                <Route path={createPageUrl("Terms")} element={<Terms />} />
                
                <Route path={createPageUrl("Privacy")} element={<Privacy />} />
                
                <Route path={createPageUrl("DashboardPreview")} element={<DashboardPreview />} />
                
                <Route path={createPageUrl("EditVenue")} element={<EditVenue />} />
                
                <Route path={createPageUrl("VerifyEmail")} element={<VerifyEmail />} />
                
                <Route path={createPageUrl("ResetPassword")} element={<ResetPassword />} />
                
                <Route path={createPageUrl("AppStrathwell")} element={<AppStrathwell />} />
                
                <Route path={createPageUrl("AppEntry")} element={<AppEntry />} />
                
                <Route path={createPageUrl("WhyStrathwell")} element={<WhyStrathwell />} />
                
                <Route path={createPageUrl("VirtualRobotics")} element={<VirtualRobotics />} />
                
                <Route path={createPageUrl("EventBuilder")} element={<EventBuilder />} />

                <Route path={createPageUrl("Templates")} element={<Templates />} />

                <Route path="/templates/:id" element={<TemplateDetails />} />

                <Route path={createPageUrl("Vendors")} element={<Vendors />} />

                <Route path={createPageUrl("Plans")} element={<PlansPage />} />

                <Route path={createPageUrl("Legals")} element={<Legals />} />

                <Route path={createPageUrl("Reviews")} element={<Reviews />} />

                <Route path={createPageUrl("Legal")} element={<Legal />} />

                <Route path="*" element={<NotFoundPage />} />
                
            </Routes>
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
