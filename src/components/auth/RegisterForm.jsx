"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProfileImageUpload from "./ProfileImageUpload";

const ROLE_OPTIONS = [
  { id: "student", label: "Student", desc: "Enroll in courses, submit assignments & earn certificates" },
  { id: "instructor", label: "Instructor", desc: "Create courses, upload lessons & manage students" },
  { id: "content-manager", label: "Content Manager", desc: "Manage blog posts, curriculum & learning resources" },
  { id: "admin-pannel", label: "Admin Panel", desc: "Full administrative access across all LMS features" },
];

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: null,
    role: "student", // Primary selected role
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required.";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.role) {
      newErrors.role = "Please select a role.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    if (serverError) {
      setServerError("");
    }
  };

  const handleRoleSelect = (roleId) => {
    setFormData((prev) => ({
      ...prev,
      role: roleId,
    }));

    if (errors.role) {
      setErrors((prev) => ({
        ...prev,
        role: undefined,
      }));
    }
  };

  const handleProfileImageChange = (imageData) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: imageData?.url ? imageData : null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
        profileImage: formData.profileImage,
      });

      // Redirect to homepage upon successful registration
      router.push("/");
    } catch (err) {
      console.error("Registration error:", err);
      setServerError(
        err.message || "Registration failed. Please check your inputs."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="text-center space-y-3 pb-2">
        <Link
          href="/"
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-105"
        >
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Create your LearnHub account
        </h1>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
          <svg
            className="h-4 w-4 flex-shrink-0 text-rose-400 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="leading-relaxed">{serverError}</span>
        </div>
      )}

      {/* Main GitHub-Style Card */}
      <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6 shadow-xl space-y-4">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="block text-xs font-semibold text-[#e6edf3]"
            >
              Username <span className="text-rose-400">*</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="e.g. johndoe"
              className={`w-full rounded-lg border bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] placeholder:text-[#7d8590] transition focus:outline-none focus:ring-2 ${
                errors.username
                  ? "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-[#30363d] focus:border-indigo-500 focus:ring-indigo-500/20"
              }`}
            />
            {errors.username && (
              <p className="text-xs text-rose-400 font-medium">{errors.username}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-[#e6edf3]"
            >
              Email address <span className="text-rose-400">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="name@example.com"
              className={`w-full rounded-lg border bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] placeholder:text-[#7d8590] transition focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-[#30363d] focus:border-indigo-500 focus:ring-indigo-500/20"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-rose-400 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#e6edf3]"
              >
                Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Min. 6 characters"
                  className={`w-full rounded-lg border bg-[#0d1117] px-3 py-2 pr-8 text-sm text-[#e6edf3] placeholder:text-[#7d8590] transition focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20"
                      : "border-[#30363d] focus:border-indigo-500 focus:ring-indigo-500/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-2 text-[#7d8590] hover:text-[#e6edf3]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-400 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-[#e6edf3]"
              >
                Confirm password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-type password"
                  className={`w-full rounded-lg border bg-[#0d1117] px-3 py-2 pr-8 text-sm text-[#e6edf3] placeholder:text-[#7d8590] transition focus:outline-none focus:ring-2 ${
                    errors.confirmPassword
                      ? "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20"
                      : "border-[#30363d] focus:border-indigo-500 focus:ring-indigo-500/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-2 text-[#7d8590] hover:text-[#e6edf3]"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-rose-400 font-medium">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Cloudinary Profile Image Upload */}
          <ProfileImageUpload
            value={formData.profileImage}
            onChange={handleProfileImageChange}
          />

          {/* Roles Selection */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#e6edf3]">
                Select Application Role <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-[#7d8590]">LMS User Permissions</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ROLE_OPTIONS.map((roleOption) => {
                const isSelected = formData.role === roleOption.id;
                return (
                  <div
                    key={roleOption.id}
                    onClick={() => handleRoleSelect(roleOption.id)}
                    className={`relative flex items-start gap-2.5 rounded-xl border p-3 cursor-pointer transition ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500/50"
                        : "border-[#30363d] bg-[#0d1117] hover:border-[#8b949e] hover:bg-[#161b22]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role_selection"
                      checked={isSelected}
                      onChange={() => handleRoleSelect(roleOption.id)}
                      className="mt-0.5 h-3.5 w-3.5 text-indigo-500 border-[#30363d] bg-[#0d1117] accent-indigo-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-[#e6edf3] block">
                        {roleOption.label}
                      </span>
                      <span className="text-[#7d8590] text-[11px] leading-tight block mt-0.5">
                        {roleOption.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.role && (
              <p className="text-xs text-rose-400 font-medium">{errors.role}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center rounded-lg bg-[#238636] hover:bg-[#2ea043] border border-[rgba(240,246,252,0.1)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating account...
              </span>
            ) : (
              "Create account"
            )}
          </button>
        </form>
      </div>

      {/* GitHub-style Bottom Redirect Card */}
      <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-4 text-center text-xs text-[#7d8590]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
        >
          Sign in →
        </Link>
      </div>
    </div>
  );
}
