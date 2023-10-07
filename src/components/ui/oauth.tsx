import { signIn } from "next-auth/react";
import { Button } from "./button";
import { Icons } from "./icons";

const OAuthButtons: React.FC = ({}) => {
  return (
    <div className="relative my-8 flex w-full justify-center gap-2 border-t pt-8">
      <p className="absolute top-0 -translate-y-1/2 bg-background px-2 text-xs uppercase text-muted-foreground">
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
        <Icons.google className="mr-2 h-4 w-4" /> Google
      </Button>
      <Button
        onClick={() =>
          void signIn("facebook", {
            redirect: false,
            emailVerified: true,
            callbackUrl: "/",
          })
        }
        variant="outline"
        className="w-full"
      >
        <Icons.facebook className="mr-2 h-4 w-4" /> Facebook
      </Button>
    </div>
  );
};

export default OAuthButtons;
