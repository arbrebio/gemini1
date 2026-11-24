import { describe as suite, it, expect } from 'vitest';
import {
  trackedPortal, isSensitiveGet, loginPortal, resourceKey, describe, pickSafe, entityIdFrom, jwtClaims,
} from '../activityDescribe';

suite('trackedPortal', () => {
  it('maps API prefixes to portals', () => {
    expect(trackedPortal('/api/admin/careers/employees/')).toBe('admin');
    expect(trackedPortal('/api/hr/me')).toBe('hr');
    expect(trackedPortal('/api/terrain/visits/')).toBe('terrain');
    expect(trackedPortal('/api/sales-agent/sales/')).toBe('sales');
    expect(trackedPortal('/api/activity/session/')).toBe('system');
  });
  it('ignores public APIs', () => {
    expect(trackedPortal('/api/contact')).toBeNull();
    expect(trackedPortal('/api/careers/apply/')).toBeNull();
    expect(trackedPortal('/api/newsletter/subscribe')).toBeNull();
  });
});

suite('sensitive reads and sign-ins', () => {
  it('logs payroll reads and opening one employee record', () => {
    expect(isSensitiveGet('/api/admin/careers/payroll-slips/', new URLSearchParams())).toBe(true);
    expect(isSensitiveGet('/api/admin/careers/employees/', new URLSearchParams('id=abc'))).toBe(true);
    expect(isSensitiveGet('/api/admin/careers/employees/', new URLSearchParams())).toBe(false);
    expect(isSensitiveGet('/api/admin/products/', new URLSearchParams())).toBe(false);
  });
  it('treats the terrain login check as a sign-in', () => {
    expect(loginPortal('GET', '/api/terrain/login/')).toBe('terrain');
    expect(loginPortal('POST', '/api/terrain/login/')).toBeNull();
  });
});

suite('describe', () => {
  it('builds keys from the path', () => {
    expect(resourceKey('/api/admin/careers/payroll-slips/')).toBe('careers.payroll-slips');
    expect(resourceKey('/api/terrain/visits')).toBe('visits');
  });
  it('labels CRUD verbs', () => {
    expect(describe('POST', '/api/admin/careers/employees/', {}, 201)).toEqual({ action: 'admin.careers.employees.create', summary: 'Created employee' });
    expect(describe('DELETE', '/api/admin/hr-staff/', {}, 200).summary).toBe('Deleted HR portal access');
    expect(describe('PUT', '/api/terrain/tasks/', {}, 200).summary).toBe('Updated task');
  });
  it('uses the body action when present', () => {
    expect(describe('POST', '/api/admin/careers/payroll-slips/', { action: 'validate' }, 200))
      .toEqual({ action: 'admin.careers.payroll-slips.validate', summary: 'Validate — payslips' });
    expect(describe('PUT', '/api/admin/hr-staff/', { action: 'reset-password' }, 200).summary).toBe('Reset password — HR portal access');
  });
  it('labels refused attempts, sign-ins and password changes', () => {
    expect(describe('GET', '/api/admin/careers/payroll-slips/', {}, 403).summary).toBe('Access denied — payslips');
    expect(describe('POST', '/api/activity/session/', { portal: 'hr' }, 200).summary).toBe('Signed in');
    expect(describe('POST', '/api/hr/change-password/', {}, 200).summary).toBe('Changed own password');
  });
  it('strips unsafe characters from custom actions', () => {
    expect(describe('POST', '/api/admin/x/', { action: 'a.b;drop' }, 200).action).toBe('admin.x.abdrop');
  });
});

suite('pickSafe', () => {
  it('keeps only whitelisted keys', () => {
    const out = pickSafe({
      id: 'e1', employee_id: 'e2', status: 'active',
      password: 'secret', new_password: 'x', current_password: 'y', temp_password: 'z',
      access_token: 't', base_salary: 900000, bank_account: 'CI93…', portal_token: 'p',
    });
    expect(out).toEqual({ id: 'e1', employee_id: 'e2', status: 'active' });
  });
  it('truncates long strings and drops nested objects', () => {
    const out = pickSafe({ title: 'x'.repeat(500), ids: ['a', { deep: 1 }, 'b'], name: { nested: true } });
    expect(String(out.title).length).toBeLessThanOrEqual(161);
    expect(out.ids).toEqual(['a', '[object]', 'b']);
    expect(out).not.toHaveProperty('name');
  });
  it('handles non-objects', () => {
    expect(pickSafe(null)).toEqual({});
    expect(pickSafe([1, 2])).toEqual({});
    expect(pickSafe('text')).toEqual({});
  });
});

suite('entityIdFrom', () => {
  it('prefers id, then other identifiers', () => {
    expect(entityIdFrom({ id: 'a', employee_id: 'b' })).toBe('a');
    expect(entityIdFrom({ employee_id: 'b' })).toBe('b');
    expect(entityIdFrom({ slip_ids: ['s1', 's2'] })).toBe('s1,s2');
    expect(entityIdFrom({})).toBeNull();
  });
});

suite('jwtClaims', () => {
  const make = (payload: object) =>
    `x.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.y`;
  it('reads sub and email', () => {
    const sub = '0b9d6a8e-1c2f-4b5a-9e7d-123456789abc';
    expect(jwtClaims(make({ sub, email: 'HR@Example.com' }))).toEqual({ sub, email: 'hr@example.com' });
  });
  it('rejects malformed tokens and non-uuid subjects', () => {
    expect(jwtClaims(null)).toEqual({ sub: null, email: null });
    expect(jwtClaims('garbage')).toEqual({ sub: null, email: null });
    expect(jwtClaims(make({ sub: "'; drop table" })).sub).toBeNull();
  });
});
