import Head from "next/head";
import Navbar from "./navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Head>
        <meta name="description" content="EMBRACE YOUR OWN UNIQUE STYLE." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container flex h-screen w-screen flex-col px-0 font-sans">
        <Navbar />
        {children}
      </div>
    </>
  );
};
export default Layout;
