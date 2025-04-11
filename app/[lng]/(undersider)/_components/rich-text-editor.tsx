// Fil: src/components/rich-text-editor.tsx
// Formål: Komponent som tilbyr en rik teksteditor (WYSIWYG) basert på Tiptap, med mulighet for å bytte til og redigere rå HTML. Inkluderer en toolbar for grunnleggende formatering og placeholder-tekst.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.




'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react'; // Fjernet ubrukt BubbleMenu
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder'; // <-- Importer Placeholder
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Bold, Italic, List, ListOrdered, Heading2, Pilcrow, Minus, Link as LinkIcon, Code
} from 'lucide-react';
import { cn } from '@/app/lib/utils';


// --- Toolbar Komponent (Uendret fra din versjon) ---
interface ToolbarProps {
    editor: Editor | null;
    isHtmlMode: boolean;
    onToggleHtmlMode: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ editor, isHtmlMode, onToggleHtmlMode }) => {
     if (!editor && !isHtmlMode) {
        return null;
    }

    // Oppdatert handleLink for å håndtere fjerning av lenke
    const handleLink = useCallback(() => {
        if (!editor) return; // Sjekk for editor først
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Skriv inn URL (la stå tom for å fjerne lenken)', previousUrl || '');

        if (url === null) { // Bruker avbrøt
            return;
        }

        if (url === '') { // Bruker vil fjerne lenken
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // Sett eller oppdater lenken
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
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
                    {/* Endret disabled sjekk for Link */}
                    <Toggle size="sm" pressed={editor.isActive('link')} onPressedChange={handleLink} aria-label="Link" title="Link"> <LinkIcon className="h-4 w-4" /> </Toggle>
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
    onChange: (newContent: string) => void;
    disabled?: boolean;
    className?: string;
    placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    content,
    onChange,
    disabled = false,
    className,
    placeholder = 'Skriv her...' // Sett default placeholder
}) => {
    const [viewMode, setViewMode] = useState<'wysiwyg' | 'html'>('wysiwyg');
    const [rawHtml, setRawHtml] = useState<string>(content);
    const isUpdatingInternally = useRef(false); // For å unngå loops

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Konfigurasjoner her om nødvendig
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                linkOnPaste: true,
            }),
             Placeholder.configure({ // <-- Legg til Placeholder extension
                 placeholder: placeholder,
                 // Du kan legge til klasser for placeholderen her om nødvendig:
                 // emptyEditorClass: 'is-editor-empty',
                 // emptyNodeClass: 'is-node-empty',
             }),
        ],
        content: content, // Startinnhold
        editable: !disabled, // Editor kan redigeres hvis ikke disabled
        // Kalles når editor-innhold endres
        onUpdate: ({ editor }) => {
            if (viewMode === 'wysiwyg' && !isUpdatingInternally.current) {
                const currentHtml = editor.getHTML();
                setRawHtml(currentHtml); // Synkroniser HTML-state
                onChange(currentHtml); // Kall parent onChange
            }
            isUpdatingInternally.current = false; // Reset flagg
        },
        editorProps: {
            attributes: {
                // --- ✨ KORREKT BRUK AV cn() MED MINIMUMSHØYDE ✨ ---
                class: cn(
                    'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none', // Tailwind Typography klasser
                    'rounded-b-md border border-input border-t-0 bg-background px-3 py-2', // Standard boks-styling
                    'min-h-[250px]', // <--- MINIMUMSHØYDE SATT HER
                    disabled ? 'cursor-not-allowed opacity-50' : '',
                    // Fjernet data-placeholder, Placeholder extension håndterer dette
                ),
            },
        },
    });

    // Effekt for å håndtere eksterne endringer i 'content' prop (fra din versjon)
    useEffect(() => {
        const editorHtml = editor?.getHTML();
        const contentChangedExternally = (editor && content !== editorHtml) || content !== rawHtml;

        if (editor && contentChangedExternally && !isUpdatingInternally.current) {
             isUpdatingInternally.current = true; // Sett flagg FØR oppdatering
             editor.commands.setContent(content, false); // false for ikke å trigge onUpdate
             setRawHtml(content); // Synkroniser rawHtml også
             // Ikke kall onChange her, endringen kom utenfra
             // Reset flagg etter en liten forsinkelse for å unngå race conditions
             // setTimeout(() => { isUpdatingInternally.current = false; }, 0);
             // Eller reset i onUpdate som vi allerede gjør
        }
        // Hvis flagget var satt, reset det når effekten kjører igjen
        // else if (isUpdatingInternally.current) {
        //     isUpdatingInternally.current = false;
        // }

    }, [content, editor, rawHtml]); // Avhengig av content, editor og rawHtml


    // Funksjon for å bytte modus (fra din versjon)
    const toggleHtmlMode = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (!editor) return;

        if (viewMode === 'wysiwyg') {
            setRawHtml(editor.getHTML());
            setViewMode('html');
        } else {
            try {
                isUpdatingInternally.current = true;
                editor.commands.setContent(rawHtml, true); // true for å parse og validere
                setViewMode('wysiwyg');
                const validatedHtml = editor.getHTML();
                if(rawHtml !== validatedHtml) {
                    setRawHtml(validatedHtml); // Oppdater hvis Tiptap endret noe
                }
                onChange(validatedHtml); // Kall parent onChange med validert HTML
            } catch (error) {
                console.error("Ugyldig HTML:", error);
                alert("Kunne ikke bytte tilbake: HTML-koden inneholder feil.");
                isUpdatingInternally.current = false; // Reset flagg ved feil også
            }
        }
    }, [editor, viewMode, rawHtml, onChange]);

    // Håndterer endringer i HTML-tekstområdet (fra din versjon)
    const handleRawHtmlChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newHtml = event.target.value;
        setRawHtml(newHtml); // Oppdater lokal state
        onChange(newHtml); // Kall parent onChange direkte
    };

    // Rydd opp editor ved unmount (fra din versjon)
    useEffect(() => {
        return () => {
            editor?.destroy();
        };
    }, [editor]);


    // Klasser for HTML Textarea, legg til samme minimumshøyde
    const editorTextareaClasses = cn(
        'min-h-[250px] w-full max-w-none rounded-b-md border border-input border-t-0 bg-background px-3 py-2', // <-- MATCH min-h
        'font-mono text-sm whitespace-pre-wrap', // Viser linjeskift riktig
        'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        disabled ? 'cursor-not-allowed opacity-50' : ''
    );

    return (
        <div className={cn(
            "rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
             disabled ? "cursor-not-allowed bg-muted/50" : "bg-background",
             className
        )}>
            <Toolbar editor={editor} isHtmlMode={viewMode === 'html'} onToggleHtmlMode={toggleHtmlMode} />

            {viewMode === 'wysiwyg' ? (
                 <div key="wysiwyg-editor">
                    {/* Bruker Tiptaps EditorContent for visning */}
                    <EditorContent editor={editor} />
                 </div>
            ) : (
                <Textarea
                    key="html-editor"
                    value={rawHtml}
                    onChange={handleRawHtmlChange}
                    disabled={disabled}
                    placeholder="Skriv eller lim inn HTML-kode her..."
                    className={editorTextareaClasses}
                    aria-label="HTML kode editor"
                    spellCheck="false" // Skru av stavekontroll for kode
                />
            )}
        </div>
    );
};

export default RichTextEditor;