import type { Project, Task } from "./models";
import type { ProjectWithTaskCount } from "./views";
import { buildProjectWithTaskCount } from "../utils/projectMetrics";

const organizationId = "org-001";
const projectId = "project-001";

export const exampleProject: Project = {
  _id: projectId,
  organizationId,
  name: "Website Redesign",
  description: "Refresh the marketing site and improve conversion flow.",
  createdBy: "user-001",
  createdAt: "2025-01-15T09:30:00.000Z",
  updatedAt: "2025-01-16T11:15:00.000Z",
};

export const exampleTask: Task = {
  _id: "task-001",
  organizationId,
  projectId: exampleProject._id,
  title: "Define homepage content hierarchy",
  description: "Outline the new homepage sections and CTA priorities.",
  status: "todo",
  priority: "high",
  assignedTo: "user-002",
  dueDate: "2025-01-24T17:00:00.000Z",
  createdAt: "2025-01-16T10:00:00.000Z",
  updatedAt: "2025-01-16T10:00:00.000Z",
};

const exampleTasks: Task[] = [
  exampleTask,
  {
    _id: "task-002",
    organizationId,
    projectId: "project-002",
    title: "Prepare wireframes for mobile view",
    description: "Create mobile-friendly wireframes for the revised landing page.",
    status: "in_progress",
    priority: "medium",
    assignedTo: "user-003",
    dueDate: "2025-01-28T15:00:00.000Z",
    createdAt: "2025-01-16T10:30:00.000Z",
    updatedAt: "2025-01-17T09:45:00.000Z",
  },
];

export const exampleProjectWithTaskCount: ProjectWithTaskCount = buildProjectWithTaskCount(
  exampleProject,
  exampleTasks,
);
