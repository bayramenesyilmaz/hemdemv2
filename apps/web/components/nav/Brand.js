import Link from "next/link";

export function Brand({ locale, className = "" }) {
  return (
    <Link
      href={`/${locale}/discover`}
      className={`text-xl font-extrabold tracking-tight text-foreground ${className}`}
    >
      Hemdem<span className="text-primary">.</span>
    </Link>
  );
}
