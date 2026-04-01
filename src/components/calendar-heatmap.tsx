'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

// type utilities
type UnionKeys<T> = T extends T ? keyof T : never;
type Expand<T> = T extends T ? { [K in keyof T]: T[K] } : never;
type OneOf<T extends {}[]> = {
  [K in keyof T]: Expand<T[K] & Partial<Record<Exclude<UnionKeys<T[number]>, keyof T[K]>, never>>>;
}[number];

// types
export type Classname = string;
export type WeightedDateEntry = {
  date: Date;
  weight: number;
};

interface IDatesPerVariant {
  datesPerVariant: Date[][];
}
interface IWeightedDatesEntry {
  weightedDates: WeightedDateEntry[];
}

type VariantDatesInput = OneOf<[IDatesPerVariant, IWeightedDatesEntry]>;

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  variantClassnames: Classname[];
} & VariantDatesInput;

// utility functions
function useModifiers(
  variantClassnames: Classname[],
  datesPerVariant: Date[][]
): [Record<string, Date[]>, Record<string, string>] {
  const noOfVariants = variantClassnames.length;
  const variantLabels = [...Array(noOfVariants)].map((_, idx) => `__variant${idx}`);

  const modifiers = variantLabels.reduce(
    (acc, key, index) => {
      acc[key] = datesPerVariant[index];
      return acc;
    },
    {} as Record<string, Date[]>
  );

  const modifiersClassNames = variantLabels.reduce(
    (acc, key, index) => {
      acc[key] = variantClassnames[index];
      return acc;
    },
    {} as Record<string, string>
  );

  return [modifiers, modifiersClassNames];
}

function categorizeDatesPerVariant(weightedDates: WeightedDateEntry[], noOfVariants: number) {
  const sortedEntries = weightedDates.sort((a, b) => a.weight - b.weight);
  const categorizedRecord = [...Array(noOfVariants)].map(() => [] as Date[]);
  const minNumber = sortedEntries[0].weight;
  const maxNumber = sortedEntries[sortedEntries.length - 1].weight;
  const range = minNumber === maxNumber ? 1 : (maxNumber - minNumber) / noOfVariants;

  sortedEntries.forEach(entry => {
    const category = Math.min(Math.floor((entry.weight - minNumber) / range), noOfVariants - 1);
    categorizedRecord[category].push(entry.date);
  });

  return categorizedRecord;
}

function CalendarHeatmap({
  variantClassnames,
  datesPerVariant,
  weightedDates,
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const noOfVariants = variantClassnames.length;

  weightedDates = weightedDates ?? [];
  datesPerVariant = datesPerVariant ?? categorizeDatesPerVariant(weightedDates, noOfVariants);

  const [modifiers, modifiersClassNames] = useModifiers(variantClassnames, datesPerVariant);

  return (
    <div className='relative'>
      <DayPicker
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        showOutsideDays={showOutsideDays}
        className={cn('p-3', className)}
        classNames={{
          months: 'flex flex-unwrap gap-6 justify-center px-8',
          month: 'space-y-2',
          month_caption: 'flex justify-center pt-1 relative items-center mb-2',
          caption_label: 'text-sm font-medium',
          nav: 'flex items-center justify-between w-full absolute top-1/2 -translate-y-1/2 left-0 pointer-events-none',
          button_previous: cn(
            buttonVariants({ variant: 'ghost' }),
            'h-8 w-4 p-0 opacity-50 hover:opacity-100 pointer-events-auto'
          ),
          button_next: cn(
            buttonVariants({ variant: 'ghost' }),
            'h-8 w-4 p-0 opacity-50 hover:opacity-100 pointer-events-auto'
          ),
          month_grid: 'w-full border-collapse',
          weekdays: 'flex',
          weekday: 'text-muted-foreground w-9 font-normal text-[0.8rem] text-center',
          week: 'flex w-full mt-1',
          day: 'w-9 h-9 flex items-center justify-center p-0 relative focus-within:relative focus-within:z-20',
          day_button: cn(
            buttonVariants({ variant: 'ghost' }),
            'h-9 w-9 p-0 font-normal rounded-md transition-colors duration-150 hover:bg-accent hover:text-accent-foreground aria-selected:opacity-100'
          ),
          range_end: 'day-range-end',
          today: 'bg-accent text-accent-foreground rounded-md',
          outside: 'text-muted-foreground opacity-50',
          disabled: 'text-muted-foreground opacity-50',
          range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
          hidden: 'invisible',
          ...classNames,
        }}
        components={{
          Chevron: ({ orientation }) =>
            orientation === 'left' ? <ChevronLeft className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />,
        }}
        {...props}
      />
    </div>
  );
}

CalendarHeatmap.displayName = 'CalendarHeatmap';

export { CalendarHeatmap };
