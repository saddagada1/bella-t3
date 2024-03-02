import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useWindowSize } from "usehooks-ts";
import { z } from "zod";
import ErrorView from "~/components/errorView";
import LoadingView from "~/components/loadingView";
import { Button, ButtonLoading } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormTitle,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/utils/api";
import Image from "next/image";
import { lgBreakpoint } from "~/utils/constants";
import { putImage } from "~/utils/helpers";
import { calcTrimmedString } from "~/utils/calc";
import { env } from "~/env.mjs";

const aboutSchema = z.object({
  name: z.string(),
  bio: z.string().max(500, "Max 500 Chars"),
});

const AboutForm: React.FC<{ name: string | null; bio: string | null }> = ({
  name,
  bio,
}) => {
  const form = useForm<z.infer<typeof aboutSchema>>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      name: "",
      bio: "",
    },
  });
  const t3 = api.useContext();
  const { mutateAsync: changeName } = api.users.changeName.useMutation({
    onError: (err) => {
      toast.error(`${err.message}`);
    },
    onSuccess: (res) => {
      t3.users.getSessionUser.setData(undefined, (cachedData) => {
        if (!cachedData) return;
        return {
          ...cachedData,
          name: res.name,
        };
      });
      toast.success("Successfully Updated Name");
      form.reset();
    },
  });
  const { mutateAsync: changeBio } = api.users.changeBio.useMutation({
    onError: (err) => {
      toast.error(`${err.message}`);
    },
    onSuccess: (res) => {
      t3.users.getSessionUser.setData(undefined, (cachedData) => {
        if (!cachedData) return;
        return {
          ...cachedData,
          bio: res.bio,
        };
      });
      toast.success("Successfully Updated Bio");
      form.reset();
    },
  });

  const onSubmit = async (values: z.infer<typeof aboutSchema>) => {
    if (calcTrimmedString(values.name) !== "") {
      await changeName({
        name: calcTrimmedString(values.name),
      });
    }
    if (calcTrimmedString(values.bio) !== "") {
      await changeBio({
        bio: calcTrimmedString(values.bio),
      });
    }
  };

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-1 space-y-8 text-right"
      >
        <FormTitle>About</FormTitle>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Name</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Input placeholder={name ?? "Name"} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-end justify-between">
                <FormLabel>Bio</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Textarea
                  placeholder={bio ?? "About You"}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs">
                {`${
                  field.value.length ? 500 - field.value.length : 500
                } chars left`}
              </FormDescription>
            </FormItem>
          )}
        />
        {form.formState.isSubmitting ? (
          <ButtonLoading size="form" />
        ) : (
          <Button size="form" type="submit">
            Update
          </Button>
        )}
      </form>
    </Form>
  );
};

const securitySchema = z
  .object({
    password: z.string().min(8, { message: "Min 8 Chars Required" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Does Not Match",
    path: ["confirmPassword"],
  });

const SecurityForm: React.FC = () => {
  const form = useForm<z.infer<typeof securitySchema>>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const { mutateAsync: changePassword } = api.users.changePassword.useMutation({
    onError: (err) => {
      toast.error(`${err.message}`);
    },
    onSuccess: () => {
      toast.success("Successfully Updated Password");
      form.reset();
    },
  });

  const onSubmit = async (values: z.infer<typeof securitySchema>) => {
    await changePassword({
      password: values.password,
    });
  };

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-1 space-y-8 text-right"
      >
        <FormTitle>Security</FormTitle>
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
          <ButtonLoading size="form" />
        ) : (
          <Button size="form" type="submit">
            Update
          </Button>
        )}
      </form>
    </Form>
  );
};

const generalSchema = z.object({
  email: z.string().email({ message: "Invalid Email" }),
  username: z
    .string()
    .min(3, "Min 3 Chars Required")
    .regex(/^[A-Za-z0-9]*$/, "Only ABC's & Numbers")
    .max(20, "Max 20 Chars"),
});

const GeneralForm: React.FC<{ email: string; username: string }> = ({
  email,
  username,
}) => {
  const form = useForm<z.infer<typeof generalSchema>>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      email: "",
      username: "",
    },
  });
  const t3 = api.useContext();
  const { mutateAsync: changeEmail } = api.users.changeEmail.useMutation({
    onError: (err) => {
      toast.error(`${err.message}`);
    },
    onSuccess: (res) => {
      if (!res.user) {
        form.setError("email", {
          type: "manual",
          message: res.error.message,
        });
        return;
      }
      t3.users.getSessionUser.setData(undefined, (cachedData) => {
        if (!cachedData) return;
        return {
          ...cachedData,
          email: res.user.email,
        };
      });
      toast.success("Successfully Updated Email");
      form.reset();
    },
  });
  const { mutateAsync: changeUsername } = api.users.changeUsername.useMutation({
    onError: (err) => {
      toast.error(`${err.message}`);
    },
    onSuccess: (res) => {
      if (!res.user) {
        form.setError("username", {
          type: "manual",
          message: res.error.message,
        });
        return;
      }
      t3.users.getSessionUser.setData(undefined, (cachedData) => {
        if (!cachedData) return;
        return {
          ...cachedData,
          username: res.user.username,
        };
      });
      toast.success("Successfully Updated Username");
      form.reset();
    },
  });

  const onSubmit = async (values: z.infer<typeof generalSchema>) => {
    if (calcTrimmedString(values.username) !== "") {
      await changeUsername({
        username: calcTrimmedString(values.username),
      });
    }
    if (calcTrimmedString(values.email) !== "") {
      await changeEmail({
        email: calcTrimmedString(values.email),
      });
    }
  };

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-1 space-y-8 text-right"
      >
        <FormTitle>General</FormTitle>
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
                <Input placeholder={email} {...field} type="email" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Username</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Input placeholder={username} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        {form.formState.isSubmitting ? (
          <ButtonLoading size="form" />
        ) : (
          <Button size="form" type="submit">
            Update
          </Button>
        )}
      </form>
    </Form>
  );
};

const PictureForm: React.FC<{ image: string | null }> = ({ image }) => {
  const { width } = useWindowSize();
  const [profileImage, setProfileImage] = useState<File>();
  const t3 = api.useContext();
  const { mutateAsync: changeProfileImage, isLoading: changingProfileImage } =
    api.users.changeImage.useMutation({
      onError: (err) => {
        toast.error(err.message);
      },
      onSuccess: async (res) => {
        if (!profileImage) return;
        const response = await putImage(res.url, profileImage);
        if (!response) {
          toast.error("Could Not Change Profile Image");
          return;
        }
        t3.users.getSessionUser.setData(undefined, (cachedData) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            image: env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN + res.image,
          };
        });
        toast.success("Changed Profile Image");
      },
    });
  const { mutateAsync: deleteProfileImage, isLoading: deletingProfileImage } =
    api.users.deleteImage.useMutation({
      onError: (err) => {
        toast.error(err.message);
      },
      onSuccess: () => {
        toast.success("Deleted Profile Image");
      },
    });

  const handleProfileImageUpload = (file?: File) => {
    const accept = "image/jpeg image/jpg image/png";
    if (!file) return;
    if (file.size > 2097152) {
      toast.error("Max File Size: 2MB");
      return;
    }
    if (!accept.includes(file.type)) {
      toast.error("Only JPEG, JPG and PNG Files");
      return;
    }
    setProfileImage(file);
  };

  const handleSaveProfileImage = () => {
    if (!profileImage) return;
    void changeProfileImage();
  };

  const handleDeleteProfileImage = () => {
    if (profileImage) setProfileImage(undefined);
    if (image) void deleteProfileImage();
  };

  return (
    <div className="flex-1">
      <FormTitle className="mb-8">Profile Image</FormTitle>
      <div className="flex flex-col items-center gap-8">
        <div
          style={{
            width: width > lgBreakpoint ? 200 : 125,
            height: width > lgBreakpoint ? 200 : 125,
          }}
          className="relative flex flex-col items-center justify-center overflow-hidden rounded-full border border-dashed font-mono font-medium uppercase text-muted-foreground"
        >
          <input
            className="absolute h-full w-full cursor-pointer opacity-0"
            type="file"
            name="file"
            placeholder=""
            onChange={(e) =>
              e.target.files && handleProfileImageUpload(e.target.files[0])
            }
          />
          {!profileImage && !image ? (
            <>
              <Camera className="h-6 w-6" />
              <p className="text-sm">Select</p>
            </>
          ) : (
            <Image
              unoptimized
              src={
                profileImage
                  ? URL.createObjectURL(profileImage)
                  : env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN + image ?? ""
              }
              alt="Profile Image Preview"
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="flex w-full gap-4">
          {changingProfileImage ? (
            <ButtonLoading disabled size="form" />
          ) : (
            <Button
              onClick={() => handleSaveProfileImage()}
              disabled={deletingProfileImage}
              size="form"
            >
              Update
            </Button>
          )}
          {deletingProfileImage ? (
            <ButtonLoading disabled size="form" />
          ) : (
            <Button
              disabled={changingProfileImage}
              onClick={() => handleDeleteProfileImage()}
              variant="destructive"
              size="form"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const Settings: NextPage = ({}) => {
  const {
    data: profile,
    isLoading: fetchingProfile,
    error: profileError,
  } = api.users.getSessionUser.useQuery();

  useEffect(() => {
    if (!profile) return;

    if (!profile.verified) {
      toast.error("Please Verify Your Account Before Proceeding.");
    }
  }, [profile]);

  if (fetchingProfile) {
    return <LoadingView />;
  }

  if (!profile || profileError) {
    toast.error("Something Went Wrong");
    return (
      <ErrorView
        code="500"
        message="We couldn't fetch your profile. This ones on us. Please refresh the page and try again."
      />
    );
  }

  return (
    <>
      <Head>
        <title>Bella - Edit Profile</title>
      </Head>
      <main className="p flex-1 space-y-8 lg:px-0">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-32">
          <PictureForm image={profile.image} />
          <GeneralForm username={profile.username} email={profile.email} />
        </div>
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-32">
          <AboutForm name={profile.name} bio={profile.bio} />
          <SecurityForm />
        </div>
      </main>
    </>
  );
};
export default Settings;
