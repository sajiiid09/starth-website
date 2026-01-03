import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { DemoRequest } from "@/api/entities";
import { authRegister } from "@/api/functions";
import { SendEmail } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";



const SignUpForm = ({ onSignUpSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'organizer'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await authRegister({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        phone: formData.phone,
        role: formData.role
      });

      if (data.success) {
        toast.success("Account created! Please check your email to verify your account.", { duration: 5000 });
        onSignUpSuccess();
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error(error.response?.data?.error || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" placeholder="John Doe" required value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} />
      </div>
      <div>
        <Label htmlFor="signupEmail">Email</Label>
        <Input id="signupEmail" type="email" placeholder="name@company.com" required value={formData.email} onChange={e => handleInputChange('email', e.target.value)} />
      </div>
      <div>
        <Label htmlFor="signupPassword">Password</Label>
        <Input id="signupPassword" type="password" placeholder="At least 8 characters" required value={formData.password} onChange={e => handleInputChange('password', e.target.value)} />
      </div>
      <div>
        <Label htmlFor="phone">Phone (Optional)</Label>
        <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} />
      </div>
      <div>
        <Label htmlFor="role">I am a...</Label>
        <Select value={formData.role} onValueChange={value => handleInputChange('role', value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="organizer">Event Organizer</SelectItem>
            <SelectItem value="venue_owner">Venue Owner</SelectItem>
            <SelectItem value="service_provider">Service Provider</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
      </Button>
    </form>
  );
};

const DemoRequestForm = ({ onDemoRequestSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', company: '', role: 'event_organizer' });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await DemoRequest.create({
        full_name: formData.fullName,
        email: formData.email,
        company: formData.company,
        role: formData.role,
      });

      // Send notification to Strathwell admin
      await SendEmail({
        to: "info@renzairegroup.com",
        subject: "New Demo Request - Strathwell",
        body: `
          <h2>New Demo Request Received</h2>
          <p><strong>Name:</strong> ${formData.fullName}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Company:</strong> ${formData.company || 'N/A'}</p>
          <p><strong>Role:</strong> ${formData.role}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        `
      });

      toast.success("Thank you! Our team will be in touch shortly to schedule your demo.", { duration: 5000 });
      onDemoRequestSuccess();

    } catch (error) {
      console.error('Demo Request Error:', error);
      toast.error(error.message || "An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-center text-gray-600">
        Book a demo with our team to see how Strathwell can help you.
      </p>
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" placeholder="John Doe" required value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} />
      </div>
      <div>
        <Label htmlFor="reqEmail">Work Email</Label>
        <Input id="reqEmail" type="email" placeholder="name@company.com" required value={formData.email} onChange={e => handleInputChange('email', e.target.value)} />
      </div>
       <div>
        <Label htmlFor="company">Company</Label>
        <Input id="company" placeholder="Your Company Name" value={formData.company} onChange={e => handleInputChange('company', e.target.value)} />
      </div>
      <div>
        <Label htmlFor="role">I am a...</Label>
        <Select value={formData.role} onValueChange={value => handleInputChange('role', value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="event_organizer">Event Organizer</SelectItem>
            <SelectItem value="venue_owner">Venue Owner</SelectItem>
            <SelectItem value="service_provider">Service Provider</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request a Demo"}
      </Button>
    </form>
  );
};

export default function AppEntryPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("demo");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          sessionStorage.setItem('currentUser', JSON.stringify(user));
          const userRoles = user.roles || ['organizer'];
          let activeRole = localStorage.getItem('activeRole') || userRoles[0];
          localStorage.setItem('activeRole', activeRole);

          const destinationMap = {
            'venue_owner': 'VenuePortal',
            'service_provider': 'ProviderPortal'
          };
          window.location.href = createPageUrl(destinationMap[activeRole] || 'Dashboard');
          return;
        }
      } catch (e) {
        // Not logged in, show login screen
      }
      setLoading(false);
    };
    checkSession();
  }, []);



  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-12 text-white">
        <Link to={createPageUrl("Home")} className="mb-8">
           <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/a98933634_Elegant_Simple_Aesthetic_Real_Estate_Logo-removebg-preview.png" 
              alt="Strathwell" 
              className="h-48 w-auto"
            />
        </Link>
        <h1 className="text-4xl font-bold mb-4 text-center">Event Orchestration, Reimagined.</h1>
        <p className="text-lg text-gray-300 max-w-md text-center">
          AI-powered planning, a curated marketplace, and seamless execution tools all in one platform.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 text-center">
                <Link to={createPageUrl("Home")}>
                    <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/ddf404508_Elegant_Simple_Aesthetic_Real_Estate_Logo__1_-removebg-preview.png" 
                    alt="Strathwell" 
                    className="h-24 w-auto mx-auto"
                    />
                </Link>
            </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="demo">Request Demo</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="demo" className="pt-6">
              <DemoRequestForm onDemoRequestSuccess={() => toast.success("Demo request submitted!")} />
            </TabsContent>
            <TabsContent value="signup" className="pt-6">
              <SignUpForm onSignUpSuccess={() => toast.success("Account created! Check your email to verify.")} />
            </TabsContent>
          </Tabs>
           <p className="px-8 text-center text-sm text-gray-500 mt-6">
                By continuing, you agree to our{' '}
                <Link to={createPageUrl("Terms")} className="underline hover:text-gray-700">Terms of Service</Link> and{' '}
                <Link to={createPageUrl("Privacy")} className="underline hover:text-gray-700">Privacy Policy</Link>.
            </p>
        </div>
      </div>
    </div>
  );
}