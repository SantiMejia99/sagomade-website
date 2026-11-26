import { useState } from 'react';
import { Button } from '@/components/ui/button';

/** Collapsible code block with a fade-out overlay while collapsed. */
export function CodeSnippet({ code, language = 'python' }: { code: string; language?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxHeight = isExpanded ? 'max-h-none' : 'max-h-120';

  return (
    <div className='relative'>
      <div
        className={`relative rounded-lg border bg-muted/50 overflow-hidden ${maxHeight} transition-all duration-300`}
      >
        <div className='px-4 py-2 border-b text-xs font-mono text-muted-foreground'>{language}</div>
        <pre className='overflow-x-auto p-4'>
          <code className='font-mono text-sm text-foreground whitespace-pre'>{code}</code>
        </pre>
      </div>

      {/* Gradient overlay when collapsed */}
      {!isExpanded && (
        <div className='absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none' />
      )}

      {/* Expand/Collapse button */}
      <div className='mt-4'>
        <Button variant='outline' className='justify-start' onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Show less' : 'Expand to read more'}
        </Button>
      </div>
    </div>
  );
}
