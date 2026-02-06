import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoldGoals - Social Gold Savings",
  description: "Create public savings goals in gold, challenge friends, and gift gold to support each other's progress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
