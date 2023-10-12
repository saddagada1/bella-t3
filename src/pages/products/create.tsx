import type { NextPage } from "next";
import Head from "next/head";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { useForm } from "react-hook-form";
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
import { Button, ButtonLoading } from "~/components/ui/button";
import { useRouter } from "next/router";
import {
  colours,
  conditions,
  countries,
  currencyRegex,
  defaultCountry,
  departments,
  designers,
  enabledCountries,
  eras,
  productInput,
  sources,
  styles,
} from "~/utils/constants";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { Textarea } from "~/components/ui/textarea";
import { Combobox } from "~/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useMemo, useState } from "react";
import { DollarSign } from "lucide-react";
import { Switch } from "~/components/ui/switch";
import UploadImages from "~/components/ui/uploadImages/uploadImages";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import { putProductImage } from "~/utils/helpers";

const CreateProductForm: React.FC = () => {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const { data: store } = api.store.get.useQuery(undefined, {
    onSuccess: (data) => {
      if (!session?.user.canSell && data.stripeSetupStatus === "complete") {
        void updateSession();
      }
    },
  });
  const { mutateAsync: createProduct } = api.products.create.useMutation();
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [freeShipping, setFreeShipping] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  const form = useForm<z.infer<typeof productInput>>({
    resolver: zodResolver(productInput),
    defaultValues: {
      numImages: 0,
      name: "",
      description: "",
      department: "",
      category: "",
      subcategory: "",
      condition: "",
      size: "",
      designers: [],
      colours: [],
      sources: [],
      eras: [],
      styles: [],
      country: store?.country ?? defaultCountry,
      shippingPrice: "",
      price: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof productInput>) => {
    if (store?.stripeSetupStatus === "not_started") {
      void router.push("/store/settings");
      toast.error("Please connect your account to Stripe");
      return;
    } else if (store?.stripeSetupStatus === "in_progress") {
      void router.push("/store/settings");
      toast("Please complete setting up your Stripe account");
      return;
    }
    const designerObjects = designers.filter((designer) =>
      values.designers.includes(designer.name),
    );
    const department = departments.find(
      (department) => department.name === values.department,
    );
    if (!department) {
      form.setError("department", { message: "Glitch!? Try Again Please." });
      return;
    } else if (designerObjects.length !== values.designers.length) {
      form.setError("designers", { message: "Glitch!? Try Again Please." });
      return;
    }
    try {
      const response = await createProduct({
        ...values,
        department,
        designers: designerObjects,
        shippingPrice: parseFloat(values.shippingPrice) * 100,
        price: parseFloat(values.price) * 100,
      });
      const imageRequests = response.uploadUrls.map(async (url, index) => {
        const image = images[index];
        if (!image) {
          return false;
        }
        return await putProductImage(url, image);
      });
      await Promise.all(imageRequests);
      toast.success("Product Created!");
      void router.push(`/products/${response.id}`);
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(`Error: ${error.message}`);
      }
      return;
    }
  };

  const categories = useMemo(() => {
    const department = departments.find(
      (department) => department.name === selectedDepartment,
    );
    return department?.categories;
  }, [selectedDepartment]);

  const { subcategories, sizes } = useMemo(() => {
    const category = categories?.find(
      (category) => category.name === selectedCategory,
    );
    return { subcategories: category?.subcategories, sizes: category?.sizes };
  }, [categories, selectedCategory]);

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 text-right lg:w-1/2"
      >
        <FormTitle onClick={() => console.log(form.getValues())}>
          New Product
        </FormTitle>
        <FormField
          control={form.control}
          name="numImages"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-end justify-between">
                <FormLabel>Images</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <UploadImages
                  maxImages={9}
                  setImages={(images) => {
                    setImages(images);
                    field.onChange(images.length);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-end justify-between">
                <FormLabel>Name</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Input placeholder="e.g. green Nike hoodie" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-end justify-between">
                <FormLabel>Description</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Textarea
                  placeholder="e.g. only worn a few times"
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
        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-end justify-between">
                <FormLabel>Condition</FormLabel>
                <FormMessage />
              </div>
              <Select
                onValueChange={(value) => field.onChange(value)}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select">
                      {field.value}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <FormDescription className="text-xs">
                  {(field.value.includes("Good") ||
                    field.value.includes("Fair")) &&
                    "Flaws should be noted in photos or description"}
                </FormDescription>
                <SelectContent>
                  {conditions.map((condition, index) => (
                    <SelectItem key={index} value={condition.name}>
                      <p>{condition.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {condition.description}
                      </p>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-end justify-between">
                <FormLabel>Department</FormLabel>
                <FormMessage />
              </div>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedDepartment(value);
                  setSelectedCategory("");
                  form.resetField("category");
                  form.resetField("subcategory");
                  form.resetField("size");
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.map((department, index) => (
                    <SelectItem key={index} value={department.name}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        {categories && (
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-end justify-between">
                  <FormLabel>Category</FormLabel>
                  <FormMessage />
                </div>
                <Select
                  key={selectedDepartment}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedCategory(value);
                    form.resetField("subcategory");
                    form.resetField("size");
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category, index) => (
                      <SelectItem key={index} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        )}
        {subcategories && (
          <FormField
            control={form.control}
            name="subcategory"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-end justify-between">
                  <FormLabel>Subcategory</FormLabel>
                  <FormMessage />
                </div>
                <Select
                  key={selectedCategory}
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subcategories.map((subcategory, index) => (
                      <SelectItem key={index} value={subcategory}>
                        {subcategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        )}
        {sizes && (
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem className="w-1/2">
                <div className="flex items-end justify-between">
                  <FormLabel>Size</FormLabel>
                  <FormMessage />
                </div>
                <Select
                  key={selectedCategory}
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sizes.map((size, index) => (
                      <SelectItem key={index} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="designers"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Designers</FormLabel>
                <FormDescription className="text-xs">
                  Select a max of 5 values
                </FormDescription>
              </div>
              <FormControl>
                <Combobox
                  data={designers.map((designer) => ({
                    value: designer.name,
                    label: designer.name,
                  }))}
                  multi
                  onMultiSelect={(items) =>
                    field.onChange(items.map((item) => item.label))
                  }
                  onMultiDelete={(items) =>
                    field.onChange(items.map((item) => item.label))
                  }
                  maxValues={5}
                  searchFirst
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sources"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Sources</FormLabel>
                <FormDescription className="text-xs">
                  Select a max of 5 values
                </FormDescription>
              </div>
              <FormControl>
                <Combobox
                  data={sources.map((source) => ({
                    value: source,
                    label: source,
                  }))}
                  multi
                  onMultiSelect={(items) =>
                    field.onChange(items.map((item) => item.label))
                  }
                  onMultiDelete={(items) =>
                    field.onChange(items.map((item) => item.label))
                  }
                  noSearch
                  maxValues={5}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="colours"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Colours</FormLabel>
                <FormDescription className="text-xs">
                  Select a max of 5 values
                </FormDescription>
              </div>
              <FormControl>
                <Combobox
                  data={colours.map((colour) => ({
                    value: colour.name,
                    label: colour.name,
                  }))}
                  multi
                  onMultiSelect={(items) =>
                    field.onChange(items.map((item) => item.label))
                  }
                  onMultiDelete={(items) =>
                    field.onChange(items.map((item) => item.label))
                  }
                  noSearch
                  maxValues={5}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="eras"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Eras</FormLabel>
                <FormDescription className="text-xs">
                  Select a max of 5 values
                </FormDescription>
              </div>
              <FormControl>
                <Combobox
                  data={eras.map((era) => ({
                    value: era,
                    label: era,
                  }))}
                  multi
                  onMultiSelect={(items) =>
                    field.onChange(items.map((item) => item.label))
                  }
                  onMultiDelete={(items) =>
                    field.onChange(items.map((item) => item.label))
                  }
                  noSearch
                  maxValues={5}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="styles"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Styles</FormLabel>
                <FormDescription className="text-xs">
                  Select a max of 5 values
                </FormDescription>
              </div>
              <FormControl>
                <Combobox
                  data={styles.map((style) => ({
                    value: style,
                    label: style,
                  }))}
                  multi
                  onMultiSelect={(items) =>
                    field.onChange(items.map((item) => item.label))
                  }
                  onMultiDelete={(items) =>
                    field.onChange(items.map((item) => item.label))
                  }
                  noSearch
                  maxValues={5}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-end justify-between">
                <FormLabel>Country</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Combobox
                  data={countries}
                  onSelect={(item) => field.onChange(item.value)}
                  defaultValue={enabledCountries[0]}
                  enabledItems={enabledCountries}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="shippingPrice"
          render={({ field }) => (
            <FormItem>
              <div className="flex w-2/5 items-end justify-between">
                <FormLabel>Shipping</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <div className="flex h-10 w-2/5 items-center rounded-full border border-input py-2 pl-3 pr-2">
                  <DollarSign className="mr-1 h-5 w-5" />
                  <Input
                    disabled={freeShipping}
                    className="h-fit border-none p-0 px-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (currencyRegex.test(val) || val == "") {
                        field.onChange(val);
                      }
                    }}
                  />
                </div>
              </FormControl>
              <div className="flex items-end gap-2 pt-2">
                <Switch
                  id="free-shipping"
                  checked={freeShipping}
                  onCheckedChange={(check) => {
                    if (check) {
                      field.onChange("0");
                    } else {
                      field.onChange("");
                    }
                    setFreeShipping(check);
                  }}
                />
                <label className="text-sm font-medium leading-none">
                  Offer Free Shipping
                </label>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <div className="flex w-2/5 items-end justify-between">
                <FormLabel>Price</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <div className="flex h-10 w-2/5 items-center rounded-full border border-input py-2 pl-3 pr-2">
                  <DollarSign className="mr-1 h-5 w-5" />
                  <Input
                    className="h-fit border-none p-0 px-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (currencyRegex.test(val) || val == "") {
                        field.onChange(val);
                      }
                    }}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        {form.formState.isSubmitting ? (
          <ButtonLoading disabled size="form" />
        ) : (
          <Button size="form" type="submit">
            Create
          </Button>
        )}
      </form>
    </Form>
  );
};

const CreateProduct: NextPage = ({}) => {
  return (
    <>
      <Head>
        <title>Bella - Create Product</title>
      </Head>
      <main className="flex flex-1 flex-col px-6 py-4 lg:items-center lg:px-0 lg:py-8">
        <CreateProductForm />
      </main>
    </>
  );
};
export default CreateProduct;
