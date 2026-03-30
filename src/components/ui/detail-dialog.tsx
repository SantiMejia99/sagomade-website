import { useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { X } from 'lucide-react';

interface DetailDialogProps {
  item: {
    title: string;
    content: string;
  };
}

export function DetailDialog({ item }: DetailDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className='w-auto bg-[#1A1A1A] gap-4 px-6 py-4 rounded-4xl flex items-center text-muted-foreground cursor-pointer text-md font-bold transition-colors duration-200 border-b border-gray-300/20 hover:border-gray-300/60'
      >
        {item.title}
        <span className='text-sm text-muted-foreground/40'>↗</span>
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className='relative z-50' transition>
        <DialogBackdrop
          transition
          className='fixed inset-0 bg-black/60 backdrop-blur-sm duration-300 ease-out data-[closed]:opacity-0'
        />
        <div className='fixed inset-0 flex w-screen items-center justify-center p-4'>
          <DialogPanel
            transition
            className='w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-[#1A1A1A] border border-gray-300/20 rounded-md p-8 duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0'
          >
            <div className='flex items-start justify-between mb-6'>
              <DialogTitle className='text-lg font-bold text-foreground pr-4'>{item.title}</DialogTitle>
              <button
                onClick={() => setIsOpen(false)}
                className='text-muted-foreground/40 hover:text-foreground transition-colors shrink-0'
              >
                <X className='h-5 w-5' />
              </button>
            </div>
            <div
              className='text-muted-foreground/60 leading-relaxed text-base [&>strong]:text-foreground [&>strong]:font-bold whitespace-pre-wrap'
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
