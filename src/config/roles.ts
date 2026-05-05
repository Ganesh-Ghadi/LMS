// RBAC constants: stable permission & role identifiers plus role->permission mapping.
// Extend by adding new PERMISSIONS keys and including them in relevant ROLES_PERMISSIONS entries.
export const PERMISSIONS = {
  // Core / Dashboard
  VIEW_DASHBOARD: "VIEW:DASHBOARD",

  // Users (existing internal management)
  READ_USERS: "READ:USERS",
  CREATE_USERS: "CREATE:USERS",
  EDIT_USERS: "EDIT:USERS",
  DELETE_USERS: "DELETE:USERS",
  VIEW_USERS: "VIEW:USERS",

  // Roles
  VIEW_ROLES: "VIEW:ROLES",
  EDIT_ROLES_PERMISSIONS: "EDIT:ROLES_PERMISSIONS",

  // States
  READ_STATES: "READ:STATES",
  CREATE_STATES: "CREATE:STATES",
  EDIT_STATES: "EDIT:STATES",
  DELETE_STATES: "DELETE:STATES",
  VIEW_STATES: "VIEW:STATES",

  // Cities
  READ_CITIES: "READ:CITIES",
  CREATE_CITIES: "CREATE:CITIES",
  EDIT_CITIES: "EDIT:CITIES",
  DELETE_CITIES: "DELETE:CITIES",
  VIEW_CITIES: "VIEW:CITIES",
} as const;

export const PERMISSION_GROUPS: {
  key: string;
  label: string;
  permissions: string[];
}[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    permissions: [PERMISSIONS.VIEW_DASHBOARD],
  },
  {
    key: "users",
    label: "Users",
    permissions: [
      PERMISSIONS.VIEW_USERS,
      PERMISSIONS.READ_USERS,
      PERMISSIONS.CREATE_USERS,
      PERMISSIONS.EDIT_USERS,
      PERMISSIONS.DELETE_USERS,
    ],
  },
  {
    key: "roles",
    label: "Roles",
    permissions: [
      PERMISSIONS.VIEW_ROLES,
      PERMISSIONS.EDIT_ROLES_PERMISSIONS,
    ],
  },
  {
    key: "states",
    label: "States",
    permissions: [
      PERMISSIONS.VIEW_STATES,
      PERMISSIONS.READ_STATES,
      PERMISSIONS.CREATE_STATES,
      PERMISSIONS.EDIT_STATES,
      PERMISSIONS.DELETE_STATES,
    ],
  },
  {
    key: "cities",
    label: "Cities",
    permissions: [
      PERMISSIONS.VIEW_CITIES,
      PERMISSIONS.READ_CITIES,
      PERMISSIONS.CREATE_CITIES,
      PERMISSIONS.EDIT_CITIES,
      PERMISSIONS.DELETE_CITIES,
    ],
  },
];

export const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;
