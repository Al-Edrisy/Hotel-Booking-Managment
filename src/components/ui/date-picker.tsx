"use client";

import * as React from "react";
import { format, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { parseISODate, toISODate } from "@/lib/dates";
import type { ISODate } from "@/types";

export interface DatePickerProps {
  value?: ISODate;
  onChange: (date: ISODate) => void;
  min?: ISODate;
  max?: ISODate;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Pick a date",
  disabled = false,
  className,
  id,
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    const d = parseISODate(value);
    return isValid(d) ? d : undefined;
  }, [value]);

  const minDate = React.useMemo(() => {
    if (!min) return undefined;
    const d = parseISODate(min);
    return isValid(d) ? d : undefined;
  }, [min]);

  const maxDate = React.useMemo(() => {
    if (!max) return undefined;
    const d = parseISODate(max);
    return isValid(d) ? d : undefined;
  }, [max]);

  const handleSelect = (date: Date | undefined) => {
    if (date && isValid(date)) {
      onChange(toISODate(date));
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className={cn(
            "h-9 w-full justify-start text-left font-normal text-xs transition-colors",
            !selectedDate && "text-muted-foreground",
            ariaInvalid && "border-destructive text-destructive",
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-3.5 opacity-70" />
          {selectedDate ? format(selectedDate, "EEE, MMM d, yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
