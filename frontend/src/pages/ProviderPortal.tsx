import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Organization } from "@/api/entities";
import { Service } from "@/api/entities";
import { ServiceProvider } from "@/api/entities";
import { InsurancePolicy } from "@/api/entities";
import { Document } from "@/api/entities";
import { Booking } from "@/api/entities";
import { ConversationParticipant } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, WarningCircle, ArrowRight, SpinnerGap, Buildings, FileText, Shield, Briefcase, Gear, CurrencyDollar, TrendUp, Envelope, Plus } from "@phosphor-icons/react";
import RoleGuard from "../components/auth/RoleGuard";
import ProviderPortalLayout from "../components/provider/ProviderPortalLayout";

export default function ProviderPortalPage() {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [services, setServices] = useState([]);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [insurance, setInsurance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completionData, setCompletionData] = useState({
    profile: 0,
    services: 0,
    documents: 0,
    insurance: 0,
    overall: 0
  });
  const [stats, setStats] = useState({
    services: 0,
    activeServices: 0,
    bookings: 0,
    revenue: 0,
    messages: 0,
    monthlyRevenue: 0,
    pendingLeads: 0
  });

  useEffect(() => {
    const calculateCompletion = (org, servicesList, docsList, insuranceList, serviceProvidersList) => {
      // Profile completion
      let profileScore = 0;
      if (org) {
        if (org.name) profileScore += 25;
        if (org.description) profileScore += 25;
        if (org.website) profileScore += 25;
        if (org.business_license) profileScore += 25;
      }

      // Services completion - check both Service and ServiceProvider entities
      const totalServices = servicesList.length + serviceProvidersList.length;
      const servicesScore = totalServices > 0 ? 100 : 0;

      // Documents completion (identity + business license required)
      const requiredDocs = ["identity", "business_license"];
      const verifiedDocTypes = [...new Set(docsList.filter(doc => doc.verified_status === "verified").map(doc => doc.doc_type))] as string[];
      const documentsScore = Math.round((verifiedDocTypes.filter((type: string) => requiredDocs.includes(type)).length / requiredDocs.length) * 100);

      // Insurance completion
      const validInsurance = insuranceList.find(policy => {
        const today = new Date();
        const endDate = new Date(policy.end_date);
        return policy.status === "verified" && endDate >= today;
      });
      const insuranceScore = validInsurance ? 100 : 0;

      // Overall completion
      const overall = Math.round((profileScore + servicesScore + documentsScore + insuranceScore) / 4);

      setCompletionData({
        profile: profileScore,
        services: servicesScore,
        documents: documentsScore,
        insurance: insuranceScore,
        overall
      });
    };

    const fetchData = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        const [orgResult, convosResult] = await Promise.allSettled([
          Organization.filter({ owner_user_id: currentUser.id, type: "service_provider" }),
          ConversationParticipant.filter({ user_id: currentUser.id })
        ]);
        
        let org = null;
        if (orgResult.status === 'fulfilled' && orgResult.value.length > 0) {
          org = orgResult.value[0];
          setOrganization(org);
        } else if (orgResult.status === 'rejected') {
          console.error("ProviderPortal: Failed to load organization:", orgResult.reason);
        }
        
        const conversations = convosResult.status === 'fulfilled' ? convosResult.value : [];
        if (convosResult.status === 'rejected') {
          console.error("ProviderPortal: Failed to load conversations:", convosResult.reason);
        }

        const [servicesResult, serviceProvidersResult, docsResult, insuranceResult] = await Promise.allSettled([
          org ? Service.filter({ org_id: org.id }) : Service.filter({ provider_id: currentUser.id }),
          ServiceProvider.filter({ owner_id: currentUser.id }),
          org ? Document.filter({ org_id: org.id }) : Promise.resolve([]),
          org ? InsurancePolicy.filter({ org_id: org.id }) : Promise.resolve([])
        ]);

        let servicesList = servicesResult.status === 'fulfilled' ? servicesResult.value : [];
        if (servicesResult.status === 'rejected') console.error("ProviderPortal: Failed to load services:", servicesResult.reason);
        
        // If org-based search yielded nothing, try user-based search as a fallback
        if (servicesList.length === 0 && org) {
            const userServicesResult = await Service.filter({ provider_id: currentUser.id }).catch(e => {
                console.error("ProviderPortal: Fallback service search failed:", e);
                return [];
            });
            servicesList = userServicesResult;
        }

        const serviceProvidersList = serviceProvidersResult.status === 'fulfilled' ? serviceProvidersResult.value : [];
        if (serviceProvidersResult.status === 'rejected') console.error("ProviderPortal: Failed to load service providers:", serviceProvidersResult.reason);

        const docsList = docsResult.status === 'fulfilled' ? docsResult.value : [];
        if (docsResult.status === 'rejected') console.error("ProviderPortal: Failed to load documents:", docsResult.reason);

        const insuranceList = insuranceResult.status === 'fulfilled' ? insuranceResult.value : []; // FIX: Correctly access insuranceResult.value
        if (insuranceResult.status === 'rejected') console.error("ProviderPortal: Failed to load insurance:", insuranceResult.reason);
        
        setServices(servicesList);
        setServiceProviders(serviceProvidersList);
        setDocuments(docsList);
        setInsurance(insuranceList);

        // Calculate stats using both Service and ServiceProvider data
        const totalServices = servicesList.length + serviceProvidersList.length;
        const activeServicesCount = servicesList.filter(s => s.status === "active").length + 
                             serviceProvidersList.filter(s => s.status === "approved").length;

        // Fetch real booking stats for this provider
        let totalBookings = 0;
        let totalRevenue = 0;
        let monthlyRevenue = 0;
        let pendingLeads = 0;

        try {
          const bookings = await Booking.filter({ provider_id: currentUser.id });
          const bookingList = Array.isArray(bookings) ? bookings : [];
          totalBookings = bookingList.length;

          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          for (const b of bookingList) {
            const amount = Number(b.data?.total_amount ?? b.total_amount ?? b.data?.agreed_price ?? 0);
            totalRevenue += amount;

            const createdAt = b.created_at ? new Date(b.created_at) : null;
            if (createdAt && createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear) {
              monthlyRevenue += amount;
            }

            const status = String(b.data?.status ?? b.status ?? "");
            if (status === "pending" || status === "requested") {
              pendingLeads++;
            }
          }
        } catch (err) {
          console.error("ProviderPortal: Failed to load bookings:", err);
        }

        setStats({
          services: totalServices,
          activeServices: activeServicesCount,
          bookings: totalBookings,
          revenue: totalRevenue,
          monthlyRevenue: monthlyRevenue,
          messages: conversations.length,
          pendingLeads
        });

        calculateCompletion(org, servicesList, docsList, insuranceList, serviceProvidersList);
      } catch (error) {
        console.error("Error fetching provider data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <RoleGuard requiredRole="service_provider">
        <ProviderPortalLayout>
          <div className="flex items-center justify-center h-64">
            <SpinnerGap className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        </ProviderPortalLayout>
      </RoleGuard>
    );
  }

  const StatCard = ({ title, value, icon, description, trend, color = "blue" }: { title: string; value: any; icon: React.ReactElement; description?: string; trend?: string; color?: string }) => (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          {React.cloneElement(icon, { className: `h-4 w-4 text-${color}-600` })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-gray-900 mb-1">{value}</div>
        <div className="flex items-center justify-between">
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
          {trend && (
            <div className="flex items-center text-green-600 text-xs">
              <TrendUp className="w-3 h-3 mr-1" />
              {trend}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const getStepStatus = (score) => {
    if (score === 100) return { status: "complete", color: "text-green-600", icon: CheckCircle };
    if (score > 0) return { status: "progress", color: "text-yellow-600", icon: WarningCircle };
    return { status: "pending", color: "text-gray-400", icon: WarningCircle };
  };

  const steps = [
    {
      title: "Organization Profile",
      description: "Complete your business information",
      score: completionData.profile,
      link: "ProviderOrganization",
      icon: Buildings
    },
    {
      title: "Services",
      description: "Add your service offerings",
      score: completionData.services,
      link: "ProviderServices",
      icon: Briefcase
    },
    {
      title: "Documents",
      description: "Upload required verification documents",
      score: completionData.documents,
      link: "ProviderDocuments",
      icon: FileText
    },
    {
      title: "Insurance",
      description: "Provide insurance certificate",
      score: completionData.insurance,
      link: "ProviderInsurance",
      icon: Shield
    }
  ];

  return (
    <RoleGuard requiredRole="service_provider">
      <ProviderPortalLayout>
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-semibold text-gray-900 mb-2">Service Provider Dashboard</h1>
                  <p className="text-xl text-gray-600">
                    Welcome to your provider portal. Complete your setup to start receiving leads.
                  </p>
                </div>
                
                {user?.roles && user.roles.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Switch to:</span>
                    <div className="flex gap-2">
                      {user.roles.includes('organizer') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            localStorage.setItem('activeRole', 'organizer');
                            window.location.href = createPageUrl('Dashboard');
                          }}
                        >
                          Organizer
                        </Button>
                      )}
                      {user.roles.includes('venue_owner') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            localStorage.setItem('activeRole', 'venue_owner');
                            window.location.href = createPageUrl('VenuePortal');
                          }}
                        >
                          Venue Owner
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatCard
                title="Total Services"
                value={stats.services}
                icon={<Briefcase />}
                description={`${stats.activeServices} active listings`}
                color="blue"
              />
              <StatCard
                title="Total Bookings"
                value={stats.bookings}
                icon={<CheckCircle />}
                description={`${stats.pendingLeads} pending`}
                color="green"
              />
              <StatCard
                title="Total Revenue"
                value={stats.revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                icon={<CurrencyDollar />}
                description="All-time earnings"
                color="purple"
              />
              <StatCard
                title="This Month"
                value={stats.monthlyRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                icon={<TrendUp />}
                description="Current month revenue"
                color="orange"
              />
            </div>

            {stats.services === 0 && !loading && (
              <Card className="border-dashed border-2 border-gray-300 shadow-none mb-8">
                <CardContent className="p-6 text-center">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg text-gray-800">You haven't added any services yet</h3>
                  <p className="text-gray-600 mt-2 mb-4">Add your service offerings to get started and appear in our marketplace.</p>
                  <Link to={createPageUrl("ProviderServices")}>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Service
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Overall Progress */}
            <Card className="border-none shadow-lg mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Setup Progress</h3>
                    <p className="text-gray-600">Complete all steps to appear in our marketplace</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-gray-900">{completionData.overall}%</div>
                    <div className="text-sm text-gray-500">Complete</div>
                  </div>
                </div>
                <Progress value={completionData.overall} className="h-3" />
                {completionData.overall === 100 && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Setup Complete!</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Your profile is complete and will appear in our marketplace after admin approval.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Setup Steps */}
            <div className="grid md:grid-cols-2 gap-6">
              {steps.map((step) => {
                const stepStatus = getStepStatus(step.score);
                return (
                  <Link key={step.title} to={createPageUrl(step.link)}>
                    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${
                              stepStatus.status === "complete" ? "bg-green-100" :
                              stepStatus.status === "progress" ? "bg-yellow-100" : "bg-gray-100"
                            }`}>
                              <step.icon className={`w-6 h-6 ${stepStatus.color}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
                              <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                              <div className="flex items-center gap-2">
                                <Progress value={step.score} className="h-2 flex-1" />
                                <span className="text-sm font-medium text-gray-700">{step.score}%</span>
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </ProviderPortalLayout>
    </RoleGuard>
  );
}