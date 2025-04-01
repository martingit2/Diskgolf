// components/rich-text-editor.tsx
'use client';

import { useEditor, EditorContent, Editor, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Bold, Italic, List, ListOrdered, Heading2, Pilcrow, Minus, Link as LinkIcon, Code
} from 'lucide-react';
import { cn } from '@/app/lib/utils';


// --- Toolbar Komponent (Uendret) ---
interface ToolbarProps {
    editor: Editor | null;
    isHtmlMode: boolean;
    onToggleHtmlMode: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ editor, isHtmlMode, onToggleHtmlMode }) => {
    // ... (Toolbar-kode forblir den samme som i forrige korrekte versjon) ...
     if (!editor && !isHtmlMode) {
        return null;
    }

    const handleLink = useCallback(() => {
        if (!editor || !editor.can().toggleLink({ href: '' })) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Skriv inn URL', previousUrl || '');
        if (url === null) return;
        editor.chain().focus().extendMarkRange('link').toggleLink({ href: url }).run();
    }, [editor]);

    return (
        <div className="flex flex-wrap items-center justify-between gap-1 rounded-t-md border border-input bg-transparent p-2 print:hidden">
             <div className={cn("flex flex-wrap items-center gap-1", isHtmlMode ? "hidden" : "flex")}>
                {editor && <>
                    <Toggle size="sm" pressed={editor.isActive('paragraph')} onPressedChange={() => editor.chain().focus().setParagraph().run()} aria-label="Paragraph" title="Paragraph"> <Pilcrow className="h-4 w-4" /> </Toggle>
                    <Toggle size="sm" pressed={editor.isActive('heading', { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} aria-label="Heading 2" title="Heading 2"> <Heading2 className="h-4 w-4" /> </Toggle>
                    <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} aria-label="Bold" title="Bold"> <Bold className="h-4 w-4" /> </Toggle>
                    <Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} aria-label="Italic" title="Italic"> <Italic className="h-4 w-4" /> </Toggle>
                    <Toggle size="sm" pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} aria-label="Bullet List" title="Bullet List"> <List className="h-4 w-4" /> </Toggle>
                    <Toggle size="sm" pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} aria-label="Numbered List" title="Numbered List"> <ListOrdered className="h-4 w-4" /> </Toggle>
                    <Toggle size="sm" pressed={editor.isActive('link')} onPressedChange={handleLink} disabled={!editor.can().toggleLink({ href: '' })} aria-label="Link" title="Link"> <LinkIcon className="h-4 w-4" /> </Toggle>
                    <Toggle size="sm" pressed={false} onPressedChange={() => editor.chain().focus().setHorizontalRule().run()} disabled={!editor.can().setHorizontalRule()} aria-label="Horizontal Rule" title="Horizontal Rule"> <Minus className="h-4 w-4" /> </Toggle>
                </>}
            </div>
            <div>
                <Button variant="ghost" size="sm" onClick={onToggleHtmlMode} type="button" aria-pressed={isHtmlMode} title={isHtmlMode ? "Vis visuell editor" : "Vis HTML-kode"}>
                    <Code className="h-4 w-4" />
                    <span className="sr-only">{isHtmlMode ? "Vis visuell editor" : "Vis HTML-kode"}</span>
                </Button>
            </div>
        </div>
    );
};

// --- Hoved RichTextEditor Komponent ---
interface RichTextEditorProps {
    content: string;
    onChange: (newContent: string) => void; // Denne skal kalles med siste innhold
    disabled?: boolean;
    className?: string;
    placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    content,
    onChange, // Dette er funksjonen fra form-biblioteket (f.eks. field.onChange)
    disabled = false,
    className,
    placeholder
}) => {
    const [viewMode, setViewMode] = useState<'wysiwyg' | 'html'>('wysiwyg');
    const [rawHtml, setRawHtml] = useState<string>(content);
    const isUpdatingInternally = useRef(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ /* ... */ }),
            Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
        ],
        content: content,
        editable: !disabled,
        onUpdate: ({ editor }) => {
            // Kun kall onChange fra WYSIWYG-modus
            if (viewMode === 'wysiwyg' && !isUpdatingInternally.current) {
                const currentHtml = editor.getHTML();
                setRawHtml(currentHtml); // Synkroniser rå HTML
                onChange(currentHtml); // *** Kall parent onChange ***
            }
            isUpdatingInternally.current = false;
        },
        editorProps: {
            attributes: {
                class: cn(/* ... klasser ... */),
                'data-placeholder': placeholder || 'Skriv her...',
            },
        },
    });

    // Effekt for eksterne 'content'-endringer (Uendret)
    useEffect(() => {
        const editorHtml = editor?.getHTML();
        // Sjekk mot både editor og rawHtml for å fange alle tilfeller
        const contentChangedExternally = (editor && content !== editorHtml) || content !== rawHtml;

        if (editor && contentChangedExternally) {
             isUpdatingInternally.current = true;
             editor.commands.setContent(content, false);
             setRawHtml(content);
             // Ikke kall onChange her, endringen kom utenfra
        }
    }, [content, editor]); // Bare avhengig av content og editor


    // Funksjon for å bytte modus (Uendret - kaller onChange ved bytte TILBAKE til WYSIWYG)
    const toggleHtmlMode = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (!editor) return;

        if (viewMode === 'wysiwyg') {
            setRawHtml(editor.getHTML());
            setViewMode('html');
            // Ikke kall onChange her, brukeren har ikke endret noe ennå
        } else {
            try {
                isUpdatingInternally.current = true;
                editor.commands.setContent(rawHtml, true);
                setViewMode('wysiwyg');
                const validatedHtml = editor.getHTML();
                if(rawHtml !== validatedHtml) {
                    setRawHtml(validatedHtml);
                }
                onChange(validatedHtml); // *** Kall parent onChange med validert HTML ***
            } catch (error) {
                console.error("Ugyldig HTML:", error);
                alert("Kunne ikke bytte tilbake: HTML-koden inneholder feil.");
                isUpdatingInternally.current = false;
            }
        }
    }, [editor, viewMode, rawHtml, onChange]);

    // --- ***** VIKTIG ENDRING HER ***** ---
    // Håndterer endringer i HTML-tekstområdet
    const handleRawHtmlChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newHtml = event.target.value;
        setRawHtml(newHtml); // Oppdater lokal state
        // *** Kall parent onChange direkte med den nye rå HTML-en ***
        // Dette sikrer at form-biblioteket får den siste verdien
        // selv om brukeren ikke bytter tilbake til WYSIWYG-modus.
        onChange(newHtml);
    };
    // --- ***** SLUTT PÅ ENDRING ***** ---

    // Rydd opp editor ved unmount (Uendret)
    useEffect(() => {
        return () => {
            editor?.destroy();
        };
    }, [editor]);


    const editorTextareaClasses = cn(
        'min-h-[200px] w-full max-w-none rounded-b-md border border-input border-t-0 bg-background px-3 py-2',
        'font-mono text-sm',
        'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        disabled ? 'cursor-not-allowed opacity-50' : ''
    );

    // Debugging log (Uendret)
    // if(viewMode === 'html') {
    //     console.log("Rendering Textarea:", { disabledProp: disabled, rawHtmlValue: rawHtml });
    // }

    return (
        <div className={cn(
            "rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
             disabled ? "cursor-not-allowed bg-muted/50" : "bg-background",
             className
        )}>
            <Toolbar editor={editor} isHtmlMode={viewMode === 'html'} onToggleHtmlMode={toggleHtmlMode} />

            {viewMode === 'wysiwyg' ? (
                 <div key="wysiwyg-editor">
                    <EditorContent editor={editor} />
                 </div>
            ) : (
                <Textarea
                    key="html-editor"
                    value={rawHtml}
                    onChange={handleRawHtmlChange} // *** Viktig: Denne kaller nå parent onChange ***
                    disabled={disabled}
                    placeholder="Skriv eller lim inn HTML-kode her..."
                    className={editorTextareaClasses}
                    aria-label="HTML kode editor"
                />
            )}
        </div>
    );
};

export default RichTextEditor;