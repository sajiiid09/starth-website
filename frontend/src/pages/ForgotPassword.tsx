import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpinnerGap, ArrowRight, Eye, EyeSlash, EnvelopeSimple, ArrowLeft } from "@phosphor-icons/react";
import { forgotPassword, resetPassword } from "@/api/functions";
import { toast } from "sonner";

type ForgotPasswordStep = "email" | "reset";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      toast.success("If that email exists, a reset code has been sent.");
      setStep("reset");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const { data } = await resetPassword({
        email,
        otp_code: otpCode,
        new_password: newPassword,
      });
      if (data.success) {
        toast.success("Password reset successfully!");
        navigate("/appentry");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Password reset failed. Please check your code and try again."
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] space-y-6">
        {/* Back link */}
        <button
          type="button"
          className="group flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-dark/40 hover:text-brand-teal transition-colors"
          onClick={() => {
            if (step === "reset") {
              setStep("email");
            } else {
              navigate("/appentry");
            }
          }}
        >
          <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
          {step === "reset" ? "Back" : "Back to login"}
        </button>

        <div className="rounded-3xl border border-white/60 bg-white/80 p-1 shadow-2xl shadow-brand-dark/5 backdrop-blur-xl">
          <div className="rounded-[20px] border border-brand-dark/5 bg-white/50 p-6 sm:p-8">
            {step === "email" && (
              <form onSubmit={handleSendCode} className="space-y-6">
                <div className="space-y-2 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-teal/10">
                    <EnvelopeSimple className="h-7 w-7 text-brand-teal" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-brand-dark">
                    Forgot your password?
                  </h2>
                  <p className="text-sm text-brand-dark/60">
                    Enter your email and we'll send you a 6-digit code to reset your password.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="forgotEmail"
                    className="text-xs font-semibold uppercase tracking-wider text-brand-dark/60"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="forgotEmail"
                    type="email"
                    placeholder="name@company.com"
                    required
                    className="h-12 border-brand-dark/10 bg-white/60 text-base focus:border-brand-teal focus:ring-brand-teal/20"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="group w-full rounded-full bg-brand-teal py-6 text-base font-semibold text-white shadow-lg transition-all hover:bg-brand-dark hover:shadow-xl hover:translate-y-[-1px]"
                  disabled={loading}
                >
                  {loading ? (
                    <SpinnerGap className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Send Reset Code
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </Button>
              </form>
            )}

            {step === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-semibold tracking-tight text-brand-dark">
                    Reset your password
                  </h2>
                  <p className="text-sm text-brand-dark/60">
                    Enter the 6-digit code sent to{" "}
                    <span className="font-semibold text-brand-teal">{email}</span>{" "}
                    and your new password.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="otpCode"
                    className="text-xs font-semibold uppercase tracking-wider text-brand-dark/60"
                  >
                    Verification Code
                  </Label>
                  <Input
                    id="otpCode"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    required
                    minLength={6}
                    maxLength={6}
                    className="h-12 border-brand-dark/10 bg-white/60 text-center text-xl font-semibold tracking-[0.3em] focus:border-brand-teal focus:ring-brand-teal/20"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="newPassword"
                    className="text-xs font-semibold uppercase tracking-wider text-brand-dark/60"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      className="h-12 border-brand-dark/10 bg-white/60 text-base focus:border-brand-teal focus:ring-brand-teal/20 pr-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-dark/40 hover:text-brand-dark transition-colors"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeSlash className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-xs font-semibold uppercase tracking-wider text-brand-dark/60"
                  >
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    className="h-12 border-brand-dark/10 bg-white/60 text-base focus:border-brand-teal focus:ring-brand-teal/20"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="group w-full rounded-full bg-brand-teal py-6 text-base font-semibold text-white shadow-lg transition-all hover:bg-brand-dark hover:shadow-xl hover:translate-y-[-1px]"
                  disabled={loading}
                >
                  {loading ? (
                    <SpinnerGap className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Reset Password
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-xs font-medium text-brand-teal hover:text-brand-dark transition-colors"
                    onClick={() => {
                      setLoading(true);
                      forgotPassword({ email })
                        .then(() => toast.success("New code sent!"))
                        .catch(() => toast.error("Failed to resend code."))
                        .finally(() => setLoading(false));
                    }}
                  >
                    Didn't receive a code? Resend
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
