import countriesJSON from "public/data/countries.json";
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
} from "./types";
import { z } from "zod";

export const countries = (countriesJSON as Country[]).map((country) => {
  return { value: country.code, label: country.name };
});

export const enabledCountries = [{ value: "CA", label: "Canada" }];

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
  quantity: z.number().min(1, "Required"),
  size: z.string().min(1, "Required"),
  designers: z.array(z.string()),
  colours: z.array(z.string()),
  sources: z.array(z.string()),
  eras: z.array(z.string()),
  styles: z.array(z.string()),
  country: z.string().min(1, "Required"),
  shippingPrice: z.string().min(1, "Required"),
  price: z.string().min(1, "Required"),
  available: z.boolean().optional(),
  sold: z.boolean().optional(),
});

export const paginationLimit = 50;
