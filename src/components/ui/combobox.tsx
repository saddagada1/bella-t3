import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "~/utils/shadcn/utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./command";
import { type SelectItem as Item } from "~/utils/types";
import { useElementSize } from "usehooks-ts";

interface ComboboxProps {
  data?: Item[];
  placeholder?: string;
  defaultValue?: Item;
  defaultValues?: Item[];
  onMultiSelect?: (values: Item[]) => void;
  onMultiDelete?: (values: Item[]) => void;
  onSelect?: (item: Item) => void;
  disabled?: boolean;
  enabledItems?: Item[];
  multi?: boolean;
  maxValues?: number;
  searchFirst?: boolean;
  noSearch?: boolean;
}

const Combobox: React.FC<ComboboxProps> = ({
  data,
  placeholder,
  defaultValue,
  defaultValues,
  onMultiSelect,
  onMultiDelete,
  onSelect,
  disabled,
  enabledItems,
  multi,
  maxValues,
  searchFirst,
  noSearch,
}) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [value, setValue] = React.useState<Item | undefined>(defaultValue);
  const [values, setValues] = React.useState<Item[]>(defaultValues ?? []);
  const [container, { width }] = useElementSize();

  const handleDelete = (deletedItem: Item) => {
    if (!data) return;
    let newValues: Item[];
    if (values.some((selected) => selected.value === deletedItem.value)) {
      newValues = values.filter(
        (selected) => selected.value !== deletedItem.value,
      );
    } else {
      if (!maxValues || values.length < maxValues) {
        newValues = [deletedItem, ...values];
      } else {
        newValues = values;
      }
    }
    setValues(newValues);
    onMultiDelete && onMultiDelete(newValues);
  };

  const filteredData = React.useMemo(() => {
    if (searchFirst) {
      if (query.length < 2) return [];
    }
    return data?.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase()),
    );
  }, [data, query, searchFirst]);

  return (
    <>
      {multi && values.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {values.map((val, index) => (
            <p
              key={index}
              className="flex items-center rounded bg-accent px-2 py-1 text-xs font-medium text-accent-foreground"
            >
              {val.label}
              <span
                className="cursor-pointer"
                onClick={() => handleDelete(val)}
              >
                <X className="ml-2 h-4 w-4 text-destructive" />
              </span>
            </p>
          ))}
        </div>
      )}
      <Popover
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          setQuery("");
        }}
      >
        <PopoverTrigger ref={container} disabled={disabled} asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between px-3 font-sans font-normal normal-case"
          >
            {multi ? (
              values.length ? (
                <span className="overflow-hidden">
                  {values.map((item) => item.label).join(", ")}
                </span>
              ) : (
                placeholder ?? "Select"
              )
            ) : value ? (
              value?.label
            ) : (
              placeholder ?? "Select"
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          style={{ width }}
          className={cn(
            "overflow-hidden rounded-2xl p-0 lg:rounded-3xl",
            noSearch ? "h-[175px]" : "h-[200px]",
          )}
        >
          <Command shouldFilter={false}>
            {!noSearch && (
              <>
                <CommandInput
                  onValueChange={(val) => setQuery(val)}
                  placeholder={
                    searchFirst ? "Begin Typing to Search" : "Search"
                  }
                />
                {!searchFirst && (
                  <CommandEmpty className="p-4 text-center text-sm text-muted-foreground">
                    No results found.
                  </CommandEmpty>
                )}
              </>
            )}
            <CommandGroup className="no-scrollbar overflow-y-scroll">
              {filteredData?.map((item, index) => (
                <CommandItem
                  className={cn(noSearch && "rounded-xl lg:rounded-2xl")}
                  disabled={
                    enabledItems
                      ? enabledItems.some(
                          (enabledItem) => enabledItem.value !== item.value,
                        )
                      : undefined
                  }
                  key={index}
                  onSelect={() => {
                    if (multi) {
                      let newValues: Item[];
                      if (
                        values.some((selected) => selected.value === item.value)
                      ) {
                        newValues = values.filter(
                          (selected) => selected.value !== item.value,
                        );
                      } else {
                        if (!maxValues || values.length < maxValues) {
                          newValues = [item, ...values];
                        } else {
                          newValues = values;
                        }
                      }
                      setValues(newValues);
                      onMultiSelect && onMultiSelect(newValues);
                    } else {
                      item.value === value?.value
                        ? setValue(undefined)
                        : setValue(item);
                      onSelect && onSelect(item);
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      multi
                        ? values.some(
                            (selected) => selected.value === item.value,
                          )
                          ? "opacity-100"
                          : "opacity-0"
                        : value?.value === item.value
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
};

export { Combobox };
