import type { Role } from '@/types/user';

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  supervisor: 'Superviseur',
  operator: 'Opérateur',
};

export const ROLE_LEVELS: Record<Role, number> = {
  super_admin: 4,
  admin: 3,
  supervisor: 2,
  operator: 1,
};

export const ROLES_LIST: Role[] = ['super_admin', 'admin', 'supervisor', 'operator'];

export function canManageRole(currentRole: Role, targetRole: Role): boolean {
  if (currentRole === 'super_admin') return true;
  return ROLE_LEVELS[currentRole] > ROLE_LEVELS[targetRole];
}

export function getManageableRoles(currentRole: Role): Role[] {
  return ROLES_LIST.filter(role => canManageRole(currentRole, role));
}
