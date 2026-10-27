'use client';
/* eslint-disable @next/next/no-img-element -- Blog image URLs are managed by the backend media service. */

import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Heart,
  MessageCircle,
  SendHorizontal,
  Trash2,
} from 'lucide-react';
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
    <section className="mx-auto mt-5 max-w-6xl px-4 pb-12 sm:px-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-brand"
      >
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
        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-muted-foreground">
          {post.excerpt}
        </p>
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
    <article className="mx-auto mt-5 max-w-3xl px-4 pb-12 sm:px-6">
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
  const lines = value.replace(/\r/g, '').split('\n');
  const blocks: React.ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }
    if (
      index + 1 < lines.length &&
      /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(lines[index + 1].trim())
    ) {
      const cells = (row: string) =>
        row
          .trim()
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((cell) => cell.trim());
      const headers = cells(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        rows.push(cells(lines[index]));
        index += 1;
      }
      blocks.push(
        <div key={`table-${index}`} className="my-6 overflow-x-auto rounded-xl border">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-muted">
              <tr>
                {headers.map((cell, cellIndex) => (
                  <th key={cellIndex} className="border px-3 py-2 font-semibold">
                    {inline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((_, cellIndex) => (
                    <td key={cellIndex} className="border px-3 py-2">
                      {inline(row[cellIndex] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      blocks.push(
        heading[1].length === 3 ? (
          <h3 key={index} className="mt-7 text-xl font-semibold">
            {inline(heading[2])}
          </h3>
        ) : (
          <h2 key={index} className="mt-8 text-2xl font-bold">
            {inline(heading[2])}
          </h2>
        ),
      );
      index += 1;
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      const src = safeBlogUrl(image[2]);
      if (src) {
        blocks.push(
          <figure key={index} className="my-6 overflow-hidden rounded-xl bg-muted">
            <img src={src} alt={image[1]} className="max-h-[440px] w-full object-cover" />
            {image[1] ? (
              <figcaption className="px-3 py-2 text-xs text-muted-foreground">
                {image[1]}
              </figcaption>
            ) : null}
          </figure>,
        );
      }
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quote.push(lines[index++].trim().replace(/^>\s?/, ''));
      }
      blocks.push(
        <blockquote
          key={`quote-${index}`}
          className="border-l-4 border-brand/40 bg-brand/5 px-4 py-3 italic"
        >
          {quote.map((item, quoteIndex) => (
            <p key={quoteIndex}>{inline(item)}</p>
          ))}
        </blockquote>,
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index++].trim().replace(/^[-*]\s+/, ''));
      }
      blocks.push(
        <ul key={`list-${index}`} className="list-disc space-y-1 pl-6">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{inline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+[.)]\s+/.test(lines[index].trim())) {
        items.push(lines[index++].trim().replace(/^\d+[.)]\s+/, ''));
      }
      blocks.push(
        <ol key={`ordered-${index}`} className="list-decimal space-y-1 pl-6">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{inline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,3}\s|>\s?|[-*]\s+|\d+[.)]\s+|!\[)/.test(lines[index].trim())
    ) {
      paragraph.push(lines[index++].trim());
    }
    blocks.push(<p key={`paragraph-${index}`}>{inline(paragraph.join(' '))}</p>);
  }

  return <div className="mt-8 space-y-4 text-[15px] leading-7 text-foreground">{blocks}</div>;
}
function inline(line: string): React.ReactNode[] {
  const parts = line
    .split(
      /(@\[youtube\]\([^)]+\)|<u>[^<]*<\/u>|<sub>[^<]*<\/sub>|<sup>[^<]*<\/sup>|!\[[^\]]*\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g,
    )
    .filter(Boolean);
  return parts.map((part, index) => {
    const video = part.match(/^@\[youtube\]\(([^)]+)\)$/);
    if (video) {
      const videoId = youtubeVideoId(video[1]);
      return videoId ? (
        <span
          key={index}
          className="my-5 block aspect-video w-full overflow-hidden rounded-xl bg-black"
        >
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            title="YouTube video"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="size-full border-0"
          />
        </span>
      ) : null;
    }
    const image = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      const src = safeBlogUrl(image[2]);
      return src ? (
        <img
          key={index}
          src={src}
          alt={image[1]}
          className="my-5 block max-h-[440px] w-full rounded-xl object-cover"
        />
      ) : null;
    }
    const markup = part.match(/^<(u|sub|sup)>(.*?)<\/\1>$/);
    if (markup) {
      if (markup[1] === 'u') return <u key={index}>{markup[2]}</u>;
      if (markup[1] === 'sub') return <sub key={index}>{markup[2]}</sub>;
      return <sup key={index}>{markup[2]}</sup>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = safeBlogUrl(link[2]);
      return href ? (
        <a
          key={index}
          href={href}
          target={href.startsWith('/') ? undefined : '_blank'}
          rel={href.startsWith('/') ? undefined : 'noopener noreferrer'}
          className="text-brand underline underline-offset-2"
        >
          {link[1]}
        </a>
      ) : (
        <span key={index}>{link[1]}</span>
      );
    }
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`'))
      return (
        <code key={index} className="rounded bg-muted px-1.5 py-0.5 text-[.9em]">
          {part.slice(1, -1)}
        </code>
      );
    return part;
  });
}
function youtubeVideoId(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    const host = url.hostname.toLowerCase();
    let id: string | null = null;
    if (host === 'youtu.be' || host === 'www.youtu.be') {
      id = url.pathname.split('/').filter(Boolean)[0] ?? null;
    } else if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)) {
      id =
        url.pathname === '/watch'
          ? url.searchParams.get('v')
          : (url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ?? null);
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}
function safeBlogUrl(value: string): string | null {
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}
function initials(name: string): string {
  return name.replace(/\s+/g, '').slice(0, 2).toUpperCase() || 'PL';
}
function shortDate(value: string): string {
  return new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

function shortTime(value: string): string {
  return formatMeridiem(
    new Date(value).toLocaleTimeString('en-NG', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  );
}
function longDate(value: string): string {
  return formatMeridiem(
    new Date(value).toLocaleString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }),
  );
}

function formatMeridiem(value: string): string {
  return value.replace(/\b(am|pm)\b/gi, (meridiem) => meridiem.toUpperCase());
}
