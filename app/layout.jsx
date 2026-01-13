import "./globals.css";

export const metadata = {
  title: "Fertilizer Programs Offline",
  description: "Offline program manager for fertilizer recipes.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#efe8d8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#efe8d8" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
