import { PrismaClient, Prisma } from '@prisma/client';
import { ForbiddenError } from '../../../../shared/errors/ForbiddenError';

export type BatchScopedRole = 'Tutor' | 'Placement Officer' | 'Quality Analyst';

export function isBatchScopedRole(role: string | undefined): role is BatchScopedRole {
  return role === 'Tutor' || role === 'Placement Officer' || role === 'Quality Analyst';
}

export async function getAssignedStudentIdsForStaff(
  prisma: PrismaClient,
  userId: number,
  role: BatchScopedRole,
): Promise<number[]> {
  const batchWhere: Prisma.program_section_batchesWhereInput = {};
  if (role === 'Tutor') {
    batchWhere.tutor_id = BigInt(userId);
  } else if (role === 'Placement Officer') {
    batchWhere.placement_officer_id = BigInt(userId);
  } else {
    batchWhere.qa_id = BigInt(userId);
  }

  const batches = await prisma.program_section_batches.findMany({
    where: batchWhere,
    select: { id: true },
  });

  if (batches.length === 0) {
    return [];
  }

  const sections = await prisma.student_sections.findMany({
    where: { batch_id: { in: batches.map((b) => b.id) }, status: { notIn: ['Deleted', 'deleted'] } },
    select: { student_id: true },
  });

  return [...new Set(sections.map((s) => Number(s.student_id)))];
}

export async function getStudentIdsCreatedByUser(
  prisma: PrismaClient,
  userId: number,
): Promise<number[]> {
  const students = await prisma.students.findMany({
    where: { created_by: BigInt(userId) },
    select: { id: true },
  });

  return students.map((s) => Number(s.id));
}

export function enforceRequestedStudentScope(
  allowedStudentIds: number[],
  requestedStudentId: number | undefined,
): number[] {
  if (allowedStudentIds.length === 0) {
    if (requestedStudentId !== undefined) {
      throw new ForbiddenError('Unauthorized for requested student');
    }
    return [];
  }

  if (requestedStudentId !== undefined) {
    if (!allowedStudentIds.includes(requestedStudentId)) {
      throw new ForbiddenError('Unauthorized for requested student');
    }
    return [requestedStudentId];
  }

  return allowedStudentIds;
}

