import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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

interface Item {
  value: string;
  label: string;
}

interface ComboboxProps {
  data?: Item[];
  placeholder?: string;
  defaultValue?: Item;
  onSelect?: (item: Item) => void;
  disabled?: boolean;
  enabledItems?: Item[];
}

const Combobox: React.FC<ComboboxProps> = ({
  data,
  placeholder,
  defaultValue,
  onSelect,
  disabled,
  enabledItems,
}) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(defaultValue?.value ?? "");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger disabled={disabled} asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between px-3 font-sans font-normal normal-case"
        >
          {value ? (
            data?.find((item) => item.value === value)?.label
          ) : (
            <p className="text-muted-foreground">{placeholder ?? "Select"}</p>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="h-[400px] w-full overflow-y-hidden rounded-2xl p-0">
        <Command>
          <CommandInput placeholder={placeholder ?? "Search"} />
          <CommandEmpty className="p-4 text-center text-sm text-muted-foreground">
            No results found.
          </CommandEmpty>
          <CommandGroup className="no-scrollbar overflow-y-scroll">
            {data?.map((item, index) => (
              <CommandItem
                disabled={
                  enabledItems
                    ? enabledItems.some(
                        (enabledItem) => enabledItem.value !== item.value,
                      )
                    : undefined
                }
                key={index}
                onSelect={() => {
                  setValue(data[index]!.value);
                  onSelect && onSelect(data[index]!);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === item.value ? "opacity-100" : "opacity-0",
                  )}
                />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export { Combobox };
