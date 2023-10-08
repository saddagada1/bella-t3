export interface Department {
  name: string;
  categories: { name: string; subcategories: string[]; sizes?: string[] }[];
}

export interface Country {
  name: string;
  code: string;
}

export interface Province {
  name: string;
  code: string;
  cities: string[];
  towns: string[];
}

export interface CountryWithProvinces {
  name: string;
  code: string;
  provinces: Province[];
}

export interface Designer {
  id: number;
  name: string;
  slug: string;
}

export interface Condition {
  name: string;
  description: string;
}

export interface Colour {
  name: string;
  code: string;
}
