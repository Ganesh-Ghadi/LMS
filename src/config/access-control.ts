// Access control configuration: declarative page + API prefix -> required permission mapping
// Provides longest-prefix rule resolution via findAccessRule for client guards (and future middleware).
// No side effects; consumed by hooks (useProtectPage) & guardApiAccess.
import { PERMISSIONS } from "@/config/roles";

// Page (app router) path prefix -> required permissions (ALL must pass)
// Order no longer matters once longest-prefix logic below is applied, but keep specific before general for readability.
export const PAGE_ACCESS_RULES: { prefix: string; permissions: string[] }[] = [
  // Dashboard
  { prefix: "/dashboard", permissions: [PERMISSIONS.VIEW_DASHBOARD] },
  // Profile (auth only)
  { prefix: "/profile", permissions: [] },
  // Roles & Permissions
  { prefix: "/roles/", permissions: [PERMISSIONS.EDIT_ROLES_PERMISSIONS] },
  { prefix: "/roles", permissions: [PERMISSIONS.VIEW_ROLES] },
  { prefix: "/users/new", permissions: [PERMISSIONS.CREATE_USERS] }, // create user page
  { prefix: "/users/", permissions: [PERMISSIONS.EDIT_USERS] }, // edit user pages (/users/:id/...)
  { prefix: "/users", permissions: [PERMISSIONS.VIEW_USERS] }, // users list (view only)
  // Cities
  { prefix: "/cities/new", permissions: [PERMISSIONS.CREATE_CITIES] },
  { prefix: "/cities/", permissions: [PERMISSIONS.EDIT_CITIES] },
  { prefix: "/cities", permissions: [PERMISSIONS.VIEW_CITIES] },
  // States
  { prefix: "/states/new", permissions: [PERMISSIONS.CREATE_STATES] },
  { prefix: "/states/", permissions: [PERMISSIONS.EDIT_STATES] },
  { prefix: "/states", permissions: [PERMISSIONS.VIEW_STATES] },
];

// API route path prefix -> required permissions (ALL must pass)
// NOTE: '/api/users' will also match '/api/users/...'
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Method-aware API rules. If methods map present, use per-method permissions; else fall back to permissions.
export type ApiAccessRule = {
  prefix: string; // path prefix
  permissions?: Permission[]; // fallback permissions (ALL must pass)
  methods?: Partial<Record<string, Permission[]>>; // e.g. { GET: [...], POST: [...] }
};

export const API_ACCESS_RULES: ApiAccessRule[] = [
  // Current user profile (auth only)
  {
    prefix: "/api/me",
    methods: {
      GET: [],
      PATCH: [],
    },
  },
  // Access Control
  {
    prefix: "/api/access-control/permissions",
    methods: {
      GET: [PERMISSIONS.VIEW_ROLES],
    },
  },
  {
    prefix: "/api/access-control/roles",
    methods: {
      GET: [PERMISSIONS.VIEW_ROLES],
      POST: [PERMISSIONS.EDIT_ROLES_PERMISSIONS],
      PATCH: [PERMISSIONS.EDIT_ROLES_PERMISSIONS],
      PUT: [PERMISSIONS.EDIT_ROLES_PERMISSIONS],
      DELETE: [PERMISSIONS.EDIT_ROLES_PERMISSIONS],
    },
  },
  {
    prefix: "/api/access-control/users/",
    methods: {
      GET: [PERMISSIONS.EDIT_ROLES_PERMISSIONS],
      PUT: [PERMISSIONS.EDIT_ROLES_PERMISSIONS],
      POST: [PERMISSIONS.EDIT_ROLES_PERMISSIONS],
      PATCH: [PERMISSIONS.EDIT_ROLES_PERMISSIONS],
      DELETE: [PERMISSIONS.EDIT_ROLES_PERMISSIONS],
    },
  },
  {
    prefix: "/api/users",
    methods: {
      GET: [PERMISSIONS.READ_USERS],
      POST: [PERMISSIONS.CREATE_USERS],
      PATCH: [PERMISSIONS.EDIT_USERS],
      DELETE: [PERMISSIONS.DELETE_USERS],
    },
  },
  {
    prefix: "/api/cities",
    methods: {
      GET: [PERMISSIONS.READ_CITIES],
      POST: [PERMISSIONS.CREATE_CITIES],
      PATCH: [PERMISSIONS.EDIT_CITIES],
      DELETE: [PERMISSIONS.DELETE_CITIES],
    },
  },
  {
    prefix: "/api/states",
    methods: {
      GET: [PERMISSIONS.READ_STATES],
      POST: [PERMISSIONS.CREATE_STATES],
      PATCH: [PERMISSIONS.EDIT_STATES],
      DELETE: [PERMISSIONS.DELETE_STATES],
    },
  },
];

export type AccessRule =
  | { type: "page"; prefix: string; permissions: string[] }
  | { type: "api"; prefix: string; permissions: string[]; methods?: any };

/**
 * Longest-prefix match for a given path.
 * Checks PAGE_ACCESS_RULES first, then API_ACCESS_RULES.
 */
export function findAccessRule(path: string): AccessRule | null {
  let match: AccessRule | null = null;

  // Check Pages
  for (const rule of PAGE_ACCESS_RULES) {
    if (path.startsWith(rule.prefix)) {
      if (!match || rule.prefix.length > match.prefix.length) {
        match = { type: "page", ...rule };
      }
    }
  }

  // Check API (if no page match or to find most specific)
  for (const rule of API_ACCESS_RULES) {
    if (path.startsWith(rule.prefix)) {
      if (!match || rule.prefix.length > match.prefix.length) {
        match = { type: "api", ...rule } as any;
      }
    }
  }

  return match;
}
