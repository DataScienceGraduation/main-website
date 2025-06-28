// This is a Next.js page component for a login and registration form.
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getAbsoluteUrl } from "../utils/url";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
} from "react-icons/hi";

const LoginPage = () => {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (!firstName || !lastName || !username) {
        setError("Please fill in all required fields");
        return;
      }
    }

    setLoading(true);

    try {
      const apiUrl = mode === "login" ? "/login/" : "/register/";
      const getRequestBody = () => {
        if (mode === "login") {
          return new URLSearchParams({
            username,
            password,
          });
        }
        return new URLSearchParams({
          username,
          first_name: firstName,
          last_name: lastName,
          email,
          password,
        });
      };

      const res = await fetch(getAbsoluteUrl(apiUrl), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: getRequestBody(),
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Server response:", data);
        throw new Error(
          data.message || data.detail || "Server error: " + res.status,
        );
      }

      if (!data.success) {
        console.error("API error:", data);
        throw new Error(data.message || "Authentication failed");
      }

      if (mode === "register") {
        const loginRes = await fetch(getAbsoluteUrl("/login/"), {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            username,
            password,
          }),
        });
        const loginData = await loginRes.json();
        if (!loginData.success)
          throw new Error("Auto-login failed after registration");
        localStorage.setItem("token", loginData.token);
      } else {
        localStorage.setItem("token", data.token);
      }

      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left Section */}
      <div
        className="relative flex min-h-screen flex-col justify-center p-12 text-white md:w-1/2"
        style={{
          backgroundImage: "url(/login.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/55 to-indigo-900/5"></div>
        <div className="relative z-10 mb-8">
          <h1 className="mb-4 text-4xl font-bold">
            Simplifying AI, Amplifying Impact!
          </h1>
          <p className="text-lg opacity-90">
            Welcome to our AutoML Platform, where
            <br />
            AI-powered automation makes machine learning effortless.
          </p>
        </div>
        <p className="relative z-10 text-xl font-medium">
          Build, train and deploy models with ease—no coding required!
        </p>
      </div>

      {/* Right Section */}
      <div className="flex flex-col items-center justify-center bg-white p-12 md:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-12 text-center">
            <div className="mb-4 flex justify-center">
              <Image
                src="/logo.svg"
                alt="AutoML Logo"
                width={300}
                height={75}
                className="h-auto"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "register" && (
              <>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <HiOutlineUser className="size-5" />
                    </div>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      className="w-full border-b-2 border-gray-300 p-3 pl-10 focus:border-blue-600 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <HiOutlineUser className="size-5" />
                    </div>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      className="w-full border-b-2 border-gray-300 p-3 pl-10 focus:border-blue-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <HiOutlineUser className="size-5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full border-b-2 border-gray-300 p-3 pl-10 focus:border-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <HiOutlineMail className="size-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full border-b-2 border-gray-300 p-3 pl-10 focus:border-blue-600 focus:outline-none"
                    required
                  />
                </div>
              </>
            )}

            {mode === "login" && (
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <HiOutlineUser className="size-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full border-b-2 border-gray-300 p-3 pl-10 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>
            )}

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <HiOutlineLockClosed className="size-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full border-b-2 border-gray-300 p-3 pl-10 focus:border-blue-600 focus:outline-none"
                required
              />
            </div>

            {mode === "register" && (
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <HiOutlineLockClosed className="size-5" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full border-b-2 border-gray-300 p-3 pl-10 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>
            )}
            {error && (
              <p className="text-center text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : mode === "login"
                  ? "Login"
                  : "Register"}
            </button>

            <div className="mt-4 text-center">
              <span className="text-gray-600">
                {mode === "login"
                  ? "Not registered? "
                  : "Already have an account? "}
              </span>
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "Create account" : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
