/**
 * Audit log utility.
 *
 * Inserts a row into audit_logs for every significant admin action.
 * Fire-and-forget — never awaited in the calling route so it never
 * blocks or fails a response.
 *
 * Usage:
 *   writeAuditLog({
 *     actorId:    req.user!.id,
 *     actorRole:  req.user!.role,
 *     action:     'campus.create',
 *     targetType: 'campus',
 *     targetId:   campus.id,
 *     campusId:   campus.id,
 *     meta:       { name: campus.name },
 *     ip:         req.ip,
 *   });
 */

import { query } from '../../config/db';

export interface AuditLogInput {
  actorId:    string;
  actorRole:  string;
  action:     string;         // e.g. 'campus.create', 'user.suspend', 'post.takedown'
  targetType?: string;        // 'campus' | 'user' | 'post' | 'report' | 'platform'
  targetId?:  string;
  campusId?:  string | null;
  meta?:      Record<string, unknown>;
  ip?:        string | undefined;
}

export function writeAuditLog(input: AuditLogInput): void {
  // Intentionally not awaited — best-effort logging
  query(
    `INSERT INTO audit_logs
       (actor_id, actor_role, action, target_type, target_id,
        campus_id, meta, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      input.actorId,
      input.actorRole,
      input.action,
      input.targetType ?? null,
      input.targetId   ?? null,
      input.campusId   ?? null,
      input.meta ? JSON.stringify(input.meta) : null,
      input.ip         ?? null,
    ],
  ).catch((err: Error) => {
    console.error('[AuditLog] Failed to write audit log:', err.message);
  });
}