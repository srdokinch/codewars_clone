import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-codewars-bg">
      <PageHeader compact />
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-codewars-accent">404</h1>
          <p className="mt-4 text-codewars-muted">ページが見つかりません</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-md bg-codewars-accent px-6 py-2 text-sm font-semibold text-codewars-on-accent hover:brightness-95"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
