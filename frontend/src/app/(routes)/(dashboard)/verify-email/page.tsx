"use client";
export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { apiClient } from "@/app/lib/apiClient";

function VerifyEmailInner() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  //  Verify Email
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await apiClient.post("/verify-email", { 
        email, 
        code, 
      });

      if (res.data.message === "Email verified") {
        toast.success(" Email verified successfully!");
        router.push("/signin");
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || "Invalid verification code";
      toast.error(msg);
      setError(msg);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    const emailToSend =
      email || prompt("Enter your email to resend the verification code:");
    if (!emailToSend) return;

    try {
      const res = await apiClient.post("/resend-verification-code", {
        email: emailToSend,
      });
      toast.success(res.data.message);
    } catch (err: any) {
      const msg = err.response?.data?.error || "Something went wrong";
      toast.error(msg);
      setError(msg);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>Verify Your Email</h2>
      <form
        onSubmit={handleVerify}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "300px",
          margin: "0 auto",
        }}
      >
        <input
          type="text"
          placeholder="Enter verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px" }}
          required
        />
        <button
          type="submit"
          style={{
            padding: "10px",
            borderRadius: "5px",
            backgroundColor: "#1a73e8",
            color: "white",
          }}
        >
          Verify Email
        </button>
        <button
          type="button"
          onClick={handleResendCode}
          style={{
            marginTop: "10px",
            padding: "10px",
            borderRadius: "5px",
            backgroundColor: "#f0f0f0",
            cursor: "pointer",
          }}
        >
          Didn’t receive a code? Click here to resend
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div>Loading verification page...</div>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
