import { describe, it, expect } from 'vitest';
import { isPrivilegedRole, canCreateProject } from './permissions';
import type { User, UserRole } from '../types/models';

describe('isPrivilegedRole', () => {
  const ownerRole: UserRole = 'owner';
  const adminRole: UserRole = 'admin';
  const memberRole: UserRole = 'member';
  const nullRole: UserRole | null = null;

  it('returns true for owner', () => {
    expect(isPrivilegedRole(ownerRole)).toBe(true);
  });

  it('returns true for admin', () => {
    expect(isPrivilegedRole(adminRole)).toBe(true);
  });

  it('returns false for member', () => {
    expect(isPrivilegedRole(memberRole)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isPrivilegedRole(nullRole)).toBe(false);
  });
});

describe('canCreateProject', () => {
  const ownerUser: User = {
    _id: 'u1',
    firstName: 'Owner',
    lastName: 'One',
    email: 'owner@example.test',
    organizationId: 'org1',
    role: 'owner',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z',
  };

  const adminUser: User = {
    _id: 'u2',
    firstName: 'Admin',
    lastName: 'Two',
    email: 'admin@example.test',
    organizationId: 'org1',
    role: 'admin',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z',
  };

  const memberUser: User = {
    _id: 'u3',
    firstName: 'Member',
    lastName: 'Three',
    email: 'member@example.test',
    organizationId: 'org1',
    role: 'member',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z',
  };

  const nullUser: User | null = null;

  it('returns true for owner user', () => {
    expect(canCreateProject(ownerUser)).toBe(true);
  });

  it('returns true for admin user', () => {
    expect(canCreateProject(adminUser)).toBe(true);
  });

  it('returns false for member user', () => {
    expect(canCreateProject(memberUser)).toBe(false);
  });

  it('returns false for null user', () => {
    expect(canCreateProject(nullUser)).toBe(false);
  });
});
