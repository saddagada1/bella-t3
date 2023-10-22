import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button, ButtonLoading } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Combobox } from "~/components/ui/combobox";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  colours,
  conditions,
  departments,
  designers,
  eras,
  sources,
  styles,
} from "~/utils/constants";
import { type ProductFilters } from "~/utils/types";

interface FiltersProps {
  onFilter?: (filters: ProductFilters, sort: string) => void;
  isFiltering?: boolean;
}

const Filters: React.FC<FiltersProps> = ({ onFilter, isFiltering }) => {
  const [filters, setFilters] = useState<ProductFilters>({
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
  });
  const [sort, setSort] = useState("relevance");

  useEffect(() => {
    const main = filters.main.map((d) => ({
      name: d.name,
      categories: d.categories.map((c) => c.name),
    }));
    const size = filters.size.map((d) => ({
      name: d.name,
      categories: d.categories.map((c) => c.name),
    }));
    if (main.length <= 0) return;

    const mainCategories = main.flatMap((d) => d.categories);
    const sizeCategories = size.flatMap((d) => d.categories);
    if (!mainCategories.every((c) => sizeCategories.includes(c))) {
      setFilters({
        ...filters,
        size: filters.main.map((d) => ({
          ...d,
          categories: d.categories.map((c) => ({
            name: c.name,
            sizes: [],
          })),
        })),
      });
    }
  }, [filters]);

  return (
    <>
      <Select onValueChange={(value) => setSort(value)} defaultValue={sort}>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="relevance">Sort By: Relevance</SelectItem>
          <SelectItem value="lowPrice">Sort By: Low Price</SelectItem>
          <SelectItem value="highPrice">Sort By: High Price</SelectItem>
          <SelectItem value="new">Sort By: New</SelectItem>
        </SelectContent>
      </Select>
      <Accordion className="border-t" type="single" collapsible>
        <AccordionItem value="categories">
          <AccordionTrigger className="!text-sm uppercase">
            Category
          </AccordionTrigger>
          <AccordionContent className="pl-4">
            {departments.map((department, departmentIndex) => (
              <Accordion key={departmentIndex} type="single" collapsible>
                <AccordionItem
                  className="border-b-0"
                  value="department-categories"
                >
                  <AccordionTrigger className="mb-2 py-0 !text-sm uppercase">
                    {department.name}
                  </AccordionTrigger>
                  <AccordionContent className="pl-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Checkbox
                        checked={
                          !!filters.main.some(
                            (d) =>
                              d.id === department.id &&
                              d.categories.length ===
                                department.categories.length &&
                              d.categories.reduce(
                                (prev, curr) =>
                                  prev + curr.subcategories.length,
                                0,
                              ) ===
                                department.categories.reduce(
                                  (prev, curr) =>
                                    prev + curr.subcategories.length,
                                  0,
                                ),
                          )
                        }
                        onCheckedChange={(checked) => {
                          const filteredMain = filters.main.filter(
                            (d) => d.id !== department.id,
                          );
                          if (checked) {
                            setFilters({
                              ...filters,
                              main: [...filteredMain, department],
                            });
                          } else {
                            setFilters({
                              ...filters,
                              main: filteredMain,
                            });
                          }
                        }}
                        id="all-categories"
                      />
                      <Label className="text-sm">All Categories</Label>
                    </div>
                    {department.categories.map((category, categoryIndex) => (
                      <Accordion key={categoryIndex} type="single" collapsible>
                        <AccordionItem
                          className="border-b-0"
                          value="department-category-subcategories"
                        >
                          <AccordionTrigger className="mb-2 py-0 !text-sm uppercase">
                            {category.name}
                          </AccordionTrigger>
                          <AccordionContent className="pl-4">
                            <div className="mt-2 flex items-center gap-2">
                              <Checkbox
                                checked={
                                  !!filters.main
                                    .find((d) => d.id === department.id)
                                    ?.categories.some(
                                      (c) =>
                                        c.name === category.name &&
                                        c.subcategories.length ===
                                          category.subcategories.length,
                                    )
                                }
                                onCheckedChange={(checked) => {
                                  const oldDepartment = filters.main.find(
                                    (d) => d.id === department.id,
                                  );
                                  const filteredMain = filters.main.filter(
                                    (d) => d.id !== department.id,
                                  );
                                  if (checked) {
                                    if (oldDepartment) {
                                      setFilters({
                                        ...filters,
                                        main: [
                                          ...filteredMain,
                                          {
                                            ...oldDepartment,
                                            categories: [
                                              ...oldDepartment.categories.filter(
                                                (c) => c.name !== category.name,
                                              ),
                                              category,
                                            ],
                                          },
                                        ],
                                      });
                                    } else {
                                      setFilters({
                                        ...filters,
                                        main: [
                                          ...filters.main,
                                          {
                                            ...department,
                                            categories: [category],
                                          },
                                        ],
                                      });
                                    }
                                  } else {
                                    if (oldDepartment) {
                                      const newCategories =
                                        oldDepartment.categories.filter(
                                          (c) => c.name !== category.name,
                                        );

                                      if (newCategories.length > 0) {
                                        setFilters({
                                          ...filters,
                                          main: [
                                            ...filteredMain,
                                            {
                                              ...oldDepartment,
                                              categories: newCategories,
                                            },
                                          ],
                                        });
                                      } else {
                                        setFilters({
                                          ...filters,
                                          main: filteredMain,
                                        });
                                      }
                                    }
                                  }
                                }}
                                id="all-subcategories"
                              />
                              <Label className="text-xs">
                                All Subcategories
                              </Label>
                            </div>
                            {category.subcategories.map(
                              (subcategory, index) => (
                                <div
                                  key={index}
                                  className="mt-2 flex items-center gap-2"
                                >
                                  <Checkbox
                                    checked={
                                      !!filters.main
                                        .find((d) => d.id === department.id)
                                        ?.categories.find(
                                          (c) => c.name === category.name,
                                        )
                                        ?.subcategories.includes(subcategory)
                                    }
                                    onCheckedChange={(checked) => {
                                      const oldCategory = filters.main
                                        .find((d) => d.id === department.id)
                                        ?.categories.find(
                                          (c) => c.name === category.name,
                                        );
                                      const oldDepartment = filters.main.find(
                                        (d) => d.id === department.id,
                                      );
                                      const filteredMain = filters.main.filter(
                                        (d) => d.id !== department.id,
                                      );
                                      if (checked) {
                                        if (oldDepartment) {
                                          if (oldCategory) {
                                            setFilters({
                                              ...filters,
                                              main: [
                                                ...filteredMain,
                                                {
                                                  ...oldDepartment,
                                                  categories: [
                                                    ...oldDepartment.categories.filter(
                                                      (c) =>
                                                        c.name !==
                                                        category.name,
                                                    ),
                                                    {
                                                      ...oldCategory,
                                                      subcategories: [
                                                        ...oldCategory.subcategories,
                                                        subcategory,
                                                      ],
                                                    },
                                                  ],
                                                },
                                              ],
                                            });
                                          } else {
                                            setFilters({
                                              ...filters,
                                              main: [
                                                ...filteredMain,
                                                {
                                                  ...oldDepartment,
                                                  categories: [
                                                    ...oldDepartment.categories.filter(
                                                      (c) =>
                                                        c.name !==
                                                        category.name,
                                                    ),
                                                    {
                                                      ...category,
                                                      subcategories: [
                                                        subcategory,
                                                      ],
                                                    },
                                                  ],
                                                },
                                              ],
                                            });
                                          }
                                        } else {
                                          setFilters({
                                            ...filters,
                                            main: [
                                              ...filters.main,
                                              {
                                                ...department,
                                                categories: [
                                                  {
                                                    ...category,
                                                    subcategories: [
                                                      subcategory,
                                                    ],
                                                  },
                                                ],
                                              },
                                            ],
                                          });
                                        }
                                      } else {
                                        if (oldDepartment) {
                                          const newCategories =
                                            oldDepartment.categories.filter(
                                              (c) => c.name !== category.name,
                                            );
                                          if (oldCategory) {
                                            const newSubcategories =
                                              oldCategory.subcategories.filter(
                                                (s) => s !== subcategory,
                                              );
                                            if (newSubcategories.length > 0) {
                                              setFilters({
                                                ...filters,
                                                main: [
                                                  ...filteredMain,
                                                  {
                                                    ...oldDepartment,
                                                    categories: [
                                                      ...newCategories,
                                                      {
                                                        ...oldCategory,
                                                        subcategories:
                                                          newSubcategories,
                                                      },
                                                    ],
                                                  },
                                                ],
                                              });
                                            } else {
                                              if (newCategories.length > 0) {
                                                setFilters({
                                                  ...filters,
                                                  main: [
                                                    ...filteredMain,
                                                    {
                                                      ...oldDepartment,
                                                      categories: newCategories,
                                                    },
                                                  ],
                                                });
                                              } else {
                                                setFilters({
                                                  ...filters,
                                                  main: filteredMain,
                                                });
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }}
                                    id={subcategory}
                                  />
                                  <Label className="text-xs">
                                    {subcategory}
                                  </Label>
                                </div>
                              ),
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="sizes">
          <AccordionTrigger className="!text-sm uppercase">
            Size
          </AccordionTrigger>
          <AccordionContent className="pl-4">
            {(filters.main.length > 0 ? filters.main : departments).map(
              (department, departmentIndex) => (
                <Accordion key={departmentIndex} type="single" collapsible>
                  <AccordionItem
                    className="border-b-0"
                    value="department-categories"
                  >
                    <AccordionTrigger className="mb-2 py-0 !text-sm uppercase">
                      {department.name}
                    </AccordionTrigger>
                    <AccordionContent className="pl-4">
                      {department.categories.map((category, categoryIndex) => (
                        <Accordion
                          key={categoryIndex}
                          type="single"
                          collapsible
                        >
                          <AccordionItem
                            className="border-b-0"
                            value="department-category-subcategories"
                          >
                            <AccordionTrigger className="mb-2 py-0 !text-sm uppercase">
                              {category.name}
                            </AccordionTrigger>
                            <AccordionContent className="pl-4">
                              {category.sizes.map((size, index) => (
                                <div
                                  key={index}
                                  className="mt-2 flex items-center gap-2"
                                >
                                  <Checkbox
                                    checked={
                                      !!filters.size
                                        .find((d) => d.id === department.id)
                                        ?.categories.find(
                                          (c) => c.name === category.name,
                                        )
                                        ?.sizes.includes(size)
                                    }
                                    onCheckedChange={(checked) => {
                                      const oldCategory = filters.size
                                        .find((d) => d.id === department.id)
                                        ?.categories.find(
                                          (c) => c.name === category.name,
                                        );
                                      const oldDepartment = filters.size.find(
                                        (d) => d.id === department.id,
                                      );
                                      const filteredMain = filters.size.filter(
                                        (d) => d.id !== department.id,
                                      );
                                      if (checked) {
                                        if (!!oldDepartment) {
                                          if (!!oldCategory) {
                                            setFilters({
                                              ...filters,
                                              size: [
                                                ...filteredMain,
                                                {
                                                  ...oldDepartment,
                                                  categories: [
                                                    ...oldDepartment.categories.filter(
                                                      (c) =>
                                                        c.name !==
                                                        category.name,
                                                    ),
                                                    {
                                                      ...oldCategory,
                                                      sizes: [
                                                        ...oldCategory.sizes,
                                                        size,
                                                      ],
                                                    },
                                                  ],
                                                },
                                              ],
                                            });
                                          } else {
                                            setFilters({
                                              ...filters,
                                              size: [
                                                ...filteredMain,
                                                {
                                                  ...oldDepartment,
                                                  categories: [
                                                    ...oldDepartment.categories.filter(
                                                      (c) =>
                                                        c.name !==
                                                        category.name,
                                                    ),
                                                    {
                                                      ...category,
                                                      sizes: [size],
                                                    },
                                                  ],
                                                },
                                              ],
                                            });
                                          }
                                        } else {
                                          setFilters({
                                            ...filters,
                                            size: [
                                              ...filters.main,
                                              {
                                                ...department,
                                                categories: [
                                                  {
                                                    ...category,
                                                    sizes: [size],
                                                  },
                                                ],
                                              },
                                            ],
                                          });
                                        }
                                      } else {
                                        if (!!oldDepartment) {
                                          const newCategories =
                                            oldDepartment.categories.filter(
                                              (c) => c.name !== category.name,
                                            );
                                          if (!!oldCategory) {
                                            const newSizes =
                                              oldCategory.sizes.filter(
                                                (s) => s !== size,
                                              );
                                            if (newSizes.length > 0) {
                                              setFilters({
                                                ...filters,
                                                size: [
                                                  ...filteredMain,
                                                  {
                                                    ...oldDepartment,
                                                    categories: [
                                                      ...newCategories,
                                                      {
                                                        ...oldCategory,
                                                        sizes: newSizes,
                                                      },
                                                    ],
                                                  },
                                                ],
                                              });
                                            } else {
                                              if (newCategories.length > 0) {
                                                setFilters({
                                                  ...filters,
                                                  size: [
                                                    ...filteredMain,
                                                    {
                                                      ...oldDepartment,
                                                      categories: newCategories,
                                                    },
                                                  ],
                                                });
                                              } else {
                                                setFilters({
                                                  ...filters,
                                                  size: filteredMain,
                                                });
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }}
                                    id={size}
                                  />
                                  <Label className="text-xs">{size}</Label>
                                </div>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ),
            )}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="conditions">
          <AccordionTrigger className="!text-sm uppercase">
            Condition
          </AccordionTrigger>
          <AccordionContent>
            {conditions.map((condition, index) => (
              <div key={index} className="mt-2 flex items-center gap-2">
                <Checkbox
                  checked={filters.condition.includes(condition.name)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFilters({
                        ...filters,
                        condition: [...filters.condition, condition.name],
                      });
                    } else {
                      setFilters({
                        ...filters,
                        condition: filters.condition.filter(
                          (c) => c !== condition.name,
                        ),
                      });
                    }
                  }}
                  id={condition.name}
                />
                <Label className="text-xs">{condition.name}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="designers">
          <AccordionTrigger className="!text-sm uppercase">
            Designers
          </AccordionTrigger>
          <AccordionContent>
            <Combobox
              data={designers.map((designer) => ({
                value: designer.name,
                label: designer.name,
              }))}
              multi
              defaultValues={filters.designers.map((designer) => ({
                value: designer,
                label: designer,
              }))}
              onMultiSelect={(items) =>
                setFilters({
                  ...filters,
                  designers: items.map((item) => item.label),
                })
              }
              onMultiDelete={(items) =>
                setFilters({
                  ...filters,
                  designers: items.map((item) => item.label),
                })
              }
              searchFirst
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="sources">
          <AccordionTrigger className="!text-sm uppercase">
            Sources
          </AccordionTrigger>
          <AccordionContent>
            {sources.map((source, index) => (
              <div key={index} className="mt-2 flex items-center gap-2">
                <Checkbox
                  checked={filters.sources.includes(source)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFilters({
                        ...filters,
                        sources: [...filters.sources, source],
                      });
                    } else {
                      setFilters({
                        ...filters,
                        sources: filters.sources.filter((c) => c !== source),
                      });
                    }
                  }}
                  id={source}
                />
                <Label className="text-xs">{source}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="eras">
          <AccordionTrigger className="!text-sm uppercase">
            Eras
          </AccordionTrigger>
          <AccordionContent>
            {eras.map((era, index) => (
              <div key={index} className="mt-2 flex items-center gap-2">
                <Checkbox
                  checked={filters.eras.includes(era)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFilters({
                        ...filters,
                        eras: [...filters.eras, era],
                      });
                    } else {
                      setFilters({
                        ...filters,
                        eras: filters.eras.filter((c) => c !== era),
                      });
                    }
                  }}
                  id={era}
                />
                <Label className="text-xs">{era}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="styles">
          <AccordionTrigger className="!text-sm uppercase">
            Styles
          </AccordionTrigger>
          <AccordionContent>
            {styles.map((style, index) => (
              <div key={index} className="mt-2 flex items-center gap-2">
                <Checkbox
                  checked={filters.styles.includes(style)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFilters({
                        ...filters,
                        styles: [...filters.styles, style],
                      });
                    } else {
                      setFilters({
                        ...filters,
                        styles: filters.styles.filter((c) => c !== style),
                      });
                    }
                  }}
                  id={style}
                />
                <Label className="text-xs">{style}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="colours">
          <AccordionTrigger className="!text-sm uppercase">
            Colours
          </AccordionTrigger>
          <AccordionContent>
            {colours.map((colour, index) => (
              <div key={index} className="mt-2 flex items-center gap-2">
                <Checkbox
                  checked={filters.colours.includes(colour.name)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFilters({
                        ...filters,
                        colours: [...filters.colours, colour.name],
                      });
                    } else {
                      setFilters({
                        ...filters,
                        colours: filters.colours.filter(
                          (c) => c !== colour.name,
                        ),
                      });
                    }
                  }}
                  id={colour.name}
                />
                <Label className="text-xs">{colour.name}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {isFiltering ? (
        <ButtonLoading size="form" />
      ) : (
        <Button onClick={() => onFilter && onFilter(filters, sort)} size="form">
          Filter
        </Button>
      )}
    </>
  );
};

export default Filters;
