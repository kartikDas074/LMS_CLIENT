"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardNavigation";
import Icon from "@/components/dashboard/Icon";
import { Card, EmptyState, PageHeader, SearchInput } from "@/components/ui/DashboardUI";
import {
  APPLICATION_ROLES,
  getApplicationRoleLabel,
  getApplicationRoles,
  getUsers,
  getUserCount,
  updateUserRole,
} from "@/services/strapi/users";

const ROLE_FILTERS = ["All", ...APPLICATION_ROLES.map((role) => role.label)];

function Avatar({ user }) {
  const imageUrl = user.image?.url;
  const initial = (user.username || user.name || user.email || "U").charAt(0).toUpperCase();

  return imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl} alt="" className="h-10 w-10 rounded-full border border-slate-700 object-cover" />
  ) : (
    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/10 text-sm font-bold text-orange-300">
      {initial}
    </span>
  );
}

function RoleBadge({ label }) {
  const styles = {
    "Admin Panel": "border-orange-400/30 bg-orange-500/10 text-orange-300",
    "Content Manager": "border-slate-600 bg-slate-800/70 text-slate-300",
    Instructor: "border-sky-400/20 bg-sky-400/10 text-sky-300",
    Student: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${styles[label] || styles.Student}`}>{label}</span>;
}

function UserStatus({ user }) {
  return <div className="flex flex-wrap gap-1.5"><span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${user.confirmed ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-amber-400/20 bg-amber-400/10 text-amber-300"}`}>{user.confirmed ? "Confirmed" : "Not Confirmed"}</span><span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${user.blocked ? "border-red-400/20 bg-red-400/10 text-red-300" : "border-slate-700 bg-slate-800/60 text-slate-400"}`}>{user.blocked ? "Blocked" : "Active"}</span></div>;
}

function LoadingRows() {
  return <div className="divide-y divide-slate-800/70">{[1, 2, 3, 4].map((row) => <div key={row} className="flex animate-pulse items-center gap-4 px-5 py-5"><span className="h-10 w-10 rounded-full bg-slate-800" /><span className="h-3 w-40 rounded bg-slate-800" /><span className="hidden h-3 w-48 rounded bg-slate-800 sm:block" /></div>)}</div>;
}

function RoleModal({ user, currentRole, roles, isSaving, error, onCancel, onConfirm }) {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const isSelfDemotion = user.id != null && currentRole === "Admin Panel" && selectedRole !== "Admin Panel";
  const selectedRoleId = roles.find((role) => role.label === selectedRole)?.id;

  return <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/75 p-4"><div role="dialog" aria-modal="true" aria-labelledby="role-modal-title" className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0F172A] p-5 shadow-2xl shadow-black/40 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">Permission change</p><h2 id="role-modal-title" className="mt-2 text-lg font-bold text-white">Change User Role?</h2></div><button type="button" onClick={onCancel} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-white" aria-label="Close role dialog"><Icon name="plus" size={18} className="rotate-45" /></button></div><div className="mt-5 space-y-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-xs"><div className="flex justify-between gap-4"><span className="text-slate-500">User</span><strong className="text-right text-slate-200">{user.username || user.email}</strong></div><div className="flex justify-between gap-4"><span className="text-slate-500">Current role</span><strong className="text-right text-slate-300">{currentRole}</strong></div><div className="flex justify-between gap-4"><span className="text-slate-500">New role</span><strong className="text-right text-orange-300">{selectedRole}</strong></div></div><fieldset className="mt-5 space-y-2"><legend className="mb-2 text-xs font-semibold text-slate-300">Select new role</legend>{roles.map((role) => <label key={role.label} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${selectedRole === role.label ? "border-orange-500/50 bg-orange-500/10 text-orange-200" : "border-slate-800 text-slate-400 hover:border-slate-700"}`}><input type="radio" name="user-role" value={role.label} checked={selectedRole === role.label} onChange={() => setSelectedRole(role.label)} className="accent-orange-500" />{role.label}</label>)}</fieldset>{isSelfDemotion && <div className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs leading-5 text-red-200">You are changing your own administrator role. You may lose access to the Admin Panel. For safety, self-demotion is disabled.</div>}{error && <p className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-200">{error}</p>}<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-xs font-semibold text-red-300 hover:bg-red-400/20">Cancel</button><button type="button" disabled={isSaving || !selectedRoleId || selectedRole === currentRole || isSelfDemotion} onClick={() => onConfirm(selectedRole, selectedRoleId)} className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-orange-500/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">{isSaving ? "Updating..." : "Confirm Change"}</button></div></div></div>;
}

export default function UserManagementPage() {
  const { user: currentUser, role: currentUserRole, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalError, setModalError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (authLoading || normalizeRole(currentUserRole) !== "admin") return;
    let cancelled = false;
    async function loadUsers() {
      setIsLoading(true);
      setLoadError("");
      try {
        const [count, userResult, roleResult] = await Promise.all([getUserCount(), getUsers(), getApplicationRoles()]);
        if (cancelled) return;
        setTotalUsers(Number(count));
        setUsers(userResult.users);
        setRoles(roleResult);
      } catch (error) {
        if (!cancelled) setLoadError(error.message || "Unable to load users.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadUsers();
    return () => { cancelled = true; };
  }, [authLoading, currentUserRole]);

  const roleCounts = useMemo(() => APPLICATION_ROLES.reduce((counts, role) => ({ ...counts, [role.label]: users.filter((user) => getApplicationRoleLabel(user.role) === role.label).length }), {}), [users]);
  const filteredUsers = useMemo(() => users.filter((user) => { const label = getApplicationRoleLabel(user.role); const matchesRole = activeFilter === "All" || label === activeFilter; const term = query.trim().toLowerCase(); return matchesRole && (!term || user.username?.toLowerCase().includes(term) || user.email?.toLowerCase().includes(term)); }), [activeFilter, query, users]);

  async function handleRoleChange(newRole, roleId) {
    setIsSaving(true);
    setModalError("");
    try {
      const updatedUser = await updateUserRole(selectedUser, roleId);
      const returnedUser = updatedUser?.data || updatedUser;
      setUsers((currentUsers) => currentUsers.map((user) => user.id === selectedUser.id ? { ...user, ...returnedUser, role: returnedUser?.role || { id: roleId, name: newRole, type: APPLICATION_ROLES.find((role) => role.label === newRole)?.types[0] } } : user));
      setSelectedUser(null);
      setNotice("User role updated successfully.");
      window.setTimeout(() => setNotice(""), 3500);
    } catch (error) {
      setModalError(error.message || "Unable to update this user's role.");
    } finally {
      setIsSaving(false);
    }
  }

  if (authLoading) return <div className="space-y-7"><PageHeader eyebrow="Administration" title="User Management" description="Loading administrator access..." /><Card className="p-8"><LoadingRows /></Card></div>;
  if (normalizeRole(currentUserRole) !== "admin") return <EmptyState title="Admin Panel access required" description="This workspace is available only to users with the Admin Panel role." />;

  return <div className="space-y-7"><PageHeader eyebrow="Administration" title="User Management" description="Review platform users and manage their application roles." />{notice && <div role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">{notice}</div>}{loadError && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{loadError}</div>}<div className="grid grid-cols-2 gap-3 md:grid-cols-5"><SummaryCard label="Total Users" value={isLoading ? null : totalUsers} /><SummaryCard label="Admin Panel" value={isLoading ? null : roleCounts["Admin Panel"]} accent="orange" /><SummaryCard label="Content Manager" value={isLoading ? null : roleCounts["Content Manager"]} /><SummaryCard label="Instructor" value={isLoading ? null : roleCounts.Instructor} /><SummaryCard label="Student" value={isLoading ? null : roleCounts.Student} /></div><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="w-full sm:max-w-xs"><SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search username or email..." /></div><div className="flex max-w-full gap-2 overflow-x-auto pb-1">{ROLE_FILTERS.map((filter) => <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={`whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-semibold transition ${activeFilter === filter ? "border-orange-500/50 bg-orange-500/10 text-orange-300" : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"}`}>{filter}</button>)}</div></div><Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-slate-800 px-5 py-4"><div><h2 className="text-sm font-semibold text-slate-200">Platform users</h2><p className="mt-1 text-xs text-slate-500">{isLoading ? "Loading users..." : `${filteredUsers.length} shown of ${users.length} loaded`}</p></div><span className="hidden text-[10px] uppercase tracking-wider text-slate-600 sm:block">Role access</span></div>{isLoading ? <LoadingRows /> : filteredUsers.length === 0 ? <div className="p-5"><EmptyState title="No users found" description="Try selecting another role or changing your search." /></div> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="border-b border-slate-800 bg-slate-950/40 text-[10px] uppercase tracking-wider text-slate-600"><tr><th className="px-5 py-3 font-bold">User</th><th className="px-5 py-3 font-bold">Email</th><th className="px-5 py-3 font-bold">Role</th><th className="px-5 py-3 font-bold">Status</th><th className="px-5 py-3 font-bold">Created</th><th className="px-5 py-3 font-bold">Actions</th></tr></thead><tbody className="divide-y divide-slate-800/70">{filteredUsers.map((user) => { const label = getApplicationRoleLabel(user.role); const isCurrentUser = String(currentUser?.id) === String(user.id); return <tr key={user.id || user.documentId} className="transition hover:bg-slate-800/20"><td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar user={user} /><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-200">{user.username || "Unnamed user"}{isCurrentUser && <span className="ml-2 text-[10px] font-normal text-orange-400">You</span>}</p><p className="mt-1 text-[10px] text-slate-600">ID {user.id}</p></div></div></td><td className="px-5 py-4 text-xs text-slate-400">{user.email}</td><td className="px-5 py-4"><RoleBadge label={label} /></td><td className="px-5 py-4"><UserStatus user={user} /></td><td className="px-5 py-4 text-xs text-slate-500">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</td><td className="px-5 py-4"><button type="button" onClick={() => { setSelectedUser(user); setModalError(""); }} className="whitespace-nowrap rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-orange-500/50 hover:text-orange-300">Change Role</button></td></tr>; })}</tbody></table></div>}</Card>{selectedUser && <RoleModal user={selectedUser} currentRole={getApplicationRoleLabel(selectedUser.role)} roles={roles} isSaving={isSaving} error={modalError} onCancel={() => !isSaving && setSelectedUser(null)} onConfirm={handleRoleChange} />}</div>;
}

function SummaryCard({ label, value, accent }) {
  return <Card className="p-4 sm:p-5"><p className="truncate text-xs text-slate-500">{label}</p>{value == null ? <div className="mt-3 h-8 w-16 animate-pulse rounded bg-slate-800" /> : <p className={`mt-2 text-2xl font-bold tracking-tight ${accent === "orange" ? "text-orange-300" : "text-white"}`}>{value}</p>}</Card>;
}
