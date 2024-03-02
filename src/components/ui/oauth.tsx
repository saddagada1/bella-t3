import { signIn } from "next-auth/react";
import { Button } from "./button";
import { Icons } from "./icons";

const OAuthButtons: React.FC = ({}) => {
  return (
    <div className="relative my-8 flex w-full max-w-[600px] justify-center border-t border-input pt-8">
      <p className="absolute top-0 -translate-y-1/2 bg-background px-2 font-mono text-xs uppercase text-muted-foreground">
        Or Continue With
      </p>
      <Button
        onClick={() =>
          void signIn("google", {
            redirect: false,
            emailVerified: true,
            callbackUrl: "/",
          })
        }
        variant="outline"
        className="w-full"
      >
        <Icons.google className="mr-2 h-4 w-4" /> Continue With Google
      </Button>
    </div>
  );
};

export default OAuthButtons;
