"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, refreshProfile } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login?redirect=/profile");
      return;
    }
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user, token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !phone.trim()) {
      toast.warning("Name, email, and phone number are required.");
      setError("Name, email, and phone number are required.");
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        toast.warning("New password must be at least 6 characters long.");
        setError("New password must be at least 6 characters long.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.warning("New password and confirm password do not match.");
        setError("New password and confirm password do not match.");
        return;
      }
      if (!currentPassword) {
        toast.warning("Please enter your current password to set a new password.");
        setError("Please enter your current password to set a new password.");
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload: {
        username: string;
        email: string;
        phone: string;
        currentPassword?: string;
        newPassword?: string;
      } = {
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      await api.updateProfile(payload);
      await refreshProfile();

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Profile updated successfully.");
      setSuccess("Your profile has been updated successfully.");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to update profile.");
      setError(error.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#081F4D] via-[#0A2660] to-[#071838] px-4 pt-32 pb-24 text-white sm:px-6 sm:pt-40 md:pt-48">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-300 border border-white/20 mb-2">
              Account Management
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Profile Settings
            </h1>
            <p className="mt-1 text-sm text-blue-100/75">
              Manage your personal information and account security.
            </p>
          </div>

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition backdrop-blur shadow"
            >
              Admin Dashboard →
            </Link>
          )}
        </div>

        <div className="mt-8 rounded-3xl border border-blue-100 bg-white p-6 sm:p-10 shadow-[0_20px_50px_rgba(8,31,77,0.25)] text-slate-900">
          {success && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm font-semibold text-emerald-700">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          {/* Account Role Badge */}
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#081F4D] text-lg font-bold text-white shadow-md">
                {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <div className="font-bold text-base text-[#081F4D]">{user?.username}</div>
                <div className="text-xs text-slate-500">{user?.email}</div>
              </div>
            </div>

            <span className="rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#081F4D]">
              {user?.role}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Full Name / Business Name
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#081F4D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#081F4D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#081F4D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold text-[#081F4D]">
                Change Password (optional)
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Leave blank if you do not want to change your password.
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    Current Password
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-4 pr-11 text-sm text-slate-900 placeholder-slate-400 focus:border-[#081F4D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 transition hover:text-[#081F4D]"
                      aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                    >
                      {showCurrentPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                    >
                      New Password
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Minimum 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-4 pr-11 text-sm text-slate-900 placeholder-slate-400 focus:border-[#081F4D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 transition hover:text-[#081F4D]"
                        aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                      >
                        {showNewPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repeat new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-4 pr-11 text-sm text-slate-900 placeholder-slate-400 focus:border-[#081F4D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 transition hover:text-[#081F4D]"
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-[#081F4D] py-3.5 text-center text-sm font-bold text-white transition hover:bg-[#0A2660] disabled:opacity-50 shadow-lg"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}

