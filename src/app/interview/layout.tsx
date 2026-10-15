import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "模擬面試｜Interview Atelier",
};

export default function InterviewLayout({ children }: LayoutProps<"/interview">) {
  return children;
}
