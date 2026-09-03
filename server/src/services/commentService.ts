import { Comment } from '../models/Comment';
import { Task } from '../models/Task';
import type { AuthPayload } from '../types/domain';
import { AppError } from '../utils/appError';
import { assertFound } from '../utils/scopedQuery';
import { requireString } from '../utils/validators';
import { canManageComment } from './permissionService';

const ensureTaskInOrganization = async (taskId: string, organizationId: string) => {
  const task = await Task.findOne({ _id: taskId, organizationId });

  if (!task) {
    throw new AppError('Task not found', 404);
  }
};

export const listComments = async (actor: AuthPayload, taskId: string) => {
  await ensureTaskInOrganization(taskId, actor.organizationId);
  return Comment.find({ organizationId: actor.organizationId, taskId }).sort({ createdAt: -1 });
};

export const createComment = async (
  actor: AuthPayload,
  taskId: string,
  payload: Record<string, unknown>,
) => {
  await ensureTaskInOrganization(taskId, actor.organizationId);
  const content = requireString(payload.content, 'Content');

  return Comment.create({
    organizationId: actor.organizationId,
    taskId,
    authorId: actor.userId,
    content,
  });
};

const getComment = async (actor: AuthPayload, taskId: string, commentId: string) => {
  await ensureTaskInOrganization(taskId, actor.organizationId);
  const comment = await Comment.findOne({
    _id: commentId,
    organizationId: actor.organizationId,
    taskId,
  });
  return assertFound(comment, 'Comment');
};

export const getCommentById = (actor: AuthPayload, taskId: string, commentId: string) => {
  return getComment(actor, taskId, commentId);
};

export const updateComment = async (
  actor: AuthPayload,
  taskId: string,
  commentId: string,
  payload: Record<string, unknown>,
) => {
  const comment = await getComment(actor, taskId, commentId);

  if (!canManageComment(actor, String(comment.authorId))) {
    throw new AppError('You do not have permission to update this comment', 403);
  }

  comment.content = requireString(payload.content, 'Content');

  await comment.save();
  return comment;
};

export const deleteComment = async (actor: AuthPayload, taskId: string, commentId: string) => {
  const comment = await getComment(actor, taskId, commentId);

  if (!canManageComment(actor, String(comment.authorId))) {
    throw new AppError('You do not have permission to delete this comment', 403);
  }

  await comment.deleteOne();
  return { deleted: true };
};
