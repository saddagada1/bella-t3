import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useMemo, type FormHTMLAttributes } from "react";
import { type UseFormReset, useForm } from "react-hook-form";
import { z } from "zod";
import { enabledCountries, countries, defaultCountry } from "~/utils/constants";
import provincesCitiesJSON from "public/data/provincesCities.json";
import { type CountryWithProvinces } from "~/utils/types";
import { ButtonLoading, Button } from "../ui/button";
import { Combobox } from "../ui/combobox";
import {
  Form,
  FormTitle,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "../ui/form";
import { Input } from "../ui/input";
import { cn } from "~/utils/shadcn/utils";

const addressInput = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  line1: z.string().min(1, "Required"),
  line2: z.string(),
  city: z.string().min(1, "Required"),
  province: z.string().min(1, "Required"),
  zip: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
});

interface AddressFormProps extends FormHTMLAttributes<HTMLFormElement> {
  title?: string;
  buttonLabel?: string;
  onFormSubmit: (
    values: z.infer<typeof addressInput>,
    reset: UseFormReset<z.infer<typeof addressInput>>,
    resetState: () => void,
  ) => void | Promise<void>;
}

const AddressForm: React.FC<AddressFormProps> = ({
  onFormSubmit,
  title,
  buttonLabel,
  ...rest
}) => {
  const { className, ...props } = rest;
  const [selectedCountry, setSelectedCountry] = useState(
    enabledCountries[0]?.value ?? defaultCountry,
  );
  const [selectedProvince, setSelectedProvince] = useState("");

  const form = useForm<z.infer<typeof addressInput>>({
    resolver: zodResolver(addressInput),
    defaultValues: {
      firstName: "",
      lastName: "",
      line1: "",
      line2: "",
      city: "",
      province: "",
      zip: "",
      country: selectedCountry,
    },
  });

  const { provinces, provincesData } = useMemo(() => {
    const country = (provincesCitiesJSON as CountryWithProvinces[]).find(
      (country) => country.code === selectedCountry,
    );
    return {
      provinces: country?.provinces.map((province) => {
        return {
          value: province.name,
          label: province.name,
        };
      }),
      provincesData: country?.provinces,
    };
  }, [selectedCountry]);

  const citiesTowns = useMemo(() => {
    const province = provincesData?.find(
      (province) => province.name === selectedProvince,
    );
    return province?.cities
      .concat(province?.towns)
      .sort()
      .map((cityTown) => {
        return {
          value: cityTown,
          label: cityTown,
        };
      });
  }, [provincesData, selectedProvince]);

  const resetState = () => {
    setSelectedCountry(enabledCountries[0]?.value ?? defaultCountry);
    setSelectedProvince("");
  };

  return (
    <Form {...form}>
      <form
        {...props}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit((values) =>
          onFormSubmit(values, form.reset, resetState),
        )}
        className={cn("space-y-8 lg:w-1/2", className)}
      >
        {title && <FormTitle className="mb-8">{title}</FormTitle>}
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>First Name</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Last Name</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="line1"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Address Line 1</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="line2"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Address Line 2</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>City / Town</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Combobox
                  key={selectedProvince}
                  data={citiesTowns}
                  onSelect={(item) => field.onChange(item.value)}
                  disabled={selectedProvince === ""}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="province"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Province</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Combobox
                  key={selectedCountry}
                  data={provinces}
                  onSelect={(item) => {
                    field.onChange(item.value);
                    form.setValue("city", "");
                    setSelectedProvince(item.value);
                  }}
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
              <div className="flex justify-between">
                <FormLabel>Country</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Combobox
                  data={countries}
                  onSelect={(item) => {
                    field.onChange(item.value);
                    setSelectedCountry(item.value);
                  }}
                  defaultValue={enabledCountries[0]}
                  enabledItems={enabledCountries}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="zip"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Postal Code</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Input className="w-1/2" maxLength={10} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        {form.formState.isSubmitting ? (
          <ButtonLoading disabled size="form" />
        ) : (
          <Button size="form" type="submit">
            {buttonLabel ?? "Edit"}
          </Button>
        )}
      </form>
    </Form>
  );
};

export default AddressForm;
