import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agora — Philosophy in Conversation",
  description: "Engage the great philosophers of history in dialogue. Ask questions, explore ideas, and think together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
