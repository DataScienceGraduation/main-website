// This is a Next.js page component for a login and registration form.
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
            password 
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
      
      const res = await fetch(`http://localhost:8000${apiUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: getRequestBody(),
      });
      const data = await res.json();
      
      if (!res.ok) {
        console.error('Server response:', data);
        throw new Error(data.message || data.detail || 'Server error: ' + res.status);
      }
      
      if (!data.success) {
        console.error('API error:', data);
        throw new Error(data.message || "Authentication failed");
      }

      if (mode === "register") {
        const loginRes = await fetch("http://localhost:8000/login/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ 
            username,
            password 
          }),
        });
        const loginData = await loginRes.json();
        if (!loginData.success) throw new Error("Auto-login failed after registration");
        localStorage.setItem("token", loginData.token);
      } else {
        localStorage.setItem("token", data.token);
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Section */}
      <div className="md:w-1/2 flex flex-col justify-center p-12 text-white relative min-h-screen"
        style={{
          backgroundImage: 'url(/login.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/55 to-indigo-900/5"></div>
        <div className="relative z-10 mb-8">
          <h1 className="text-4xl font-bold mb-4">Simplifying AI, Amplifying Impact!</h1>
          <p className="text-lg opacity-90">
            Welcome to our AutoML Platform, where<br />
            AI-powered automation makes machine learning effortless.
          </p>
        </div>
        <p className="text-xl font-medium relative z-10">
          Build, train and deploy models with ease—no coding required!
        </p>
      </div>

      {/* Right Section */}
      <div className="md:w-1/2 flex flex-col justify-center items-center p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
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
                    <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                      <HiOutlineUser className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      className="w-full p-3 border-b-2 border-gray-300 focus:outline-none focus:border-blue-600 pl-10"
                      required
                    />
                  </div>
                  <div className="relative flex-1">
                    <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                      <HiOutlineUser className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      className="w-full p-3 border-b-2 border-gray-300 focus:outline-none focus:border-blue-600 pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                    <HiOutlineUser className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full p-3 border-b-2 border-gray-300 focus:outline-none focus:border-blue-600 pl-10"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                    <HiOutlineMail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-3 border-b-2 border-gray-300 focus:outline-none focus:border-blue-600 pl-10"
                    required
                  />
                </div>
              </>
            )}

            {mode === "login" && (
              <div className="relative">
                <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                  <HiOutlineUser className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full p-3 border-b-2 border-gray-300 focus:outline-none focus:border-blue-600 pl-10"
                  required
                />
              </div>
            )}

            <div className="relative">
              <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                <HiOutlineLockClosed className="h-5 w-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-3 border-b-2 border-gray-300 focus:outline-none focus:border-blue-600 pl-10"
                required
              />
            </div>

            {mode === "register" && (
              <div className="relative">
                <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                  <HiOutlineLockClosed className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full p-3 border-b-2 border-gray-300 focus:outline-none focus:border-blue-600 pl-10"
                  required
                />
              </div>
            )}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Processing..." : mode === "login" ? "Login" : "Register"}
            </button>

            <div className="text-center mt-4">
              <span className="text-gray-600">
                {mode === "login" ? "Not registered? " : "Already have an account? "}
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