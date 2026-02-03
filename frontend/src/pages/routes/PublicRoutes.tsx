import Home from "../Home";
import { Navigate, Route } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  AIPlanner,
  About,
  AddVenue,
  AppStrathwell,
  CaseStudies,
  Checklist,
  Contact,
  CreateEvent,
  DashboardPreview,
  DFY,
  EditEvent,
  EditVenue,
  EventBuilder,
  EventCalendar,
  EventDetails,
  EventMarketingDashboard,
  Events,
  Legal,
  Legals,
  ListSpace,
  Marketplace,
  MarketplaceDetails,
  Marketing,
  Messages,
  PaymentMethods,
  PlanDetails,
  PlansPage,
  Privacy,
  ProfileSettings,
  ProviderDocuments,
  ProviderInsurance,
  ProviderMessages,
  ProviderOrganization,
  ProviderPortal,
  ProviderServices,
  ProviderSettings,
  Reviews,
  ServiceDetails,
  TemplateDetails,
  Templates,
  Terms,
  Vendors,
  VenueAvailability,
  VenueDetails,
  VenueDocuments,
  VenueInsurance,
  VenueListings,
  VenueMessages,
  VenueOrganization,
  VenuePortal,
  VenueSettings,
  VirtualRobotics,
  WhyStrathwell
} from "./lazyPages";

export default function PublicRoutes() {
  return (
    <>
      <Route path="/" element={<Home />} />
      <Route path={createPageUrl("Home")} element={<Navigate to="/" replace />} />

      <Route path={createPageUrl("AIPlanner")} element={<AIPlanner />} />
      <Route path={createPageUrl("DFY")} element={<DFY />} />
      <Route path={createPageUrl("Marketplace")} element={<Marketplace />} />
      <Route path="/marketplace/:id" element={<MarketplaceDetails />} />
      <Route path={createPageUrl("CaseStudies")} element={<CaseStudies />} />

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
      <Route
        path={createPageUrl("EventMarketingDashboard")}
        element={<EventMarketingDashboard />}
      />
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
      <Route path={createPageUrl("AppStrathwell")} element={<AppStrathwell />} />
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
    </>
  );
}
