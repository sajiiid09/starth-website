import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { resetPassword } from "@/api/functions";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [status, setStatus] = useState('form'); // 'form', 'success', 'error'
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const resetToken = searchParams.get('token');

    if (!resetToken) {
      setStatus('error');
      return;
    }

    setToken(resetToken);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const { data } = await resetPassword({ token, new_password: password });
      if (data.success) {
        setStatus('success');
        toast.success("Password reset successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Password reset failed');
      setStatus('error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Reset Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Enter your new password below
              </p>

              <div>
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                Reset Password
              </Button>
            </form>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
              <p className="text-lg font-semibold text-gray-900">Password Reset Successfully!</p>
              <p className="text-gray-600">You can now sign in with your new password</p>
              <Link to={createPageUrl("Home")}>
                <Button className="w-full">
                  Go to Sign In
                </Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <XCircle className="w-16 h-16 text-red-600 mx-auto" />
              <p className="text-lg font-semibold text-gray-900">Invalid or Expired Link</p>
              <p className="text-gray-600">This password reset link is no longer valid</p>
              <Link to={createPageUrl("Home")}>
                <Button variant="outline" className="w-full">
                  Return to Home
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}