
export default function DashboardWrapperPage() {
  return (
    <div>
      <h1>Dashboard Overview</h1>
      <p>This is a placeholder for the main dashboard route.</p>
    </div>
  );
}

/*"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [flaskUser, setFlaskUser] = useState<any>(null);
  const router = useRouter();

  // Check Flask JWT cookie session
  useEffect(() => {
    if (!session) {
      axios
        .get("http://localhost:5000/verify-session", { withCredentials: true })
        .then((res) => setFlaskUser(res.data.user))
        .catch(() => {
          if (status !== "loading") router.push("/signin");
        });
    }
  }, [session, status]);

  const handleLogout = async () => {
    if (session) {
      signOut({ callbackUrl: "/signin" });
    } else {
      await axios.post("http://localhost:5000/logout", {}, { withCredentials: true });
      router.push("/signin");
    }
  };

  if (status === "loading") return <p>Loading...</p>;

  const user = session?.user || flaskUser;

  if (!user) return <p>Please sign in first.</p>;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1>Dashboard</h1>
      <p>User: {user.name || user.username}</p>
      <p>Role: {user.role || "N/A"}</p>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </main>
  );
}
*/