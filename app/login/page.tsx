"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "login") {
      try {
        const res = await fetch("http://localhost:8000/login/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ username, password }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("token", data.token);
          router.push("/");
        } else {
          setError(data.message || "Invalid credentials");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred during login.");
      }
    } else {
      try {
        const res = await fetch("http://localhost:8000/register/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ username, password, email }),
        });
        const data = await res.json();
        if (data.success) {
          const loginRes = await fetch("http://localhost:8000/login/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ username, password }),
          });
          const loginData = await loginRes.json();
          if (loginData.success) {
            localStorage.setItem("token", loginData.token);
            router.push("/");
          } else {
            setError("Registration succeeded but login failed.");
          }
        } else {
          setError(data.message || "Registration failed");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred during registration.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded bg-white p-8 shadow-md">
        <h2 className="mb-4 text-2xl font-bold">
          {mode === "login" ? "Login" : "Register"}
        </h2>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border p-2"
              required
            />
          </div>
          {mode === "register" && (
            <div className="mb-4">
              <label className="mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border p-2"
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label className="mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border p-2"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
          >
            {mode === "login" ? "Login" : "Register"}
          </button>
        </form>
        <p className="mt-4 text-center">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                className="text-blue-500 hover:underline"
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="text-blue-500 hover:underline"
                onClick={() => setMode("login")}
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
