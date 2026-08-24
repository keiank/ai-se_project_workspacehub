import { useState, type FormEvent } from 'react';
import { commentService } from '../services/commentService';
import type { Comment, User } from '../types/models';

interface TaskCommentsProps {
  taskId: string;
  commentCount: number;
  users: User[];
}

export const TaskComments = ({ taskId, commentCount, users }: TaskCommentsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState('');

  const handleToggle = async () => {
    const shouldExpand = !isExpanded;
    setIsExpanded(shouldExpand);

    if (!shouldExpand || hasLoaded || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setComments(await commentService.list(taskId));
      setHasLoaded(true);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    setError(null);

    try {
      const newComment = await commentService.create(taskId, { content: trimmedContent });
      setComments((current) => [newComment, ...current]);
      setContent('');
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to add comment');
    }
  };

  return (
    <>
      <button
        className="ml-auto rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => void handleToggle()}
        type="button"
      >
        {isExpanded ? 'Hide Comments' : `Show Comments (${commentCount})`}
      </button>
      {isExpanded ? (
        <section className="mt-4 basis-full space-y-4 rounded-2xl border border-slate-200 p-4">
          {isLoading ? <p className="text-sm text-slate-600">Loading comments...</p> : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {!isLoading ? (
            <>
              <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-slate-300 placeholder:text-[#94A3B880]"
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Write a comment"
                  value={content}
                />
                <button
                  className="rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!content.trim()}
                  type="submit"
                >
                  Add comment
                </button>
              </form>
              <ul className="mt-5 space-y-3">
                {comments.map((comment) => {
                  const author = users.find((user) => user._id === comment.authorId);
                  const authorName = author
                    ? `${author.firstName} ${author.lastName}`
                    : 'Unknown user';

                  return (
                    <li
                      className="border-t border-slate-100 pt-3 first:border-t-0 first:pt-0"
                      key={comment._id}
                    >
                      <p className="text-sm font-semibold text-ink">{authorName}</p>
                      <p className="mt-1 text-sm text-slate-600">{comment.content}</p>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
        </section>
      ) : null}
    </>
  );
};
