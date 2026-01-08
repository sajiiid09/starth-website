import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  CheckCircle,
  Apple,
  Smartphone,
  Building,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function PaymentMethodsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Mock payment methods - in real implementation, fetch from payment processor
      const mockMethods = [
        {
          id: 1,
          type: 'apple_pay',
          name: 'Apple Pay',
          lastFour: null,
          isDefault: true,
          status: 'active',
          icon: Apple
        },
        {
          id: 2,
          type: 'klarna',
          name: 'Klarna',
          lastFour: null,
          isDefault: false,
          status: 'setup_required',
          icon: Smartphone
        }
      ];

      if (currentUser.payment_methods) {
        // Add saved cards from user profile
        const savedCards = currentUser.payment_methods.map(method => ({
          ...method,
          icon: CreditCard
        }));
        setPaymentMethods([...mockMethods, ...savedCards]);
      } else {
        setPaymentMethods(mockMethods);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
    setLoading(false);
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    try {
      // Mock implementation - in real app, integrate with Stripe/payment processor
      const newMethod = {
        id: Date.now(),
        type: 'card',
        name: `****${newCard.cardNumber.slice(-4)}`,
        lastFour: newCard.cardNumber.slice(-4),
        isDefault: paymentMethods.filter(m => m.type === 'card').length === 0,
        status: 'active',
        icon: CreditCard,
        holderName: newCard.holderName
      };

      // Update user profile with new payment method
      const updatedMethods = [...(user.payment_methods || []), {
        type: 'card',
        lastFour: newCard.cardNumber.slice(-4),
        holderName: newCard.holderName,
        isDefault: newMethod.isDefault
      }];

      await User.updateMyUserData({ payment_methods: updatedMethods });
      
      setPaymentMethods(prev => [...prev, newMethod]);
      setNewCard({ cardNumber: '', expiryDate: '', cvv: '', holderName: '' });
      setShowAddCard(false);
      toast.success("Payment method added successfully!");
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast.error("Failed to add payment method");
    }
  };

  const handleSetupKlarna = () => {
    // Mock Klarna setup
    setPaymentMethods(prev =>
      prev.map(method =>
        method.type === 'klarna'
          ? { ...method, status: 'active' }
          : method
      )
    );
    toast.success("Klarna setup completed!");
  };

  const handleRemoveMethod = async (methodId) => {
    try {
      setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
      toast.success("Payment method removed");
    } catch (error) {
      console.error("Error removing payment method:", error);
      toast.error("Failed to remove payment method");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Methods</h1>
          <p className="text-gray-600">Manage your payment options for booking venues and services</p>
        </div>

        <div className="space-y-6">
          {/* Active Payment Methods */}
          <Card className="border-none shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Payment Methods</CardTitle>
              <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Card
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Credit/Debit Card</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddCard} className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        value={newCard.cardNumber}
                        onChange={(e) => setNewCard(prev => ({ ...prev, cardNumber: e.target.value }))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          value={newCard.expiryDate}
                          onChange={(e) => setNewCard(prev => ({ ...prev, expiryDate: e.target.value }))}
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          value={newCard.cvv}
                          onChange={(e) => setNewCard(prev => ({ ...prev, cvv: e.target.value }))}
                          placeholder="123"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="holderName">Cardholder Name</Label>
                      <Input
                        id="holderName"
                        value={newCard.holderName}
                        onChange={(e) => setNewCard(prev => ({ ...prev, holderName: e.target.value }))}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowAddCard(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                        Add Card
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-gray-700" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {method.name}
                            {method.holderName && (
                              <span className="text-gray-500 ml-2">• {method.holderName}</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {method.type === 'apple_pay' && "Touch ID & Face ID"}
                            {method.type === 'klarna' && "Buy now, pay later"}
                            {method.type === 'card' && "Credit/Debit Card"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {method.isDefault && (
                          <Badge className="bg-green-100 text-green-800">Default</Badge>
                        )}
                        {method.status === 'active' ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={method.type === 'klarna' ? handleSetupKlarna : undefined}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Setup
                          </Button>
                        )}
                        {method.type === 'card' && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoveMethod(method.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Security & Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900">Secure Payments</div>
                    <div className="text-sm text-blue-700">All payments are processed securely with industry-standard encryption.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-900">PCI DSS Compliant</div>
                    <div className="text-sm text-green-700">Your card information is handled according to the highest security standards.</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}