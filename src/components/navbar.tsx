import { Button } from "./ui/button";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

const Navbar: React.FC = () => {
  const { status: sessionStatus } = useSession();
  return (
    <nav className="grid grid-cols-4 p-4">
      <div className="flex">
        <Button variant="outline">Menu</Button>
      </div>
      <h1
        onClick={() => void signOut()}
        className="font-display col-span-2 col-start-2 text-center text-4xl"
      >
        bella
      </h1>
      <div className="flex justify-end">
        {sessionStatus === "loading" ? null : sessionStatus ===
          "unauthenticated" ? (
          <Button asChild variant="outline">
            <Link href="/login">Login</Link>
          </Button>
        ) : (
          <Button variant="outline">Bag(0)</Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
