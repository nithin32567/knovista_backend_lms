export interface RolePermissionsOutput {
  role: string;
  permissions: string[];
}

export class GetRolePermissionsUseCase {
  async execute(roleName: string): Promise<RolePermissionsOutput> {
    const permissions = this.resolvePermissions(roleName);
    return {
      role: roleName,
      permissions,
    };
  }

  private resolvePermissions(roleName: string): string[] {
    const normalizedRole = roleName.trim().toLowerCase();

    const allForms = [
      'interns',
      'programs',
      'sections',
      'batches',
      'tickets',
      'report',
      'module-unlock-requests',
      'certificates',
      'placement-company',
      'fee-collection',
      'cv',
      'posters',
      'special-category',
      'addoncourses',
      'extension',
      'users',
    ];

    if (normalizedRole === 'admin') {
      const perms: string[] = [];
      for (const form of allForms) {
        perms.push(`${form}.view`, `${form}.create`, `${form}.edit`, `${form}.delete`);
        if (form === 'tickets' || form === 'batches' || form === 'fee-collection') {
          perms.push(`${form}.reply`, `${form}.assign`);
        }
        if (form === 'placement-company') {
          perms.push(`${form}.placement`);
        }
      }
      return perms;
    }

    if (normalizedRole === 'team lead') {
      return [
        'interns.view', 'interns.create', 'interns.edit',
        'programs.view', 'programs.create', 'programs.edit',
        'sections.view', 'sections.create', 'sections.edit',
        'batches.view', 'batches.create', 'batches.edit', 'batches.assign', 'batches.reply',
        'tickets.view', 'tickets.edit', 'tickets.reply', 'tickets.assign',
        'report.view', 'report.create', 'report.edit',
        'module-unlock-requests.view', 'module-unlock-requests.create', 'module-unlock-requests.edit',
        'certificates.view', 'certificates.create',
        'placement-company.view',
        'cv.view',
        'posters.view',
        'extension.view', 'extension.create', 'extension.edit',
      ];
    }

    if (normalizedRole === 'tutor') {
      return [
        'interns.view',
        'programs.view',
        'sections.view',
        'batches.view', 'batches.edit', 'batches.reply',
        'tickets.view', 'tickets.reply',
        'report.view', 'report.create', 'report.edit',
        'module-unlock-requests.view', 'module-unlock-requests.edit',
        'cv.view',
        'addoncourses.view',
        'extension.view',
      ];
    }

    if (normalizedRole === 'quality analyst') {
      return [
        'interns.view',
        'programs.view',
        'sections.view',
        'batches.view',
        'tickets.view', 'tickets.reply',
        'report.view', 'report.create', 'report.edit',
        'module-unlock-requests.view', 'module-unlock-requests.edit',
        'certificates.view',
        'extension.view',
      ];
    }

    if (normalizedRole === 'placement officer') {
      return [
        'interns.view',
        'batches.view',
        'placement-company.view', 'placement-company.create', 'placement-company.edit', 'placement-company.delete', 'placement-company.placement',
        'cv.view', 'cv.create', 'cv.edit', 'cv.delete',
        'certificates.view', 'certificates.create', 'certificates.edit',
        'tickets.view', 'tickets.reply',
      ];
    }

    if (normalizedRole === 'sales analyst') {
      return [
        'interns.view', 'interns.create', 'interns.edit',
        'fee-collection.view', 'fee-collection.create', 'fee-collection.reply',
        'programs.view',
        'batches.view',
        'tickets.view', 'tickets.create',
      ];
    }

    return [
      'interns.view',
      'programs.view',
      'sections.view',
      'batches.view',
      'tickets.view', 'tickets.create',
      'report.view',
    ];
  }
}

