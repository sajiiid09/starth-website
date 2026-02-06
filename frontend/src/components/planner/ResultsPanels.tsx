import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Users, 
  CurrencyDollar, 
  Star, 
  Clock,
  FloppyDisk, 
  ArrowSquareOut,
  Calendar,
  CheckCircle,
  ChatCircle,
  PlusCircle,
  WarningCircle,
  Sparkle,
  Palette,
  MusicNotes,
  Layout,
  TrendDown,
  TrendUp
} from "@phosphor-icons/react";
import VenueCard from "./VenueCard";
import VendorCard from "./VendorCard";
import { Plan } from "@/api/entities";
import { toast } from "sonner";

export default function ResultsPanels({ plan, onSavePlan, user }) {
  console.log("ResultsPanels received plan:", plan); // Debug log

  const handleRequestQuote = (item) => {
    // This would trigger a messaging flow in a full implementation
    alert(`Quote requested for ${item.name}. (This would open a chat in a full app)`);
  };

  const { venues = [], vendors = [], budget = {} } = plan || {}; // Added budget destructuring
  
  console.log("Venues to display:", venues); // Debug log
  console.log("Vendors to display:", vendors); // Debug log
  console.log("Budget details:", budget); // New debug log

  const handleCreateEvent = async () => {
    if (!user) {
      toast.error("Please sign in to create an event");
      window.location.href = createPageUrl("AppEntry");
      return;
    }

    try {
      const savedPlan = await onSavePlan();
      if (savedPlan) {
        window.location.href = createPageUrl(`EventBuilder?planId=${savedPlan.id}`);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg">
        <CardContent className="p-6">
          <Button 
            onClick={handleCreateEvent}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg font-semibold"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Create Event from This Plan
          </Button>
        </CardContent>
      </Card>


      {/* Creative Concepts Section */}
      {plan.creative_concepts && (
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkle className="w-6 h-6 text-purple-600" />
              Creative Event Concepts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {plan.creative_concepts.venue_layouts?.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-lg">
                  <Layout className="w-5 h-5 text-blue-600" />
                  Unique Venue Layouts
                </h3>
                <div className="grid gap-3">
                  {plan.creative_concepts.venue_layouts.map((layout, i) => (
                    <div key={i} className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-1">{layout.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{layout.description}</p>
                      <Badge variant="secondary" className="text-xs">{layout.best_for}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {plan.creative_concepts.decor_themes?.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-lg">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Decor Themes
                </h3>
                <div className="grid gap-3">
                  {plan.creative_concepts.decor_themes.map((theme, i) => (
                    <div key={i} className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-1">{theme.theme_name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{theme.description}</p>
                      {theme.color_palette?.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-gray-500 mb-1">Color Palette:</p>
                          <div className="flex gap-2 flex-wrap">
                            {theme.color_palette.map((color, ci) => (
                              <div key={ci} className="px-3 py-1 bg-gray-100 rounded-full text-xs">{color}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {theme.key_elements?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Key Elements:</p>
                          <div className="flex flex-wrap gap-1">
                            {theme.key_elements.map((element, ei) => (
                              <Badge key={ei} variant="outline" className="text-xs">{element}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {plan.creative_concepts.entertainment_ideas?.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-lg">
                  <MusicNotes className="w-5 h-5 text-green-600" />
                  Entertainment Ideas
                </h3>
                <div className="grid gap-3">
                  {plan.creative_concepts.entertainment_ideas.map((idea, i) => (
                    <div key={i} className="p-4 bg-white rounded-lg border border-green-200 shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-gray-900">{idea.idea}</h4>
                        <Badge variant="secondary" className="text-xs">{idea.estimated_cost}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{idea.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {plan.creative_concepts.unique_experiences?.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-lg">
                  <Sparkle className="w-5 h-5 text-orange-600" />
                  Unique Experiences
                </h3>
                <div className="grid gap-3">
                  {plan.creative_concepts.unique_experiences.map((exp, i) => (
                    <div key={i} className="p-4 bg-white rounded-lg border border-orange-200 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-1">{exp.experience}</h4>
                      <p className="text-sm text-gray-600">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dynamic Budget Analysis */}
      {budget && (budget.total || budget.venue || budget.vendors || budget.user_budget || (budget.vendor_breakdown && Object.keys(budget.vendor_breakdown).length > 0)) && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CurrencyDollar className="w-5 h-5 text-purple-600" />
              Dynamic Budget Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budget.user_budget && (
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Your Budget</span>
                  <span className="font-bold text-xl text-blue-700">${budget.user_budget?.toLocaleString()}</span>
                </div>
              )}

              {budget.calculation_details && (
                <div className="p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
                  <div className="font-semibold text-gray-700">Budget Calculation:</div>
                  <div className="text-gray-600">{budget.calculation_details.base_costs}</div>
                  <div className="text-gray-600">
                    Multipliers: Location ({budget.calculation_details.location_multiplier}x), 
                    Event Type ({budget.calculation_details.event_type_multiplier}x), 
                    Quality ({budget.calculation_details.tone_multiplier}x)
                  </div>
                  <div className="text-gray-700 font-medium">{budget.calculation_details.applied_formula}</div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Venue Estimate</span>
                  <span className="font-semibold">${budget.venue?.toLocaleString()}</span>
                </div>
                
                {budget.vendor_breakdown && Object.keys(budget.vendor_breakdown).length > 0 ? (
                  <div className="pl-4 space-y-2 border-l-2 border-gray-200">
                     {Object.entries(budget.vendor_breakdown).map(([category, details]: [string, any]) => (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 font-medium">{details.vendor || category}</span>
                          <span className="font-semibold">${details.cost?.toLocaleString()}</span>
                        </div>
                        {details.reasoning && (
                          <div className="text-xs text-gray-500 italic">{details.reasoning}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : budget.vendors && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Vendor Estimates</span>
                    <span className="font-semibold">${budget.vendors?.toLocaleString()}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-semibold text-lg">Total Estimate</span>
                <span className="font-bold text-2xl text-gray-900">${budget.total?.toLocaleString()}</span>
              </div>
              
              {budget.user_budget && (
                <div className="text-center pt-2">
                  {budget.over_budget ? (
                    <Badge className="bg-red-50 text-red-700 border-red-200">
                      <WarningCircle className="w-3 h-3 mr-1" />
                      Over budget by ${(budget.total - budget.user_budget)?.toLocaleString()}
                    </Badge>
                  ) : budget.remaining > 0 ? (
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Under budget by ${budget.remaining?.toLocaleString()}
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Right on budget!
                    </Badge>
                  )}
                </div>
              )}

              {budget.cost_optimization && (
                <div className="space-y-3 pt-3 border-t">
                  {budget.cost_optimization.save_money_by?.length > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                        <TrendDown className="w-4 h-4" />
                        Save Money:
                      </div>
                      <ul className="space-y-1 text-sm text-green-700">
                        {budget.cost_optimization.save_money_by.map((option, idx) => (
                          <li key={idx}>• {option}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {budget.cost_optimization.upgrade_options?.length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <TrendUp className="w-4 h-4" />
                        Upgrade Options:
                      </div>
                      <ul className="space-y-1 text-sm text-blue-700">
                        {budget.cost_optimization.upgrade_options.map((option, idx) => (
                          <li key={idx}>• {option}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Venue Shortlist - Hidden if empty array (vendor-only mode) */}
      {venues && venues.length > 0 && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
              Recommended Venues ({venues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {venues.map((venue, index) => (
                <VenueCard
                  key={index}
                  venue={venue}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vendor Bundle */}
      {vendors.length > 0 && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-green-600" />
              Curated Vendor Bundle ({vendors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {vendors.map((vendor, index) => (
                <VendorCard
                  key={index}
                  vendor={vendor}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggested Categories - New card */}
      {plan.suggested_categories && plan.suggested_categories.length > 0 && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkle className="w-5 h-5 text-yellow-500" />
              You Might Also Need
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {plan.suggested_categories.map((cat, i) => (
                <Badge key={i} variant="secondary" className="px-3 py-1">
                  {cat}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              These additional services are commonly needed for {plan.event_type || 'this type of'} events
            </p>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {plan.timeline && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-orange-600" />
              Suggested Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {plan.timeline.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2" />
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}