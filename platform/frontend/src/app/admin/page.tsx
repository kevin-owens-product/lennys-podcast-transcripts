"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import { adminApi } from "@/lib/api";

interface AdminDashboard {
  total_users: number;
  total_tenants: number;
  total_transcripts: number;
  total_chunks: number;
  total_chat_sessions: number;
  total_agent_runs: number;
}

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superadmin: boolean;
  created_at: string;
}

interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [stats, setStats] = useState<AdminDashboard | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tenants, setTenants] = useState<AdminTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "tenants" | "ingestion">("overview");
  const [ingesting, setIngesting] = useState(false);
  const [ingestionResult, setIngestionResult] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    if (user && !user.is_superadmin) {
      router.push("/dashboard");
      return;
    }

    async function loadAdmin() {
      try {
        const [statsData, usersData, tenantsData] = await Promise.all([
          adminApi.dashboard() as Promise<AdminDashboard>,
          adminApi.listUsers() as Promise<AdminUser[]>,
          adminApi.listTenants() as Promise<AdminTenant[]>,
        ]);
        setStats(statsData);
        setUsers(usersData);
        setTenants(tenantsData);
      } catch (err) {
        console.error("Failed to load admin data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAdmin();
  }, [token, user, router]);

  async function handleIngest() {
    setIngesting(true);
    setIngestionResult(null);
    try {
      const result = await adminApi.triggerIngestion() as any;
      setIngestionResult(
        `Ingestion complete: ${result.ingested} new transcripts processed`
      );
      // Refresh stats
      const statsData = await adminApi.dashboard() as AdminDashboard;
      setStats(statsData);
    } catch (err) {
      console.error("Ingestion failed:", err);
      setIngestionResult("Ingestion failed. Check server logs for details.");
    } finally {
      setIngesting(false);
    }
  }

  async function toggleUserActive(userId: string, currentActive: boolean) {
    try {
      await adminApi.updateUser(userId, { is_active: !currentActive });
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, is_active: !currentActive } : u
        )
      );
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  }

  async function toggleUserAdmin(userId: string, currentAdmin: boolean) {
    try {
      await adminApi.updateUser(userId, { is_superadmin: !currentAdmin });
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, is_superadmin: !currentAdmin } : u
        )
      );
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  }

  if (!token || (user && !user.is_superadmin)) return null;

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "users" as const, label: "Users" },
    { id: "tenants" as const, label: "Tenants" },
    { id: "ingestion" as const, label: "Ingestion" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Admin Panel
          </h1>
          <p className="text-gray-500 mb-6">
            Manage users, tenants, and platform configuration
          </p>

          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 mb-8 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                  <div className="h-8 bg-gray-200 rounded w-16" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === "overview" && stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <p className="text-sm text-gray-500 mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.total_users}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <p className="text-sm text-gray-500 mb-1">Total Tenants</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.total_tenants}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <p className="text-sm text-gray-500 mb-1">Transcripts</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.total_transcripts}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {stats.total_chunks} chunks
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <p className="text-sm text-gray-500 mb-1">Chat Sessions</p>
                    <p className="text-3xl font-bold text-brand-700">
                      {stats.total_chat_sessions}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <p className="text-sm text-gray-500 mb-1">Agent Runs</p>
                    <p className="text-3xl font-bold text-brand-700">
                      {stats.total_agent_runs}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <p className="text-sm text-gray-500 mb-1">Platform</p>
                    <p className="text-lg font-bold text-green-600">
                      Operational
                    </p>
                    <p className="text-xs text-gray-400 mt-1">All systems go</p>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          User
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Status
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Role
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Joined
                        </th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900">
                              {u.full_name}
                            </p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                u.is_active
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {u.is_active ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                u.is_superadmin
                                  ? "bg-purple-50 text-purple-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {u.is_superadmin ? "Admin" : "User"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() =>
                                toggleUserActive(u.id, u.is_active)
                              }
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              {u.is_active ? "Disable" : "Enable"}
                            </button>
                            <button
                              onClick={() =>
                                toggleUserAdmin(u.id, u.is_superadmin)
                              }
                              className="text-xs text-brand-600 hover:text-brand-700"
                            >
                              {u.is_superadmin ? "Remove Admin" : "Make Admin"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="text-center py-12 text-sm text-gray-500">
                      No users found
                    </div>
                  )}
                </div>
              )}

              {/* Tenants Tab */}
              {activeTab === "tenants" && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Organization
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Slug
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Plan
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {tenants.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900">
                              {t.name}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                              {t.slug}
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full capitalize">
                              {t.plan}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            {new Date(t.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tenants.length === 0 && (
                    <div className="text-center py-12 text-sm text-gray-500">
                      No tenants found
                    </div>
                  )}
                </div>
              )}

              {/* Ingestion Tab */}
              {activeTab === "ingestion" && (
                <div className="max-w-2xl">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Transcript Ingestion
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Ingest podcast transcripts from the episodes directory into
                      the database. This will parse markdown files, create
                      chunks, and optionally generate vector embeddings.
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">
                        Current Status
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Transcripts</p>
                          <p className="font-medium text-gray-900">
                            {stats?.total_transcripts || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Chunks</p>
                          <p className="font-medium text-gray-900">
                            {stats?.total_chunks || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleIngest}
                      disabled={ingesting}
                      className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {ingesting
                        ? "Ingesting Transcripts..."
                        : "Run Ingestion"}
                    </button>

                    {ingestionResult && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                          {ingestionResult}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
