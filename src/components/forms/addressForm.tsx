import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { enabledCountries, countries } from "~/utils/constants";
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

interface AddressFormProps {
  title?: string;
  buttonLabel?: string;
  onSubmit: (values: z.infer<typeof addressInput>) => void | Promise<void>;
}

const AddressForm: React.FC<AddressFormProps> = ({
  onSubmit,
  title,
  buttonLabel,
}) => {
  const [selectedCountry, setSelectedCountry] = useState(
    enabledCountries[0]?.value ?? "CA",
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

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
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
          <ButtonLoading size="form" />
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
