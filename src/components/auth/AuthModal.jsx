import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "@/api/entities";

export default function AuthModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await User.login();
    } catch (error) {
      console.error("Sign-in error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to Strathwell
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          <Button onClick={handleGoogleSignIn} disabled={loading} className="w-full">
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}