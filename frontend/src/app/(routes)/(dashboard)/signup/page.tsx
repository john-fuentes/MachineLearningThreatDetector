"use client";
export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/app/lib/apiClient";

function SignUpInner() {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegularSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await apiClient.post("/signup", {
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });

      if (
        res.data.message ===
        "Account created! Check your email for the verification code"
      ) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed");
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
          Create your account
        </h2>

        <form
          onSubmit={handleRegularSignUp}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
            required
          />
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
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
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#1557b0")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#1a73e8")
            }
          >
            Sign Up
          </button>

          {error && (
            <p style={{ color: "red", fontSize: "13px", marginTop: "5px" }}>
              {error}
            </p>
          )}
        </form>

        <hr
          style={{
            margin: "25px 0",
            border: "none",
            borderTop: "1px solid #e5e5e5",
          }}
        />

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
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#3367d6")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#4285F4")
          }
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          Sign up with Google
        </button>

        <p
          style={{
            marginTop: "15px",
            color: "#555",
            fontSize: "14px",
          }}
        >
          Already have an account?{" "}
          <a href="/signin" style={{ color: "#1a73e8", textDecoration: "none" }}>
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SignUp() {
  return (
    <Suspense fallback={<div>Loading sign-up page...</div>}>
      <SignUpInner />
    </Suspense>
  );
}
