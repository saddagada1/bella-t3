import countriesJSON from "public/data/countries.json";
import { type Country } from "./types";

export const countries = (countriesJSON as Country[]).map((country) => {
  return { value: country.code, label: country.name };
});

export const enabledCountries = [{ value: "CA", label: "Canada" }];
