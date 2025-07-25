import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Shuffle } from 'lucide-react';

// Import Espacio Ideal font
import '/fonts/Espacio Ideal.otf';

export default function TypographyPlayground({
    fontWeight = "400",
}: {
    fontWeight?: string
}) {
    const [text, setText] = useState("Espacio Ideal");
    const [textColor, setTextColor] = useState("#FFFFFF");
    const [dynamicFontSize, setDynamicFontSize] = useState(80);
    const textRef = useRef<HTMLDivElement>(null);
    const [isControlsOpen, setIsControlsOpen] = useState(false);

    useEffect(() => {
        const textLength = text.length;
        let basesize = 80;
        let CalculatedSize = basesize;
        if (textLength <= 10) CalculatedSize = basesize;
        else if (textLength <= 30) CalculatedSize = basesize * 0.8;
        else if (textLength <= 60) CalculatedSize = basesize * 0.6;
        else if (textLength <= 100) CalculatedSize = basesize * 0.45;
        else if (textLength <= 200) CalculatedSize = basesize * 0.35;
        else CalculatedSize = Math.max(CalculatedSize, 16);

        setDynamicFontSize(CalculatedSize)
    }, [text]);

    const previewStyle: React.CSSProperties = {
        fontFamily: 'Espacio Ideal, sans-serif',
        fontWeight: fontWeight,
        fontSize: `${dynamicFontSize}px`,
        color: textColor,
        lineHeight: 1.1,
        textTransform: "uppercase" as React.CSSProperties["textTransform"],
        transition: "font-size 0.3s, color 0.2s", 
        direction: 'ltr',
    }

    const handleTextInput = () => {
        if (textRef.current) setText(textRef.current.textContent || "");
    }

    const handleFocus = () => {
        if (textRef.current && textRef.current.textContent === "Espacio Ideal") {
            textRef.current.textContent = "";
            setText("");
        }
    }

    const handleBlur = () => {
        if (textRef.current && textRef.current.textContent?.trim() === "") {
            textRef.current.textContent = "Espacio Ideal";
            setText("Espacio Ideal");
        }
    }

    const generateSampleText = () => {
        const samples = [
            "The quick brown fox jumps over the lazy dog", 
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit", 
            "Aenean lacinia bibendum nulla sed consectetur", 
            "Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor", 
            "Donec sed odio dui", "Donec id elit non mi porta gravida at eget metus", 
            "Nullam id dolor id nibh ultricies vehicula ut id elit", 
            "Cras mattis consectetur purus sit amet fermentum", 
        ]
        const selectedText = samples[Math.floor(Math.random() * samples.length)]
        setText(selectedText)
        if (textRef.current) textRef.current.textContent = selectedText
    }

    return (
        <div className='relative bg-muted/20 rounded-lg overflow-hidden'>
            {/* Controls */}
            <div className='bg-background/95 backdrop-blur px-6 py-4 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>Color</span>
                    <input 
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className='w-8 h-8 rounded border border-input cursor-pointer'
                    />
                    <input 
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        placeholder='#ffffff'
                        className='w-24 h-8 text-xs font-mono'
                    />
                </div>
                <div className='flex items-center gap-3'>
                    <Button
                        onClick={generateSampleText}
                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-x1 transition-all duration-300 group"
                        size="sm"
                    >
                        <Shuffle className='w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-300' />
                        Generate Sample
                    </Button>
                    <Button
                        onClick={() => setIsControlsOpen(!isControlsOpen)}
                        variant="outline"
                        size="sm"
                        className="transition-all duration-200 hover:bg-muted/50"
                    >
                        <Settings
                            className={`w-4 h-4 mr-2 transition-transform duration-200 ${isControlsOpen ? "rotate-90" : ""}`}
                        />
                        Controls
                    </Button>
                </div>
            </div>
            {/* Preview */}
            <div className='px-6 py-10'>
                <div className='min-h-[40vh] flex items-center justify-center'>
                    <div
                        ref={textRef}
                        style={previewStyle}
                        className='text-center break-words max-w-full leading-tight px-4 outline-none cursor-text'
                        contentEditable
                        suppressContentEditableWarning
                        spellCheck={false}
                        onInput={handleTextInput}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        dir="ltr"
                    >
                        {text}
                    </div>
                </div>
            </div>
            {/* Footer Info */}
            <div className='bg-background/95 backdrop-blur px-6 py-3'>
                <div className='flex items-center justify-center gap-8 text-xs text-muted-foreground'>
                    <span>Font: Espacio Ideal</span>
                    <span>Size: {Math.round(dynamicFontSize)}</span>
                    <span>Weight: {fontWeight}</span>
                    <span>Characters: {text.length}</span>
                </div>
            </div>
        </div>
    )
}
    