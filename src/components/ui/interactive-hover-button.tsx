import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function InteractiveHoverButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'group relative w-auto cursor-pointer overflow-hidden rounded-full border p-2 px-6 text-center font-semibold bg-[var(--ihb-bg)]',
        className
      )}
      style={
        {
          '--ihb-bg': 'white', // button background
          '--ihb-primary': 'black', // dot color
          '--ihb-foreground': 'white', // hover text color (inverted)
          ...((props as any).style || {}),
        } as React.CSSProperties
      }
      {...props}
    >
      {/* Default layer */}
      <div className='flex items-center gap-2'>
        <div className='bg-[var(--ihb-primary)] h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-[100.8]'></div>
        <span className='text-[var(--ihb-primary)] transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0'>
          {children}
        </span>
      </div>

      {/* Hover layer */}
      <div className='absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100'>
        <span className='text-[var(--ihb-foreground)]'>{children}</span>
        <ArrowRight className='h-4 w-4 text-[var(--ihb-foreground)]' />
      </div>
    </button>
  );
}
