import Link from "next/link";

const version = process.env.NEXT_PUBLIC_APP_VERSION;
const aiProvider = process.env.NEXT_PUBLIC_AI_PROVIDER || "gemini";
const aiModel = process.env.NEXT_PUBLIC_AI_MODEL || "gemini-2.5-flash";

export default function Footer() {
  return (
    <footer className="py-8 px-6">
      <div className="mx-auto max-w-5xl border-t border-gray-200 pt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>
            Made by{" "}
            <Link
              className="text-charcoal hover:text-amber-accent transition-colors duration-200"
              href="https://luther.io"
            >
              Vid Luther
            </Link>{" "}
            + Claude &middot; 2026
          </p>
          <p className="text-center sm:text-right">
            Powered by {aiProvider} &middot; {aiModel}
            {version && <span className="ml-2">v{version}</span>}
          </p>
        </div>
      </div>
    </footer>
  );
}
