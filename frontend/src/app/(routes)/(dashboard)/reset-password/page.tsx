"use client";
export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/app/lib/apiClient";
import { toast } from "react-toastify";

function ResetPasswordInner() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  //  Handle password reset submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPass) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await apiClient.post("/reset-password", {
        token,
        new_password: newPassword,
      });

      if (res.data.message === "Password reset successful") {
        toast.success("✅ Password reset successful!");
        router.push("/signin");
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || "Something went wrong";
      toast.error(msg);
      setError(msg);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>Reset Your Password</h2>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "300px",
          margin: "0 auto",
        }}
      >
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px" }}
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
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
          Reset Password
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div>Loading reset page...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
