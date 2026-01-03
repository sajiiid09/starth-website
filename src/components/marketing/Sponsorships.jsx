
import React, { useState } from "react";
import { Sponsor } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  ArrowLeft, 
  DollarSign, 
  MoreVertical, 
  Edit, 
  Trash2 
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const SponsorForm = ({ eventId, sponsor, onSave, onCancel }) => {
  const [formData, setFormData] = useState(
    sponsor || {
      name: "",
      tier: "",
      price: "",
      status: "outreach",
    }
  );

  const handleSubmit = () => {
    onSave({ ...formData, price: parseFloat(formData.price) || 0 });
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onCancel} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to list
      </Button>
      <h2 className="text-lg font-semibold">{sponsor ? "Edit Sponsor" : "Add New Sponsor"}</h2>
      <div>
        <label className="text-sm font-medium">Sponsor Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Acme Corporation"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Sponsorship Tier</label>
        <Input
          value={formData.tier}
          onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
          placeholder="e.g., Gold, Presenting"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Amount</label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="2500"
            className="pl-10"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Status</label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="outreach">Outreach</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end pt-4">
        <Button onClick={handleSubmit}>Save Sponsor</Button>
      </div>
    </div>
  );
};

export default function Sponsorships({ eventId, sponsors, onUpdate }) {
  const [view, setView] = useState("list");
  const [editingSponsor, setEditingSponsor] = useState(null);

  const getStatusColor = (status) => {
    const colors = {
      outreach: "bg-blue-100 text-blue-800",
      confirmed: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleAddNew = () => {
    setEditingSponsor(null);
    setView("form");
  };

  const handleEdit = (sponsor) => {
    setEditingSponsor(sponsor);
    setView("form");
  };

  const handleDelete = async (sponsorId) => {
    if (window.confirm("Are you sure you want to delete this sponsor?")) {
      await Sponsor.delete(sponsorId);
      onUpdate();
    }
  };

  const handleSave = async (data) => {
    if (editingSponsor) {
      await Sponsor.update(editingSponsor.id, data);
    } else {
      await Sponsor.create({ ...data, event_id: eventId });
    }
    onUpdate();
    setView("list");
    setEditingSponsor(null);
  };
  
  const totalRaised = sponsors
    .filter(s => s.status === 'paid')
    .reduce((acc, s) => acc + (s.price || 0), 0);

  const renderList = () => (
    <>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-600">Total Raised</p>
          <p className="text-2xl font-bold">
            ${totalRaised.toLocaleString()}
          </p>
        </div>
      </div>
      {sponsors.length > 0 ? (
        <ul className="space-y-3">
          {sponsors.map(sponsor => {
            const sponsorStatus = sponsor.status || "outreach"; // Default to 'outreach' if undefined
            return (
              <li key={sponsor.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                <div>
                  <p className="font-semibold">{sponsor.name}</p>
                  <p className="text-sm text-gray-500">{sponsor.tier} - ${sponsor.price?.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(sponsorStatus)}>
                    {sponsorStatus.charAt(0).toUpperCase() + sponsorStatus.slice(1)}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEdit(sponsor)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-500"
                        onClick={() => handleDelete(sponsor.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-center text-gray-500 py-4">No sponsors added yet.</p>
      )}
    </>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sponsorships</CardTitle>
          <CardDescription>Track sponsors and contributions.</CardDescription>
        </div>
        {view === 'list' && (
          <Button variant="outline" onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" /> New Sponsor
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {view === "list" ? renderList() : (
          <SponsorForm 
            eventId={eventId}
            sponsor={editingSponsor}
            onSave={handleSave}
            onCancel={() => setView("list")}
          />
        )}
      </CardContent>
    </Card>
  );
}
