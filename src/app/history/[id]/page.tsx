import type { Metadata } from "next";
import { Suspense } from "react";
import { HistoryDetail } from "./history-detail";

export const metadata: Metadata = { title: "面試紀錄｜Interview Atelier" };

export default function HistoryDetailPage({ params }: PageProps<"/history/[id]">) {
  return (
    <Suspense fallback={<p className="py-24 text-center text-muted">載入中…</p>}>
      <Detail params={params} />
    </Suspense>
  );
}

async function Detail({ params }: { params: PageProps<"/history/[id]">["params"] }) {
  const { id } = await params;
  return <HistoryDetail id={id} />;
}
