import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Habuild Call Audit | QC Audit Entry",
  description: "Quick call audit entry form for Habuild Yoga calling team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
