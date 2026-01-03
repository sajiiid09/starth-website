import Layout from "./Layout.jsx";

import Home from "./Home";

import AIPlanner from "./AIPlanner";

import DFY from "./DFY";

import Marketplace from "./Marketplace";

import CaseStudies from "./CaseStudies";

import Dashboard from "./Dashboard";

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

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    AIPlanner: AIPlanner,
    
    DFY: DFY,
    
    Marketplace: Marketplace,
    
    CaseStudies: CaseStudies,
    
    Dashboard: Dashboard,
    
    CreateEvent: CreateEvent,
    
    Events: Events,
    
    ListSpace: ListSpace,
    
    VenueDetails: VenueDetails,
    
    ServiceDetails: ServiceDetails,
    
    EventDetails: EventDetails,
    
    EditEvent: EditEvent,
    
    PlanDetails: PlanDetails,
    
    VenuePortal: VenuePortal,
    
    ProviderPortal: ProviderPortal,
    
    VenueOrganization: VenueOrganization,
    
    VenueListings: VenueListings,
    
    VenueInsurance: VenueInsurance,
    
    VenueDocuments: VenueDocuments,
    
    VenueAvailability: VenueAvailability,
    
    VenueSettings: VenueSettings,
    
    Checklist: Checklist,
    
    EventMarketingDashboard: EventMarketingDashboard,
    
    Marketing: Marketing,
    
    ProviderServices: ProviderServices,
    
    ProviderDocuments: ProviderDocuments,
    
    ProviderInsurance: ProviderInsurance,
    
    VenueMessages: VenueMessages,
    
    ProviderSettings: ProviderSettings,
    
    ProviderMessages: ProviderMessages,
    
    ProviderOrganization: ProviderOrganization,
    
    Messages: Messages,
    
    PaymentMethods: PaymentMethods,
    
    AddVenue: AddVenue,
    
    ProfileSettings: ProfileSettings,
    
    EventCalendar: EventCalendar,
    
    About: About,
    
    Contact: Contact,
    
    Terms: Terms,
    
    Privacy: Privacy,
    
    DashboardPreview: DashboardPreview,
    
    EditVenue: EditVenue,
    
    VerifyEmail: VerifyEmail,
    
    ResetPassword: ResetPassword,
    
    AppStrathwell: AppStrathwell,
    
    AppEntry: AppEntry,
    
    WhyStrathwell: WhyStrathwell,
    
    VirtualRobotics: VirtualRobotics,
    
    EventBuilder: EventBuilder,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/AIPlanner" element={<AIPlanner />} />
                
                <Route path="/DFY" element={<DFY />} />
                
                <Route path="/Marketplace" element={<Marketplace />} />
                
                <Route path="/CaseStudies" element={<CaseStudies />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/CreateEvent" element={<CreateEvent />} />
                
                <Route path="/Events" element={<Events />} />
                
                <Route path="/ListSpace" element={<ListSpace />} />
                
                <Route path="/VenueDetails" element={<VenueDetails />} />
                
                <Route path="/ServiceDetails" element={<ServiceDetails />} />
                
                <Route path="/EventDetails" element={<EventDetails />} />
                
                <Route path="/EditEvent" element={<EditEvent />} />
                
                <Route path="/PlanDetails" element={<PlanDetails />} />
                
                <Route path="/VenuePortal" element={<VenuePortal />} />
                
                <Route path="/ProviderPortal" element={<ProviderPortal />} />
                
                <Route path="/VenueOrganization" element={<VenueOrganization />} />
                
                <Route path="/VenueListings" element={<VenueListings />} />
                
                <Route path="/VenueInsurance" element={<VenueInsurance />} />
                
                <Route path="/VenueDocuments" element={<VenueDocuments />} />
                
                <Route path="/VenueAvailability" element={<VenueAvailability />} />
                
                <Route path="/VenueSettings" element={<VenueSettings />} />
                
                <Route path="/Checklist" element={<Checklist />} />
                
                <Route path="/EventMarketingDashboard" element={<EventMarketingDashboard />} />
                
                <Route path="/Marketing" element={<Marketing />} />
                
                <Route path="/ProviderServices" element={<ProviderServices />} />
                
                <Route path="/ProviderDocuments" element={<ProviderDocuments />} />
                
                <Route path="/ProviderInsurance" element={<ProviderInsurance />} />
                
                <Route path="/VenueMessages" element={<VenueMessages />} />
                
                <Route path="/ProviderSettings" element={<ProviderSettings />} />
                
                <Route path="/ProviderMessages" element={<ProviderMessages />} />
                
                <Route path="/ProviderOrganization" element={<ProviderOrganization />} />
                
                <Route path="/Messages" element={<Messages />} />
                
                <Route path="/PaymentMethods" element={<PaymentMethods />} />
                
                <Route path="/AddVenue" element={<AddVenue />} />
                
                <Route path="/ProfileSettings" element={<ProfileSettings />} />
                
                <Route path="/EventCalendar" element={<EventCalendar />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/Contact" element={<Contact />} />
                
                <Route path="/Terms" element={<Terms />} />
                
                <Route path="/Privacy" element={<Privacy />} />
                
                <Route path="/DashboardPreview" element={<DashboardPreview />} />
                
                <Route path="/EditVenue" element={<EditVenue />} />
                
                <Route path="/VerifyEmail" element={<VerifyEmail />} />
                
                <Route path="/ResetPassword" element={<ResetPassword />} />
                
                <Route path="/AppStrathwell" element={<AppStrathwell />} />
                
                <Route path="/AppEntry" element={<AppEntry />} />
                
                <Route path="/WhyStrathwell" element={<WhyStrathwell />} />
                
                <Route path="/VirtualRobotics" element={<VirtualRobotics />} />
                
                <Route path="/EventBuilder" element={<EventBuilder />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}