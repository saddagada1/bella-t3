import type { NextPage } from "next";
import Head from "next/head";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormLink,
  FormMessage,
  FormTitle,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button, ButtonLoading } from "~/components/ui/button";
import OAuthButtons from "~/components/ui/oauth";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid Email" }),
  password: z
    .string({ required_error: "Required" })
    .min(1, { message: "Required" }),
});

const LoginForm: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    if (router.query.error) {
      if (router.query.error === "OAuthAccountNotLinked") {
        toast.error("Error: Please Login With The Correct Provider");
      } else {
        toast.error(`Error: ${router.query.error as string}`);
      }
    }
  }, [router.query.error]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const response = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });
    if (response?.ok) {
      void router.push("/");
    } else {
      form.setError("email", {
        type: "manual",
        message: response?.error as string | undefined,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 text-right"
      >
        <FormTitle className="font-mono">Login</FormTitle>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Email</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Input placeholder="bella@acme.ca" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Password</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Input placeholder="********" {...field} type="password" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormLink>Forgot Password?</FormLink>
        {form.formState.isSubmitting ? (
          <ButtonLoading variant="form" size="form" type="submit" />
        ) : (
          <Button variant="form" size="form">
            Login
          </Button>
        )}
      </form>
    </Form>
  );
};

const Login: NextPage = ({}) => {
  return (
    <>
      <Head>
        <title>Bella - Login</title>
      </Head>
      <main className="flex flex-1 flex-col justify-center px-6 text-center">
        <LoginForm />
        <OAuthButtons />
        <FormLink href="/sign-up">
          Don&apos;t have an account? Sign Up!
        </FormLink>
      </main>
    </>
  );
};

export default Login;
