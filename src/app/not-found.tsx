import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold text-gray-800">404 – ページが見つかりません</h1>
      <Link href="/" className="text-indigo-600 hover:underline">
        ケースボードに戻る
      </Link>
    </div>
  );
}
