import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Layout from "~/components/layout";
import { Toaster } from "sonner";
import localFont from "next/font/local";
import { Inter, JetBrains_Mono } from "next/font/google";

const display = localFont({
  src: [
    {
      path: "../../public/fonts/NEOPIXEL-Regular.otf",
      weight: "400",
      style: "normal",
    },
  ],
});

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <style jsx global>{`
        :root {
          --font-display: ${display.style.fontFamily};
          --font-sans: ${sans.style.fontFamily};
          --font-mono: ${mono.style.fontFamily};
        }
      `}</style>
      <SessionProvider session={session}>
        <Layout>
          <Toaster richColors position="top-center" />
          <Component {...pageProps} />
        </Layout>
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
