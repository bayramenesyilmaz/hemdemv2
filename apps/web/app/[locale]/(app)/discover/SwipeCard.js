"use client";

import Image from "next/image";
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
      className="absolute inset-0 flex touch-none flex-col overflow-hidden bg-muted lg:rounded-3xl lg:border lg:border-border lg:shadow-float"
    >
      <Link href={`/${locale}/u/${candidate.id}`} className="relative flex flex-1 flex-col">
        {candidate.avatarUrl ? (
          <Image
            src={candidate.avatarUrl}
            alt=""
            fill
            draggable={false}
            unoptimized={candidate.avatarUrl.startsWith("data:")}
            className="object-cover"
          />
        ) : (
          <span className="flex flex-1 items-center justify-center text-6xl">🙂</span>
        )}

        {/* Fotoğraf tam ekranı kaplıyor; bilgiler ayrı bir panel yerine
            altta koyulaşan bir gradyanın üzerine bindiriliyor (modern
            tam-ekran uygulamalarda alışılan görünüm). */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
        />
        {/* pb-28: altta kayan sabit like/dislike/süper mesaj çubuğunun
            altına gizlenmesin diye metne fazladan boşluk. */}
        <div className="relative mt-auto flex flex-col gap-1.5 p-5 pb-28 text-white">
          <p className="text-2xl font-bold drop-shadow-sm">
            {candidate.name}
            {age ? `, ${age}` : ""}
          </p>
          {candidate.country && <p className="text-sm text-white/80">{candidate.country}</p>}
          {candidate.bio && <p className="line-clamp-2 text-sm text-white/90">{candidate.bio}</p>}
          {candidate.gateTestId && (
            <span className="mt-1 inline-block w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {t("discover.hasGateTest")}
            </span>
          )}
        </div>
      </Link>

      {isTop && (
        <>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="pointer-events-none absolute left-4 top-4 rotate-[-12deg] rounded-2xl border-2 border-primary bg-background/80 px-4 py-1.5 text-lg font-bold uppercase tracking-wide text-primary shadow-card backdrop-blur-sm"
          >
            {t("discover.like")}
          </motion.div>
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="pointer-events-none absolute right-4 top-4 rotate-[12deg] rounded-2xl border-2 border-destructive bg-background/80 px-4 py-1.5 text-lg font-bold uppercase tracking-wide text-destructive shadow-card backdrop-blur-sm"
          >
            {t("discover.nope")}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
