import countriesJSON from "public/data/countries.json";
import currenciesJSON from "public/data/currencyCodes.json";
import departmentsJSON from "public/data/departments.json";
import conditionsJSON from "public/data/conditions.json";
import designersJSON from "public/data/designers.json";
import coloursJSON from "public/data/colours.json";
import erasJSON from "public/data/eras.json";
import sourcesJSON from "public/data/sources.json";
import stylesJSON from "public/data/styles.json";
import {
  type Department,
  type Country,
  type Condition,
  type Designer,
  type Colour,
  type NotificationTemplateArgs,
  type ProductFilters as ProductFiltersType,
} from "./types";
import { z } from "zod";
import { type NotificationAction } from "@prisma/client";

export const countries = (countriesJSON as Country[]).map((country) => {
  return { value: country.code, label: country.name };
});

export const enabledCountries = [{ value: "CA", label: "Canada" }];

export const defaultCountry = "CA";

export const currencies: Record<string, string> = currenciesJSON;

export const departments = departmentsJSON as Department[];

export const conditions = conditionsJSON as Condition[];

export const designers = designersJSON as Designer[];

export const colours = coloursJSON as Colour[];

export const eras = erasJSON;

export const sources = sourcesJSON;

export const styles = stylesJSON;

export const currencyRegex = /^[1-9]+[0-9]*(\.[0-9]{0,2})?$/;

export const addressInput = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  line1: z.string().min(1, "Required"),
  line2: z.string(),
  city: z.string().min(1, "Required"),
  province: z.string().min(1, "Required"),
  zip: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
});

export const productInput = z.object({
  numImages: z.number().min(1, "Required"),
  name: z.string().min(1, "Required"),
  description: z.string().min(1, "Required").max(500, "Max 500 Chars"),
  department: z.string().min(1, "Required"),
  category: z.string().min(1, "Required"),
  subcategory: z.string().min(1, "Required"),
  condition: z.string().min(1, "Required"),
  size: z.string().min(1, "Required"),
  designers: z.array(z.string()),
  colours: z.array(z.string()),
  sources: z.array(z.string()),
  eras: z.array(z.string()),
  styles: z.array(z.string()),
  country: z.string().min(1, "Required"),
  shippingPrice: z.string().min(1, "Required"),
  price: z.string().min(1, "Required"),
  sold: z.boolean().optional(),
});

export const emptyFilters = {
  main: [],
  size: [],
  styles: [],
  eras: [],
  sources: [],
  designers: [],
  condition: [],
  colours: [],
  country: [],
  sold: false,
};

export const presetFilters = {
  sources: sources.reduce(
    (o, key) =>
      Object.assign(o, {
        [key.toLowerCase()]: { ...emptyFilters, sources: [key] },
      }),
    {} as Record<string, ProductFiltersType>,
  ),
  unisex: departments
    .find((department) => department.name === "Unisex")!
    .categories.reduce(
      (o, key) =>
        Object.assign(o, {
          [key.name.toLowerCase()]: {
            ...emptyFilters,
            main: [{ id: 1, name: "Unisex", categories: [key] }],
          },
        }),
      {} as Record<string, ProductFiltersType>,
    ),
  men: departments
    .find((department) => department.name === "Men")!
    .categories.reduce(
      (o, key) =>
        Object.assign(o, {
          [key.name.toLowerCase()]: {
            ...emptyFilters,
            main: [{ id: 2, name: "Men", categories: [key] }],
          },
        }),
      {} as Record<string, ProductFiltersType>,
    ),
  women: departments
    .find((department) => department.name === "Women")!
    .categories.reduce(
      (o, key) =>
        Object.assign(o, {
          [key.name.toLowerCase()]: {
            ...emptyFilters,
            main: [{ id: 3, name: "Women", categories: [key] }],
          },
        }),
      {} as Record<string, ProductFiltersType>,
    ),
  footwear: {
    unisex: {
      ...emptyFilters,
      main: departments
        .flatMap((d) =>
          d.name === "Unisex"
            ? {
                id: d.id,
                name: d.name,
                categories: d.categories.filter((c) => c.name === "Footwear"),
              }
            : undefined,
        )
        .filter((o) => o !== undefined),
    },
    men: {
      ...emptyFilters,
      main: departments
        .flatMap((d) =>
          d.name === "Men"
            ? {
                id: d.id,
                name: d.name,
                categories: d.categories.filter((c) => c.name === "Footwear"),
              }
            : undefined,
        )
        .filter((o) => o !== undefined),
    },
    women: {
      ...emptyFilters,
      main: departments
        .flatMap((d) =>
          d.name === "Women"
            ? {
                id: d.id,
                name: d.name,
                categories: d.categories.filter((c) => c.name === "Footwear"),
              }
            : undefined,
        )
        .filter((o) => o !== undefined),
    },
  },
};

export const productFilters = z.object({
  department: z
    .object({ name: z.object({ in: z.array(z.string()) }) })
    .optional(),
  category: z
    .object({ name: z.object({ in: z.array(z.string()) }) })
    .optional(),
  subcategory: z.object({ in: z.array(z.string()) }).optional(),
  condition: z.object({ in: z.array(z.string()) }).optional(),
  size: z.object({ in: z.array(z.string()) }).optional(),
  sources: z
    .object({ some: z.object({ name: z.object({ in: z.array(z.string()) }) }) })
    .optional(),
  designers: z
    .object({ some: z.object({ name: z.object({ in: z.array(z.string()) }) }) })
    .optional(),
  colours: z.object({ hasSome: z.array(z.string()) }).optional(),
  eras: z.object({ hasSome: z.array(z.string()) }).optional(),
  styles: z.object({ hasSome: z.array(z.string()) }).optional(),
  country: z.object({ in: z.array(z.string()) }).optional(),
  sold: z.boolean().optional(),
});

export const productSort = z.object({
  price: z.enum(["desc", "asc"]).optional(),
  updatedAt: z.enum(["desc", "asc"]).optional(),
});

export const applicationFeePercentage = 0.08;

export const paginationLimit = 50;

export const lgBreakpoint = 1024;

export const primaryColour = "#f4f4f5";

export const secondaryColour = "#09090b";

export const FORGOT_PASSWORD_PREFIX = "forgot-password:";

export const VERIFY_EMAIL_PREFIX = "verify-email:";

export const notificationTemplates: {
  [Action in NotificationAction]: (
    args: NotificationTemplateArgs[Action],
  ) => string;
} = {
  NEW_ORDER: () => "A new order has been placed.",
  EDIT_ORDER: ({ orderId }) => `A change has been made to order #${orderId}.`,
  CANCEL_ORDER: ({
    orderId,
    message,
  }: NotificationTemplateArgs["CANCEL_ORDER"]) =>
    `Order #${orderId} has been cancelled. ${message}`,
  UPDATE_ORDER: ({
    orderId,
    update,
  }: NotificationTemplateArgs["UPDATE_ORDER"]) =>
    `There has been an update to order #${orderId}. ${update}`,
};
