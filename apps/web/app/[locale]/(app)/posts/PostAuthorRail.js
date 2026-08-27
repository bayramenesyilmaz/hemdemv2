import Link from "next/link";
import { Avatar } from "@/components/Avatar";

/**
 * Gönderi akışının en üstünde yatay kaydırmalı profil avatarı satırı
 * (Instagram Hikayeler benzeri). Akıştaki gönderi yazarlarını, en son
 * paylaşandan başlayarak tekilleştirip listeler.
 */
export function PostAuthorRail({ locale, entries, currentUserId, currentAuthor }) {
  const seen = new Set();
  const authors = [];

  if (currentUserId && currentAuthor) {
    seen.add(currentUserId);
    authors.push(currentAuthor);
  }

  for (const { author } of entries) {
    if (seen.has(author.id)) continue;
    seen.add(author.id);
    authors.push(author);
  }

  if (authors.length === 0) return null;

  return (
    <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0" style={{ scrollbarWidth: "none" }}>
      {authors.map((author) => (
        <Link
          key={author.id}
          href={`/${locale}/u/${author.id}`}
          className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-center"
        >
          <span className="rounded-full bg-gradient-primary p-[2px]">
            <Avatar src={author.avatarUrl} name={author.name} size="md" className="ring-2 ring-background" />
          </span>
          <span className="w-full truncate text-xs text-muted-foreground">{author.name}</span>
        </Link>
      ))}
    </div>
  );
}
