import { getStoredToken } from "@/lib/auth";
import { API_BASE_URL } from "@/config/api";

export const APPLICATION_ROLES = [
  { label: "Admin Panel", types: ["admin-pannel", "admin-panel", "admin"] },
  { label: "Content Manager", types: ["content-manager", "content manager"] },
  { label: "Instructor", types: ["instructor"] },
  { label: "Student", types: ["student", "authenticated"] },
];

function getToken() {
  const token = getStoredToken();
  if (!token) {
    const error = new Error("You must be signed in to manage users.");
    error.status = 401;
    throw error;
  }
  return token;
}

async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      data?.error?.message ||
        data?.message ||
        (response.status === 401
          ? "Unauthorized. Please sign in again."
          : response.status === 403
            ? "You are not allowed to manage users."
            : response.status === 404
              ? "The requested user was not found."
              : "Unable to complete the user management request.")
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function getUserCount() {
  return request("/users/count");
}

export async function getUsers({ page, pageSize } = {}) {
  const params = new URLSearchParams({ populate: "role,image" });
  if (page) params.set("pagination[page]", String(page));
  if (pageSize) params.set("pagination[pageSize]", String(pageSize));

  const data = await request(`/users?${params.toString()}`);
  return {
    users: Array.isArray(data) ? data : data?.data || [],
    pagination: data?.meta?.pagination || null,
  };
}

export async function getApplicationRoles() {
  const data = await request("/users-permissions/roles");
  const roles = Array.isArray(data) ? data : data?.roles || data?.data || [];

  return APPLICATION_ROLES.map((applicationRole) => {
    const role = roles.find((candidate) => {
      const candidateType = String(candidate.type || "").toLowerCase();
      const candidateName = String(candidate.name || "").toLowerCase();
      return applicationRole.types.includes(candidateType) || applicationRole.types.includes(candidateName);
    });

    if (!role) {
      throw new Error(`The Strapi role "${applicationRole.label}" could not be resolved.`);
    }

    return { ...applicationRole, id: role.id ?? role.documentId };
  });
}

export async function updateUserRole(user, roleId) {
  const identifier = user.id;
  if (identifier == null) {
    throw new Error("This user does not have a valid numeric id.");
  }

  return request(`/users/${encodeURIComponent(identifier)}`, {
    method: "PUT",
    body: JSON.stringify({ role: roleId }),
  });
}

export function getApplicationRole(role) {
  const type = typeof role === "object" ? role?.type || role?.name : role;
  const normalized = String(type || "").toLowerCase();
  return APPLICATION_ROLES.find((applicationRole) => applicationRole.types.includes(normalized)) || null;
}

export function getApplicationRoleLabel(role) {
  return getApplicationRole(role)?.label || "Student";
}
