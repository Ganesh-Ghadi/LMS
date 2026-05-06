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
  // Areas
  { prefix: "/areas/new", permissions: [PERMISSIONS.CREATE_AREAS] },
  { prefix: "/areas/", permissions: [PERMISSIONS.EDIT_AREAS] },
  { prefix: "/areas", permissions: [PERMISSIONS.VIEW_AREAS] },
  // Folding Types
  { prefix: "/folding-types", permissions: [PERMISSIONS.VIEW_FOLDING_TYPES] },
  // Services
  { prefix: "/services/new", permissions: [PERMISSIONS.CREATE_SERVICES] },
  { prefix: "/services/", permissions: [PERMISSIONS.EDIT_SERVICES] },
  { prefix: "/services", permissions: [PERMISSIONS.VIEW_SERVICES] },
  // Remarks
  { prefix: "/remarks/new", permissions: [PERMISSIONS.CREATE_REMARKS] },
  { prefix: "/remarks/", permissions: [PERMISSIONS.EDIT_REMARKS] },
  { prefix: "/remarks", permissions: [PERMISSIONS.VIEW_REMARKS] },
  // Works
  { prefix: "/works/new", permissions: [PERMISSIONS.CREATE_WORKS] },
  { prefix: "/works/", permissions: [PERMISSIONS.EDIT_WORKS] },
  { prefix: "/works", permissions: [PERMISSIONS.VIEW_WORKS] },
  // Layers
  { prefix: "/layers/new", permissions: [PERMISSIONS.CREATE_LAYERS] },
  { prefix: "/layers/", permissions: [PERMISSIONS.EDIT_LAYERS] },
  { prefix: "/layers", permissions: [PERMISSIONS.VIEW_LAYERS] },
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
      GET: [PERMISSIONS.READ_ROLES],
      POST: [PERMISSIONS.EDIT_ROLES_PERMISSIONS],
      PATCH: [PERMISSIONS.EDIT_ROLES_PERMISSIONS],
      PUT: [PERMISSIONS.EDIT_ROLES_PERMISSIONS],
      DELETE: [PERMISSIONS.EDIT_ROLES_PERMISSIONS],
    },
  },
  {
    prefix: "/api/access-control/users/",
    methods: {
      GET: [PERMISSIONS.EDIT_USER_PERMISSIONS],
      PUT: [PERMISSIONS.EDIT_USER_PERMISSIONS],
      POST: [PERMISSIONS.EDIT_USER_PERMISSIONS],
      PATCH: [PERMISSIONS.EDIT_USER_PERMISSIONS],
      DELETE: [PERMISSIONS.EDIT_USER_PERMISSIONS],
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
    prefix: "/api/areas",
    methods: {
      GET: [PERMISSIONS.READ_AREAS],
      POST: [PERMISSIONS.CREATE_AREAS],
      PATCH: [PERMISSIONS.EDIT_AREAS],
      DELETE: [PERMISSIONS.DELETE_AREAS],
    },
  },
  {
    prefix: "/api/folding-types",
    methods: {
      GET: [PERMISSIONS.READ_FOLDING_TYPES],
      POST: [PERMISSIONS.CREATE_FOLDING_TYPES],
      PATCH: [PERMISSIONS.EDIT_FOLDING_TYPES],
      DELETE: [PERMISSIONS.DELETE_FOLDING_TYPES],
    },
  },
  {
    prefix: "/api/services",
    methods: {
      GET: [PERMISSIONS.READ_SERVICES],
      POST: [PERMISSIONS.CREATE_SERVICES],
      PATCH: [PERMISSIONS.EDIT_SERVICES],
      DELETE: [PERMISSIONS.DELETE_SERVICES],
    },
  },
  {
    prefix: "/api/remarks",
    methods: {
      GET: [PERMISSIONS.READ_REMARKS],
      POST: [PERMISSIONS.CREATE_REMARKS],
      PATCH: [PERMISSIONS.EDIT_REMARKS],
      DELETE: [PERMISSIONS.DELETE_REMARKS],
    },
  },
  {
    prefix: "/api/works",
    methods: {
      GET: [PERMISSIONS.READ_WORKS],
      POST: [PERMISSIONS.CREATE_WORKS],
      PATCH: [PERMISSIONS.EDIT_WORKS],
      DELETE: [PERMISSIONS.DELETE_WORKS],
    },
  },
  {
    prefix: "/api/layers",
    methods: {
      GET: [PERMISSIONS.READ_LAYERS],
      POST: [PERMISSIONS.CREATE_LAYERS],
      PATCH: [PERMISSIONS.EDIT_LAYERS],
      DELETE: [PERMISSIONS.DELETE_LAYERS],
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
