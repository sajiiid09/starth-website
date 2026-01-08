import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { verifyEmail } from "@/api/functions";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error', 'already_verified'
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    handleVerification(token);
  }, []);

  const handleVerification = async (token) => {
    try {
      const { data } = await verifyEmail({ token });

      if (data.success) {
        setStatus(data.already_verified ? 'already_verified' : 'success');
        setMessage(data.message);
        setEmail(data.email);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage(error.response?.data?.error || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
            {status === 'loading' && (
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            )}
            {(status === 'success' || status === 'already_verified') && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Verifying Your Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'already_verified' && 'Already Verified'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {message}
          </p>

          {(status === 'success' || status === 'already_verified') && (
            <>
              {email && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Mail className="w-4 h-4" />
                  <span>{email}</span>
                </div>
              )}
              <Link to={createPageUrl("Home")}>
                <Button className="w-full bg-black hover:bg-gray-800">
                  Continue to Sign In
                </Button>
              </Link>
            </>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                The verification link may have expired or is invalid.
              </p>
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