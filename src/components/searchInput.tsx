import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

const formSchema = z.object({
  query: z.string(),
});

const SearchInput: React.FC = ({}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    return;
  };

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
        className="my-2"
      >
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="flex items-center space-y-0">
              <FormControl>
                <>
                  <div className="mr-2 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                    <Search className="h-5 w-5" />
                  </div>
                  <Input
                    placeholder="Search for items, designers, styles..."
                    className="h-12"
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
