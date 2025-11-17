"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/app/lib/apiClient"; // global axios instance
import Link from "next/link";

export const dynamic = "force-dynamic";

type Vm = {
  id: number;
  vm_name: string;
  os_type: string;
  status: string;
  cpu_cores: number;
  memory_gb: number;
  storage_gb: number;
  created_at: string;
};

export default function VmSelectionPage() {
  const [vms, setVms] = useState<Vm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [newVm, setNewVm] = useState({
    vm_name: "",
    os_type: "",
    cpu_cores: 2,
    memory_gb: 4,
    storage_gb: 20,
    description: "",
  });

  // Fetch VMs for the logged-in user
  const fetchVMs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/vms"); // token auto-added
      setVms(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load VMs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVMs();
  }, []);

  // ✅ Create new VM
  const handleCreateVM = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await apiClient.post("/vms", newVm);
      if (res.status === 201) {
        setFormVisible(false);
        setNewVm({
          vm_name: "",
          os_type: "",
          cpu_cores: 2,
          memory_gb: 4,
          storage_gb: 20,
          description: "",
        });
        fetchVMs(); // refresh list
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to create VM");
    }
  };

  //  Delete VM
  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/vms/${id}`);
      setVms(vms.filter((v) => v.id !== id));
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete VM");
    }
  };

  //  Change VM Status (Start / Stop / Restart)
  const handleStatusChange = async (id: number, newStatus: string) => {
    setActionLoading(id);
    try {
      await apiClient.put(`/vms/${id}`, { status: newStatus });
      setVms((prev) =>
        prev.map((v) =>
          v.id === id ? { ...v, status: newStatus } : v
        )
      );
    } catch (err: any) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  //  UI
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Virtual Machines</h1>
        <button
          onClick={() => setFormVisible(!formVisible)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {formVisible ? "Cancel" : "Create VM"}
        </button>
      </div>

      {/* Create VM Form */}
      {formVisible && (
        <form
          onSubmit={handleCreateVM}
          className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 border p-6 rounded bg-gray-50"
        >
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700">
              VM Name
            </label>
            <input
              type="text"
              placeholder="Enter a name (e.g. Debian Test VM)"
              value={newVm.vm_name}
              onChange={(e) => setNewVm({ ...newVm, vm_name: e.target.value })}
              className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700">
              Operating System
            </label>
            <input
              type="text"
              value={newVm.os_type}
              onChange={(e) => setNewVm({ ...newVm, os_type: e.target.value })}
              className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700">
              CPU Cores
            </label>
            <input
              type="number"
              placeholder="2"
              min={1}
              value={newVm.cpu_cores}
              onChange={(e) =>
                setNewVm({ ...newVm, cpu_cores: Number(e.target.value) })
              }
              className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700">
              Memory (GB)
            </label>
            <input
              type="number"
              placeholder="4"
              min={1}
              value={newVm.memory_gb}
              onChange={(e) =>
                setNewVm({ ...newVm, memory_gb: Number(e.target.value) })
              }
              className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-gray-700">
              Storage (GB)
            </label>
            <input
              type="number"
              placeholder="20"
              min={1}
              value={newVm.storage_gb}
              onChange={(e) =>
                setNewVm({ ...newVm, storage_gb: Number(e.target.value) })
              }
              className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex flex-col col-span-full">
            <label className="text-sm font-medium mb-1 text-gray-700">
              Description (optional)
            </label>
            <input
              type="text"
              placeholder="Add notes about this VM (e.g., 'Testing Kafka Stream')"
              value={newVm.description}
              onChange={(e) =>
                setNewVm({ ...newVm, description: e.target.value })
              }
              className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            className="col-span-full bg-green-600 text-white rounded p-3 hover:bg-green-700 transition"
          >
            Create VM
          </button>
        </form>
      )}

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading && <p>Loading VMs...</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vms.map((vm) => (
          <div
            key={vm.id}
            className="p-4 border rounded shadow-sm bg-white flex flex-col justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold">{vm.vm_name}</h2>
              <p className="text-sm text-gray-500">{vm.os_type}</p>
              <p className="text-sm">
                Status:{" "}
                <b
                  className={
                    vm.status === "running"
                      ? "text-green-600"
                      : vm.status === "stopped"
                      ? "text-red-500"
                      : "text-yellow-500"
                  }
                >
                  {vm.status}
                </b>
              </p>
              <p className="text-sm">
                {vm.cpu_cores} CPU • {vm.memory_gb} GB RAM • {vm.storage_gb} GB
                Disk
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Created: {new Date(vm.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex justify-between items-center mt-4">
              <Link
                href={`/vms/${vm.id}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View Analytics
              </Link>
              <button
                onClick={() => handleDelete(vm.id)}
                className="text-red-500 text-sm hover:underline"
              >
                Delete
              </button>
            </div>

            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => handleStatusChange(vm.id, "running")}
                disabled={actionLoading === vm.id}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                Start
              </button>
              <button
                onClick={() => handleStatusChange(vm.id, "stopped")}
                disabled={actionLoading === vm.id}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                Stop
              </button>
              <button
                onClick={() => handleStatusChange(vm.id, "restarting")}
                disabled={actionLoading === vm.id}
                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 disabled:opacity-50"
              >
                Restart
              </button>
            </div>
          </div>
        ))}
        {!loading && vms.length === 0 && (
          <p className="text-gray-600">No VMs yet. Create one above!</p>
        )}
      </div>
    </div>
  );
}
