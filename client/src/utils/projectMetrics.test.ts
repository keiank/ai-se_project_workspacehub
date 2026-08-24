import { describe, it, expect } from 'vitest';
import { buildProjectWithTaskCount } from './projectMetrics';
import type { Project, Task } from '../types/models';
import type { ProjectWithTaskCount } from '../types/views';

describe('buildProjectWithTaskCount', () => {
  it('returns taskCount 0 when no tasks are provided', () => {
    const project: Project = {
      _id: 'proj-1',
      organizationId: 'org-1',
      name: 'Project One',
      description: 'desc',
      createdBy: 'user-1',
      createdAt: '2020-01-01T00:00:00.000Z',
      updatedAt: '2020-01-01T00:00:00.000Z',
    };

    const tasks: Task[] = [];

    const result: ProjectWithTaskCount = buildProjectWithTaskCount(project, tasks);

    expect(result).toEqual({
      ...project,
      taskCount: 0,
    });
  });

  it('returns correct taskCount when tasks match the project', () => {
    const project: Project = {
      _id: 'proj-2',
      organizationId: 'org-1',
      name: 'Project Two',
      description: 'desc',
      createdBy: 'user-1',
      createdAt: '2020-01-01T00:00:00.000Z',
      updatedAt: '2020-01-01T00:00:00.000Z',
    };

    const tasks: Task[] = [
      {
        _id: 't-1',
        organizationId: 'org-1',
        projectId: 'proj-2',
        title: 'Task 1',
        description: 'd',
        status: 'todo',
        priority: 'low',
        assignedTo: null,
        dueDate: null,
        createdAt: '2020-01-01T00:00:00.000Z',
        updatedAt: '2020-01-01T00:00:00.000Z',
      },
      {
        _id: 't-2',
        organizationId: 'org-1',
        projectId: 'proj-2',
        title: 'Task 2',
        description: 'd',
        status: 'todo',
        priority: 'medium',
        assignedTo: null,
        dueDate: null,
        createdAt: '2020-01-01T00:00:00.000Z',
        updatedAt: '2020-01-01T00:00:00.000Z',
      },
      {
        _id: 't-3',
        organizationId: 'org-1',
        projectId: 'other-project',
        title: 'Task 3',
        description: 'd',
        status: 'todo',
        priority: 'high',
        assignedTo: null,
        dueDate: null,
        createdAt: '2020-01-01T00:00:00.000Z',
        updatedAt: '2020-01-01T00:00:00.000Z',
      },
    ];

    const result: ProjectWithTaskCount = buildProjectWithTaskCount(project, tasks);

    expect(result).toEqual({
      ...project,
      taskCount: 2,
    });
  });

  it('returns taskCount 0 when tasks exist but none match the project', () => {
    const project: Project = {
      _id: 'proj-3',
      organizationId: 'org-1',
      name: 'Project Three',
      description: 'desc',
      createdBy: 'user-1',
      createdAt: '2020-01-01T00:00:00.000Z',
      updatedAt: '2020-01-01T00:00:00.000Z',
    };

    const tasks: Task[] = [
      {
        _id: 't-4',
        organizationId: 'org-1',
        projectId: 'other-project-1',
        title: 'Task 4',
        description: 'd',
        status: 'todo',
        priority: 'low',
        assignedTo: null,
        dueDate: null,
        createdAt: '2020-01-01T00:00:00.000Z',
        updatedAt: '2020-01-01T00:00:00.000Z',
      },
    ];

    const result: ProjectWithTaskCount = buildProjectWithTaskCount(project, tasks);

    expect(result).toEqual({
      ...project,
      taskCount: 0,
    });
  });
});
