"use client";
export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/app/lib/apiClient";

function SignInInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const router = useRouter();

  //  Handle login via NextAuth credentials provider
  const handleRegularLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/vms");
    }
  };

  // 🔹 Handle password reset
  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await apiClient.post("/request-password-reset", {
        email: resetEmail,
      });
      if (res.data.message === "Check your email for reset link") {
        router.push("/signin");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "User not found");
    }
  };

  return (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #f7f9fc 0%, #e3ebf6 100%)",
      fontFamily: "Inter, sans-serif",
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: "40px 50px",
        borderRadius: "12px",
        boxShadow: "0 4px 25px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "400px",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: "20px", fontWeight: 600, color: "#1a1a1a" }}>
        Sign in to your account
      </h2>

      {/* Regular login */}
      <form onSubmit={handleRegularLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
            width: "100%",
          }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
            width: "100%",
          }}
          required
        />
        <button
          type="submit"
          style={{
            backgroundColor: "#1a73e8",
            color: "white",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 500,
            transition: "background 0.3s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1557b0")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1a73e8")}
        >
          Sign In
        </button>
        {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}
      </form>

      <hr style={{ margin: "25px 0", border: "none", borderTop: "1px solid #e5e5e5" }} />

      {/* Password reset */}
      <form onSubmit={handlePasswordResetRequest} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="email"
          placeholder="Enter your email for reset"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
            width: "100%",
          }}
          required
        />
        <button
          type="submit"
          style={{
            backgroundColor: "#f0f0f0",
            color: "#333",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Reset Password
        </button>
      </form>

      <p style={{ color: "#666", margin: "20px 0 10px" }}>or</p>

      {/* Google SSO */}
      <button
        style={{
          backgroundColor: "#4285F4",
          color: "white",
          padding: "12px",
          border: "none",
          borderRadius: "8px",
          fontSize: "15px",
          cursor: "pointer",
          fontWeight: 500,
          width: "100%",
          transition: "background 0.3s ease",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#3367d6")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#4285F4")}
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      >
        Sign in with Google 
      </button>

      <p style={{ marginTop: "15px", color: "#555", fontSize: "14px" }}>
        Don’t have an account?{" "}
        <a href="/signup" style={{ color: "#1a73e8", textDecoration: "none" }}>
          Sign up
        </a>
      </p>
    </div>
  </div>
);

}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading sign-in page...</div>}>
      <SignInInner />
    </Suspense>
  );
}
