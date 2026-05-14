/**
 * RBAC Configuration for LaburApp
 * 
 * Defines roles and their associated permissions.
 * Used by middleware to control access to endpoints.
 */

export enum Role {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
}

export enum Permission {
  // User permissions
  READ_OWN_PROFILE = 'read:own_profile',
  UPDATE_OWN_PROFILE = 'update:own_profile',
  DELETE_OWN_ACCOUNT = 'delete:own_account',

  // Service Request permissions (CLIENT)
  CREATE_REQUEST = 'create:request',
  READ_OWN_REQUESTS = 'read:own_requests',
  UPDATE_OWN_REQUEST = 'update:own_request',
  CANCEL_OWN_REQUEST = 'cancel:own_request',

  // Provider Profile permissions (PROVIDER)
  CREATE_PROVIDER_PROFILE = 'create:provider_profile',
  UPDATE_PROVIDER_PROFILE = 'update:provider_profile',
  READ_PROVIDER_PROFILE = 'read:provider_profile',

  // Service Request permissions (PROVIDER)
  VIEW_AVAILABLE_REQUESTS = 'view:available_requests',
  ACCEPT_REQUEST = 'accept:request',
  UPDATE_REQUEST_STATUS = 'update:request_status',
  READ_ACCEPTED_REQUESTS = 'read:accepted_requests',
}

/**
 * Maps roles to their allowed permissions
 */
export const rolePermissions: Record<Role, Permission[]> = {
  [Role.CLIENT]: [
    Permission.READ_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
    Permission.DELETE_OWN_ACCOUNT,
    Permission.CREATE_REQUEST,
    Permission.READ_OWN_REQUESTS,
    Permission.UPDATE_OWN_REQUEST,
    Permission.CANCEL_OWN_REQUEST,
  ],
  [Role.PROVIDER]: [
    Permission.READ_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
    Permission.DELETE_OWN_ACCOUNT,
    Permission.CREATE_PROVIDER_PROFILE,
    Permission.UPDATE_PROVIDER_PROFILE,
    Permission.READ_PROVIDER_PROFILE,
    Permission.VIEW_AVAILABLE_REQUESTS,
    Permission.ACCEPT_REQUEST,
    Permission.UPDATE_REQUEST_STATUS,
    Permission.READ_ACCEPTED_REQUESTS,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: Role): Permission[] {
  return rolePermissions[role] ?? [];
}
