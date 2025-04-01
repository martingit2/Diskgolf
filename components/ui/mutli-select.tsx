// components/ui/multi-select.tsx
'use client';

import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { X } from 'lucide-react';

import { Badge } from '@/components/ui/badge'; // Shadcn Badge
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'; // Shadcn Command
import { cn } from '@/app/lib/utils'; // Juster sti

export interface Option {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>; // Valgfritt ikon
}

interface MultiSelectProps {
  options: Option[];
  selected: string[]; // Array av valgte verdier (IDer)
  onChange: (selectedValues: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Velg...',
  className,
  disabled = false,
  ...props
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const handleUnselect = React.useCallback((value: string) => {
      onChange(selected.filter((s) => s !== value));
    },
    [onChange, selected]
  );

  const handleSelect = React.useCallback((value: string) => {
      setInputValue(''); // Nullstill søkefeltet ved valg
      if (!selected.includes(value)) {
        onChange([...selected, value]);
      }
    },
    [onChange, selected]
  );

  // Håndterer tastatur-navigasjon (Escape, Backspace)
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (input.value === '' && selected.length > 0) {
            const lastSelected = selected[selected.length - 1];
            handleUnselect(lastSelected);
          }
        }
        // Lukk dropdown på Escape hvis ingen input
        if (e.key === 'Escape') {
          input.blur();
          setOpen(false);
        }
      }
    },
    [handleUnselect, selected]
  );

  // Filtrer alternativer basert på input-verdi og allerede valgte
  const selectableOptions = options.filter(
    (option) => !selected.includes(option.value)
  );

  return (
    <CommandPrimitive
        onKeyDown={handleKeyDown}
        className={cn(
            "overflow-visible bg-transparent border border-input rounded-md",
            disabled ? "cursor-not-allowed opacity-50" : ""
        )}
    >
      <div
        className={cn(
            "group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
             disabled ? "border-dashed" : "" // Visuell indikasjon hvis disabled
        )}
      >
        <div className="flex flex-wrap gap-1">
          {/* Viser valgte elementer som Badges */}
          {selected.map((value) => {
            const option = options.find((opt) => opt.value === value);
            if (!option) return null; // Bør ikke skje, men for sikkerhets skyld

            return (
              <Badge
                key={value}
                variant="secondary"
                className={cn("rounded-sm", disabled ? "cursor-not-allowed" : "cursor-pointer")}
                onClick={disabled ? undefined : () => handleUnselect(value)}
                onKeyDown={disabled ? undefined : (e) => { if (e.key === 'Enter') handleUnselect(value) }}
                tabIndex={disabled ? -1 : 0}
                aria-label={`Fjern ${option.label}`}
              >
                {option.label}
                {!disabled && (
                    <button
                        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUnselect(value); }} // Stopp propagation for å unngå at input åpnes
                        aria-label={`Fjern ${option.label}`}
                    >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                )}
              </Badge>
            );
          })}

          {/* Input-felt for søk og visning av placeholder */}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)} // Lukk på blur
            onFocus={() => setOpen(true)} // Åpne på fokus
            placeholder={selected.length === 0 ? placeholder : ''}
            disabled={disabled}
            className={cn(
                "ml-1 flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-sm",
                disabled ? "cursor-not-allowed" : ""
            )}
            style={{ flexGrow: 1 }} // Sørger for at input tar tilgjengelig plass
          />
        </div>
      </div>

      {/* Dropdown-liste med alternativer */}
      <div className="relative mt-1">
        {open && selectableOptions.length > 0 ? (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandList className="max-h-[200px] overflow-y-auto overflow-x-hidden">
              <CommandGroup>
                {selectableOptions.map((option) => {
                  return (
                    <CommandItem
                      key={option.value}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Forhindre blur på input
                        e.stopPropagation();
                      }}
                      onSelect={() => {
                        handleSelect(option.value);
                        // Vurder å lukke dropdown ved valg?
                        // setOpen(false);
                      }}
                      className={"cursor-pointer flex items-center justify-between"}
                      aria-label={option.label}
                    >
                      <div className="flex items-center gap-2">
                           {option.icon && <option.icon className="h-4 w-4 text-muted-foreground" />}
                           <span>{option.label}</span>
                      </div>
                       {/* Kan legge til et ikon for "valgt" her hvis ønskelig */}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
                {inputValue && selectableOptions.filter(opt => opt.label.toLowerCase().includes(inputValue.toLowerCase())).length === 0 && (
                     <CommandPrimitive.Empty className="px-3 py-2 text-sm text-muted-foreground">
                        Ingen resultater funnet for "{inputValue}".
                     </CommandPrimitive.Empty>
                )}
            </CommandList>
          </div>
        ) : null}
      </div>
    </CommandPrimitive>
  );
}