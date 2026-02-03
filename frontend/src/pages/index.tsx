import { Suspense, lazy } from "react";
import Layout from "./Layout";
import Home from "./Home";
import AppEntry from "./AppEntry";
import NotFoundPage from "./NotFoundPage";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { createPageUrl } from "@/utils";
import RoleGate from "@/components/auth/RoleGate";
import ScrollToTop from "@/components/shared/ScrollToTop";
import RouteLoader from "@/components/RouteLoader";
import { hasAdminOpsTools } from "@/features/admin/config";

const AIPlanner = lazy(() => import("./AIPlanner"));
const DFY = lazy(() => import("./DFY"));
const Marketplace = lazy(() => import("./Marketplace"));
const CaseStudies = lazy(() => import("./CaseStudies"));
const CreateEvent = lazy(() => import("./CreateEvent"));
const Events = lazy(() => import("./Events"));
const ListSpace = lazy(() => import("./ListSpace"));
const VenueDetails = lazy(() => import("./VenueDetails"));
const ServiceDetails = lazy(() => import("./ServiceDetails"));
const EventDetails = lazy(() => import("./EventDetails"));
const EditEvent = lazy(() => import("./EditEvent"));
const PlanDetails = lazy(() => import("./PlanDetails"));
const VenuePortal = lazy(() => import("./VenuePortal"));
const ProviderPortal = lazy(() => import("./ProviderPortal"));
const VenueOrganization = lazy(() => import("./VenueOrganization"));
const VenueListings = lazy(() => import("./VenueListings"));
const VenueInsurance = lazy(() => import("./VenueInsurance"));
const VenueDocuments = lazy(() => import("./VenueDocuments"));
const VenueAvailability = lazy(() => import("./VenueAvailability"));
const VenueSettings = lazy(() => import("./VenueSettings"));
const Checklist = lazy(() => import("./Checklist"));
const EventMarketingDashboard = lazy(() => import("./EventMarketingDashboard"));
const Marketing = lazy(() => import("./Marketing"));
const ProviderServices = lazy(() => import("./ProviderServices"));
const ProviderDocuments = lazy(() => import("./ProviderDocuments"));
const ProviderInsurance = lazy(() => import("./ProviderInsurance"));
const VenueMessages = lazy(() => import("./VenueMessages"));
const ProviderSettings = lazy(() => import("./ProviderSettings"));
const ProviderMessages = lazy(() => import("./ProviderMessages"));
const ProviderOrganization = lazy(() => import("./ProviderOrganization"));
const Messages = lazy(() => import("./Messages"));
const PaymentMethods = lazy(() => import("./PaymentMethods"));
const AddVenue = lazy(() => import("./AddVenue"));
const ProfileSettings = lazy(() => import("./ProfileSettings"));
const EventCalendar = lazy(() => import("./EventCalendar"));
const About = lazy(() => import("./About"));
const Contact = lazy(() => import("./Contact"));
const Terms = lazy(() => import("./Terms"));
const Privacy = lazy(() => import("./Privacy"));
const DashboardPreview = lazy(() => import("./DashboardPreview"));
const EditVenue = lazy(() => import("./EditVenue"));
const VerifyEmail = lazy(() => import("./VerifyEmail"));
const ResetPassword = lazy(() => import("./ResetPassword"));
const AppStrathwell = lazy(() => import("./AppStrathwell"));
const WhyStrathwell = lazy(() => import("./WhyStrathwell"));
const VirtualRobotics = lazy(() => import("./VirtualRobotics"));
const EventBuilder = lazy(() => import("./EventBuilder"));
const Templates = lazy(() => import("./Templates"));
const Vendors = lazy(() => import("./Vendors"));
const Legals = lazy(() => import("./Legals"));
const Reviews = lazy(() => import("./Reviews"));
const Legal = lazy(() => import("./Legal"));
const TemplateDetails = lazy(() => import("./TemplateDetails"));
const MarketplaceDetails = lazy(() => import("./MarketplaceDetails"));
const PlansPage = lazy(() => import("./PlansPage"));
const OrganizerAIWorkspace = lazy(() => import("./dashboard/OrganizerAIWorkspace"));
const UserEvents = lazy(() => import("./dashboard/UserEvents"));
const UserCreateEvent = lazy(() => import("./dashboard/UserCreateEvent"));
const UserMessages = lazy(() => import("./dashboard/UserMessages"));
const UserSettings = lazy(() => import("./dashboard/UserSettings"));
const PlanWithAI = lazy(() => import("./dashboard/PlanWithAI"));
const VendorDashboardHome = lazy(() => import("./vendor/VendorDashboardHome"));
const VendorListings = lazy(() => import("./vendor/VendorListings"));
const VendorInquiries = lazy(() => import("./vendor/VendorInquiries"));
const VendorCalendar = lazy(() => import("./vendor/VendorCalendar"));
const VendorSettings = lazy(() => import("./vendor/VendorSettings"));
const VenueOnboarding = lazy(() => import("./vendor/VenueOnboarding"));
const ServiceOnboarding = lazy(() => import("./vendor/ServiceOnboarding"));
const VendorTypeSelect = lazy(() => import("./vendor/VendorTypeSelect"));
const VendorProfile = lazy(() => import("./vendor/VendorProfile"));
const VendorSubmission = lazy(() => import("./vendor/VendorSubmission"));
const AdminDashboardHome = lazy(() => import("./admin/AdminDashboardHome"));
const AdminFinanceOverview = lazy(() => import("./admin/AdminFinanceOverview"));
const AdminBookings = lazy(() => import("./admin/AdminBookings"));
const AdminBookingDetail = lazy(() => import("./admin/AdminBookingDetail"));
const AdminPayments = lazy(() => import("./admin/AdminPayments"));
const AdminPayouts = lazy(() => import("./admin/AdminPayouts"));
const AdminAuditLogs = lazy(() => import("./admin/AdminAuditLogs"));
const AdminDisputes = lazy(() => import("./admin/AdminDisputes"));
const AdminDisputeDetail = lazy(() => import("./admin/AdminDisputeDetail"));
const AdminOps = lazy(() => import("./admin/AdminOps"));
const AdminUsers = lazy(() => import("./admin/AdminUsers"));
const AdminVendors = lazy(() => import("./admin/AdminVendors"));
const AdminVendorReview = lazy(() => import("./admin/AdminVendorReview"));
const AdminTemplates = lazy(() => import("./admin/AdminTemplates"));
const AdminSettings = lazy(() => import("./admin/AdminSettings"));

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
  return (
    <>
      <ScrollToTop />
      <Layout>
        <Suspense fallback={<RouteLoader />}>
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
