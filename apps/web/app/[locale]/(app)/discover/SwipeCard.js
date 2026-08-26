"use client";

import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { calculateAge } from "@hemdem/core/domain/entities/user";
import { useI18n } from "@/locales/client";

const SWIPE_THRESHOLD = 120;

export function SwipeCard({ candidate, locale, isTop, onSwipe }) {
  const t = useI18n();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, -20], [1, 0]);

  const age = candidate.birthdate ? calculateAge(candidate.birthdate) : null;

  function handleDragEnd(_, info) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onSwipe("like");
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipe("dislike");
    }
  }

  return (
    <motion.div
      style={isTop ? { x, rotate } : undefined}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={isTop ? handleDragEnd : undefined}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex touch-none flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
    >
      <Link href={`/${locale}/u/${candidate.id}`} className="flex flex-1 flex-col">
        <div className="flex h-2/3 items-center justify-center bg-muted">
          {candidate.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={candidate.avatarUrl} alt="" className="h-full w-full object-cover" draggable={false} />
          ) : (
            <span className="text-6xl">🙂</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <p className="text-xl font-semibold text-foreground">
            {candidate.name}
            {age ? `, ${age}` : ""}
          </p>
          {candidate.country && <p className="text-sm text-muted-foreground">{candidate.country}</p>}
          {candidate.bio && <p className="line-clamp-2 text-sm text-foreground">{candidate.bio}</p>}
          {candidate.gateTestId && (
            <span className="mt-1 inline-block w-fit rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
              {t("discover.hasGateTest")}
            </span>
          )}
        </div>
      </Link>

      {isTop && (
        <>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="pointer-events-none absolute left-4 top-4 rounded border-2 border-primary px-3 py-1 text-lg font-bold text-primary"
          >
            {t("discover.like")}
          </motion.div>
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="pointer-events-none absolute right-4 top-4 rounded border-2 border-destructive px-3 py-1 text-lg font-bold text-destructive"
          >
            {t("discover.nope")}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
