import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export default function TypographyPlayground({ fontWeight = '400' }: { fontWeight?: string }) {
  const [text, setText] = useState('ESPACIO IDEAL');
  const [fontSize, setFontSize] = useState(100);
  const [leading, setLeading] = useState(1.2);
  const [columns, setColumns] = useState<'single' | 'double' | 'triple'>('single');
  const [colorMode, setColorMode] = useState<'white' | 'black'>('white');
  const textRef = useRef<HTMLDivElement>(null);

  const previewStyle: React.CSSProperties = {
    fontFamily: 'Espacio Ideal, sans-serif',
    fontWeight: fontWeight,
    fontSize: `${fontSize}px`,
    color: colorMode === 'white' ? '#ffffff' : '#000000',
    lineHeight: leading,
    transition: 'font-size 0.3s, color 0.2s, line-height 0.3s',
    columnCount: columns === 'single' ? 1 : columns === 'double' ? 2 : 3,
    columnGap: '2rem',
    textAlign: 'center',
  };

  const handleTextInput = (e: React.FormEvent<HTMLDivElement>) => {
    let newText = e.currentTarget.textContent || '';

    // Remove numbers and convert to uppercase
    newText = newText.replace(/[0-9]/g, '').toUpperCase();

    setText(newText);
  };

  // Restore caret position after text updates
  useEffect(() => {
    if (textRef.current) {
      const el = textRef.current;

      // Move caret to end
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);

      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Prevent number keys from being entered
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
    }
  };

  const handleFocus = () => {
    if (textRef.current && textRef.current.textContent === 'ESPACIO IDEAL') {
      textRef.current.textContent = '';
      setText('');
    }
  };

  const handleBlur = () => {
    if (textRef.current && textRef.current.textContent?.trim() === '') {
      textRef.current.textContent = 'ESPACIO IDEAL';
      setText('ESPACIO IDEAL');
    }
  };

  const resetToDefaults = () => {
    setFontSize(100);
    setLeading(1.2);
    setColumns('single');
    setColorMode('white');
  };

  return (
    <div className='space-y-2'>
      {/* Top Control Panel - Outside the frame */}
      <div className='px-6 py-4 bg-background/95 backdrop-blur-lg'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-8'>
            <div className='flex items-center gap-4'>
              <span className='text-sm font-medium text-muted-foreground'>Size</span>
              <div className='flex items-center gap-2'>
                <div className='w-32 h-1 bg-muted/50 rounded-lg relative'>
                  <div
                    className='absolute top-0 left-0 h-full bg-white/80 rounded-lg'
                    style={{ width: `${((fontSize - 20) / 180) * 100}%` }}
                  />
                  <div
                    className='absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border border-gray-400/50 shadow-sm cursor-pointer'
                    style={{
                      left: `${((fontSize - 20) / 180) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                  <input
                    type='range'
                    min='20'
                    max='200'
                    value={fontSize}
                    onChange={e => setFontSize(Number(e.target.value))}
                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                  />
                </div>
                <span className='text-xs text-muted-foreground w-8'>{fontSize}</span>
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <span className='text-sm font-medium text-muted-foreground'>Leading</span>
              <div className='flex items-center gap-2'>
                <div className='w-32 h-1 bg-muted/50 rounded-lg relative'>
                  <div
                    className='absolute top-0 left-0 h-full bg-white/80 rounded-lg'
                    style={{ width: `${((leading - 0.8) / 2.2) * 100}%` }}
                  />
                  <div
                    className='absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border border-gray-400/50 shadow-sm cursor-pointer'
                    style={{
                      left: `${((leading - 0.8) / 2.2) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                  <input
                    type='range'
                    min='0.8'
                    max='3'
                    step='0.1'
                    value={leading}
                    onChange={e => setLeading(Number(e.target.value))}
                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                  />
                </div>
                <span className='text-xs text-muted-foreground w-8'>{leading}</span>
              </div>
            </div>
          </div>

          <Button onClick={resetToDefaults} variant='outline' size='sm' className='text-xs'>
            <RotateCcw className='w-3 h-3 mr-2' />
            Reset
          </Button>
        </div>
      </div>

      {/* Main Text Display Area - The rounded frame */}
      <div className='rounded-[80px] border border-gray-400/30 overflow-hidden'>
        <div
          className={`min-h-[60vh] flex items-center justify-center p-8 transition-colors duration-300 ${colorMode === 'white' ? 'bg-black' : 'bg-white'}`}
        >
          <div
            ref={textRef}
            style={previewStyle}
            className='break-words max-w-full outline-none cursor-text'
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onInput={handleTextInput}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            {text}
          </div>
        </div>
      </div>

      {/* Bottom Control Panel - Outside the frame */}
      <div className='px-8 py-4 bg-background/95 backdrop-blur-lg'>
        <div className='grid grid-cols-2 gap-8'>
          {/* Text Controls */}
          <div className='space-y-4'>
            <div className='grid grid-cols-[auto_1fr] items-center gap-4'>
              <span className='text-sm font-medium text-muted-foreground'>Columns</span>
              <div className='flex items-center gap-2'>
                {(['single', 'double', 'triple'] as const).map(col => (
                  <Button
                    key={col}
                    variant={columns === col ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setColumns(col)}
                    className={`h-6 px-3 text-xs transition-all duration-200 ${columns === col ? 'bg-white text-black hover:bg-white/90' : 'hover:bg-white hover:text-black'}`}
                  >
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div className='grid grid-cols-[auto_1fr] items-center gap-4'>
              <span className='text-sm font-medium text-muted-foreground'>Color Mode</span>
              <div className='flex items-center gap-2'>
                {(['white', 'black'] as const).map(mode => (
                  <Button
                    key={mode}
                    variant={colorMode === mode ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => setColorMode(mode)}
                    className={`h-6 px-3 text-xs transition-all duration-200 ${colorMode === mode ? 'bg-white text-black hover:bg-white/90' : 'hover:bg-white hover:text-black'}`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Font Info */}
          <div className='flex items-center justify-end'>
            <div className='flex gap-4'>
              <div className='flex flex-col items-center px-4 py-2 rounded-full bg-white/10 border border-gray-400/30 backdrop-blur-sm'>
                <span className='text-xs text-muted-foreground/70'>Font</span>
                <span className='text-sm font-semibold text-foreground'>Espacio Ideal</span>
              </div>
              <div className='flex flex-col items-center px-4 py-2 rounded-full bg-white/10 border border-gray-400/30 backdrop-blur-sm'>
                <span className='text-xs text-muted-foreground/70'>Weight</span>
                <span className='text-sm font-semibold text-foreground'>{fontWeight}</span>
              </div>
              <div className='flex flex-col items-center px-4 py-2 rounded-full bg-white/10 border border-gray-400/30 backdrop-blur-sm'>
                <span className='text-xs text-muted-foreground/70'>Chars</span>
                <span className='text-sm font-semibold text-foreground'>{text.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
