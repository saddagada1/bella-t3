import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { type FormHTMLAttributes } from "react";
import { cn } from "~/utils/shadcn/utils";
import { useRouter } from "next/router";

type SearchInputProps = FormHTMLAttributes<HTMLFormElement>;

const formSchema = z.object({
  query: z.string(),
});

const SearchInput: React.FC<SearchInputProps> = ({ ...FormHTMLAtrributes }) => {
  const router = useRouter();
  const { className, ...props } = FormHTMLAtrributes;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    void router.push(`/search?q=${values.query}`);
  };

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
        {...props}
        className={cn("col-span-3 hidden lg:block", className)}
      >
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="flex items-center space-y-0">
              <FormControl>
                <>
                  <div className="mr-2 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                    <Search className="h-4 w-4" />
                  </div>
                  <Input
                    placeholder="Search for items, designers, styles..."
                    {...field}
                  />
                </>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
export default SearchInput;
