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
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { TRPCClientError } from "@trpc/client";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

const formSchema = z
  .object({
    email: z.string().email({ message: "Invalid Email" }),
    password: z.string().min(8, { message: "Min 8 Chars Required" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Does Not Match",
    path: ["confirmPassword"],
  });

const SignUpForm: React.FC = () => {
  const { mutateAsync: signUp } = api.credentials.signUp.useMutation();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await signUp({
        email: values.email,
        password: values.password,
      });
      if (!response.user) {
        form.setError("email", {
          type: "manual",
          message: response.error.message,
        });
        return;
      }
      await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });
      void router.replace("/");
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(`Error: ${error.message}`);
      }
      return;
    }
  };

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-[600px] space-y-8"
      >
        <FormTitle>Sign Up</FormTitle>
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
                <Input placeholder="bella@acme.ca" {...field} type="email" />
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Confirm Password</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Input placeholder="********" {...field} type="password" />
              </FormControl>
            </FormItem>
          )}
        />
        {form.formState.isSubmitting ? (
          <ButtonLoading disabled size="form" />
        ) : (
          <Button size="form" type="submit">
            Sign Up
          </Button>
        )}
      </form>
    </Form>
  );
};

const SignUp: NextPage = ({}) => {
  return (
    <>
      <Head>
        <title>Bella - Sign Up</title>
      </Head>
      <main className="p flex flex-1 flex-col items-center justify-center">
        <SignUpForm />
        <OAuthButtons />
        <FormLink href="/login">Already have an account? Login!</FormLink>
      </main>
    </>
  );
};

export default SignUp;
