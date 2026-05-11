import CodePageClient from './CodePageClient';

export function generateStaticParams() {
  const levels = [
    ...Array.from({ length: 15 }, (_, i) => ({ levelId: String(i + 1) })),
    ...[101, 102, 103, 104, 105].map((id) => ({ levelId: String(id) })),
  ];
  return levels;
}

export default function CodePage() {
  return <CodePageClient />;
}
