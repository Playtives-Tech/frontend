'use client';

import { ArrowLeft, ArrowRight, Eye, Heart, MessageCircle, SendHorizontal, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { type FormEvent, useEffect, useState } from 'react';
import { notify } from '@/lib/notify';
import {
  blogService,
  type BlogComment,
  type BlogPage,
  type BlogPost,
} from '@/lib/services/blog-service';
import { useAuthStore } from '@/stores/use-auth-store';

export function BlogIndex(): React.JSX.Element {
  const [data, setData] = useState<BlogPage | null>(null);
  const [page, setPage] = useState(1);
  useEffect(() => {
    void blogService.list(page).then(setData);
  }, [page]);
  if (!data)
    return <p className="py-16 text-center text-sm text-muted-foreground">Loading articles…</p>;
  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 mt-5">
      <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-brand">
        <ArrowLeft className="size-4" />
        Back to home
      </Link>
      <header className="mb-8 rounded-2xl bg-brand px-6 py-8 text-brand-foreground sm:px-8">
        <h1 className="mt-2 text-2xl font-bold sm:text-4xl">
          Insights for better ownership decisions.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-foreground/80">
          Practical guides, market context, and updates for your investment journey.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {data.items.map((post) => (
          <ArticleCard key={post._id} post={post} />
        ))}
      </div>
      <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
    </section>
  );
}

function ArticleCard({ post }: Readonly<{ post: BlogPost }>): React.JSX.Element {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group overflow-hidden rounded-xl border bg-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-[16/9] bg-muted">
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt={post.coverImageAlt ?? ''}
            className="size-full object-cover"
          />
        ) : null}
      </div>
      <div className="p-4 sm:p-4">
        {/* <p className="text-xs font-bold uppercase tracking-wide text-brand">
          {post.category ?? post.tags[0] ?? 'Playtives'}
        </p> */}
        <h2 className="line-clamp-2 text-[15px] font-bold leading-6 group-hover:text-brand">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-muted-foreground">{post.excerpt}</p>
        <div className="mt-3 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
          <span>
            {shortDate(post.publishedAt)} · {shortTime(post.publishedAt)}
          </span>
          <span className="flex gap-3">
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              {post.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="size-3" />
              {post.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="size-3" />
              {post.commentCount}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: Readonly<{
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}>): React.JSX.Element {
  if (totalPages <= 1) return <></>;
  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="rounded-lg border p-2 disabled:opacity-40"
        aria-label="Previous articles"
      >
        <ArrowLeft className="size-4" />
      </button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="rounded-lg border p-2 disabled:opacity-40"
        aria-label="Next articles"
      >
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

export function ArticleDetail({ slug }: Readonly<{ slug: string }>): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(false);
  useEffect(() => {
    void Promise.all([blogService.get(slug), blogService.comments(slug)]).then(
      ([article, discussion]) => {
        setPost(article);
        setComments(discussion.items);
      },
    );

    const viewKey = `playtives-blog-viewed:${slug}`;
    if (!window.sessionStorage.getItem(viewKey)) {
      window.sessionStorage.setItem(viewKey, 'true');
      void blogService.recordView(slug);
    }
  }, [slug]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = comment.trim();
    if (!body) return;
    void blogService
      .comment(slug, body)
      .then((created) => {
        setComments((items) => [created, ...items]);
        setComment('');
        notify.success('Comment published');
      })
      .catch((error: unknown) =>
        notify.error(error instanceof Error ? error.message : 'Sign in to comment'),
      );
  };
  const remove = (id: string) => {
    void blogService
      .removeComment(slug, id)
      .then(() => {
        setComments((items) => items.filter((item) => item._id !== id));
        notify.success('Comment deleted');
      })
      .catch((error: unknown) =>
        notify.error(error instanceof Error ? error.message : 'Could not delete comment'),
      );
  };
  if (!post)
    return <p className="py-16 text-center text-sm text-muted-foreground">Loading article…</p>;
  return (
    <article className="mx-auto max-w-3xl px-4 pb-12 sm:px-6 mt-5">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand"
      >
        <ArrowLeft className="size-4" />
        All articles
      </Link>
      <div className="mt-7 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand"
          >
            {tag}
          </span>
        ))}
      </div>
      <h1 className="mt-4 text-2xl font-bold leading-tight sm:text-3xl">{post.title}</h1>
      <p className="mt-3 text-base leading-7 text-muted-foreground">{post.excerpt}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>By {post.authorName}</span>
        <span>{longDate(post.publishedAt)}</span>
        <span className="flex items-center gap-1">
          <Eye className="size-3.5" />
          {post.viewCount}
        </span>
      </div>
      {post.coverImageUrl ? (
        <img
          src={post.coverImageUrl}
          alt={post.coverImageAlt ?? ''}
          className="mt-7 aspect-[16/9] w-full rounded-2xl object-cover"
        />
      ) : null}
      <MarkdownContent value={post.content} />
      <button
        onClick={() =>
          void blogService.like(slug).then((result) => {
            setLiked(result.liked);
            setPost({ ...post, likeCount: result.likeCount });
          })
        }
        className={`mt-8 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${liked ? 'border-brand bg-brand/10 text-brand' : ''}`}
      >
        <Heart className="size-4" fill={liked ? 'currentColor' : 'none'} />
        {post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}
      </button>
      <section className="mt-10 border-t pt-8">
        <h2 className="text-2xl font-bold">Discussion</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Join the conversation with other Playtives members.
        </p>
        <form onSubmit={submit} className="mt-5">
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Share a thoughtful comment"
            className="h-28 w-full rounded-xl border bg-background p-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
            <button className="mt-3 inline-flex items-center gap-2 rounded-[5px] bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground">
              Post comment
              <SendHorizontal className="size-4" />
            </button>
        </form>
        <div className="mt-7 grid gap-3">
          {comments.map((item) => (
            <CommentCard
              key={item._id}
              item={item}
              canDelete={item.userId === user?.id}
              onDelete={remove}
            />
          ))}
          {comments.length === 0 ? (
            <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
              Be the first to start the discussion.
            </p>
          ) : null}
        </div>
      </section>
    </article>
  );
}

function CommentCard({
  item,
  canDelete,
  onDelete,
}: Readonly<{
  item: BlogComment;
  canDelete: boolean;
  onDelete: (id: string) => void;
}>): React.JSX.Element {
  return (
    <article className="flex gap-3 rounded-xl border bg-background p-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/10 text-xs font-bold text-brand">
        {initials(item.authorName)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{item.authorName}</p>
            <time className="text-xs text-muted-foreground" dateTime={item.createdAt}>
              {longDate(item.createdAt)}
            </time>
          </div>
          {canDelete ? (
            <button
              type="button"
              onClick={() => onDelete(item._id)}
              className="hover:bg-destructive/10 hover:text-destructive rounded-lg p-2 text-muted-foreground"
              aria-label="Delete your comment"
            >
              <Trash2 className="size-4" />
            </button>
          ) : null}
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
          {item.body}
        </p>
      </div>
    </article>
  );
}

function MarkdownContent({ value }: Readonly<{ value: string }>): React.JSX.Element {
  return (
    <div className="mt-8 space-y-4 text-[15px] leading-7 text-foreground">
      {value.split('\n').map((line, index) => {
        if (line.startsWith('## '))
          return (
            <h2 key={index} className="mt-8 text-2xl font-bold">
              {line.slice(3)}
            </h2>
          );
        if (line.startsWith('- '))
          return (
            <p key={index} className="pl-5 before:mr-2 before:content-['•']">
              {inline(line.slice(2))}
            </p>
          );
        if (line.startsWith('> '))
          return (
            <blockquote
              key={index}
              className="border-l-4 border-brand/40 bg-brand/5 px-4 py-3 italic"
            >
              {inline(line.slice(2))}
            </blockquote>
          );
        if (!line.trim()) return <div key={index} className="h-2" />;
        return <p key={index}>{inline(line)}</p>;
      })}
    </div>
  );
}
function inline(line: string): React.ReactNode[] {
  return line
    .split(/(\*\*[^*]+\*\*)/)
    .map((part, index) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={index}>{part.slice(2, -2)}</strong>
      ) : (
        part
      ),
    );
}
function initials(name: string): string {
  return name.replace(/\s+/g, '').slice(0, 2).toUpperCase() || 'PL';
}
function shortDate(value: string): string {
  return new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

function shortTime(value: string): string {
  return formatMeridiem(new Date(value).toLocaleTimeString('en-NG', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }));
}
function longDate(value: string): string {
  return formatMeridiem(new Date(value).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }));
}

function formatMeridiem(value: string): string {
  return value.replace(/\b(am|pm)\b/gi, (meridiem) => meridiem.toUpperCase());
}
