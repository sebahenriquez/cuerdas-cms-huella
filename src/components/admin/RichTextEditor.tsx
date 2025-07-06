
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Heading1, Heading2, Heading3, Type, ArrowDown } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Escribe tu contenido aquí...'
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'paragraph-block',
          },
        },
        hardBreak: {
          HTMLAttributes: {
            class: 'line-break',
          },
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const htmlContent = editor.getHTML();
      onChange(htmlContent);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 border rounded-md',
      },
      handlePaste: (view, event, slice) => {
        const clipboardData = event.clipboardData;
        if (clipboardData) {
          const htmlData = clipboardData.getData('text/html');
          const textData = clipboardData.getData('text/plain');
          
          // Si hay HTML, procesarlo de manera inteligente
          if (htmlData && htmlData.trim() !== '') {
            // Limpiar HTML innecesario y mantener solo formateo básico
            let cleanHtml = htmlData
              .replace(/<meta[^>]*>/gi, '')
              .replace(/<style[^>]*>.*?<\/style>/gi, '')
              .replace(/<script[^>]*>.*?<\/script>/gi, '')
              .replace(/class="[^"]*"/gi, '')
              .replace(/style="[^"]*"/gi, '')
              .replace(/<span[^>]*>/gi, '')
              .replace(/<\/span>/gi, '')
              .replace(/<div[^>]*>/gi, '<p>')
              .replace(/<\/div>/gi, '</p>')
              .replace(/<font[^>]*>/gi, '')
              .replace(/<\/font>/gi, '');
            
            // Insertar el HTML limpio
            const { state } = view;
            const { selection } = state;
            const transaction = state.tr.replaceSelectionWith(
              state.schema.text(cleanHtml)
            );
            view.dispatch(transaction);
            return true;
          } else if (textData) {
            // Para texto plano, convertir saltos de línea dobles en párrafos
            const processedText = textData
              .split('\n\n')
              .map(paragraph => paragraph.trim())
              .filter(paragraph => paragraph.length > 0)
              .map(paragraph => {
                // Convertir saltos de línea simples en <br>
                return paragraph.replace(/\n/g, '<br>');
              })
              .join('</p><p>');
            
            const htmlToInsert = processedText ? `<p>${processedText}</p>` : textData;
            
            const { state } = view;
            const { selection } = state;
            const transaction = state.tr.insertText(htmlToInsert, selection.from, selection.to);
            view.dispatch(transaction);
            return true;
          }
        }
        return false;
      },
    },
  });

  if (!editor) {
    return null;
  }

  const insertLineBreak = () => {
    editor.chain().focus().setHardBreak().run();
  };

  const insertParagraphBreak = () => {
    editor.chain().focus().splitBlock().run();
  };

  const insertManualHTML = (htmlTag: string) => {
    const selection = editor.state.selection;
    const transaction = editor.state.tr.insertText(htmlTag, selection.from, selection.to);
    editor.view.dispatch(transaction);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-muted/50 p-2 flex items-center space-x-1 flex-wrap">
        <Button
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-2" />

        <Button
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive('paragraph') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Type className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-2" />

        <Button
          variant="ghost"
          size="sm"
          onClick={insertLineBreak}
          title="Insertar salto de línea"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={insertParagraphBreak}
          title="Nuevo párrafo"
          className="text-xs"
        >
          ¶
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertManualHTML('<br>')}
          title="Insertar <br>"
          className="text-xs"
        >
          BR
        </Button>
      </div>

      {/* Editor */}
      <div className="bg-background">
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>

      {/* Instrucciones mejoradas */}
      <div className="bg-muted/30 p-2 text-xs text-muted-foreground border-t">
        <strong>Tip:</strong> Pega texto normalmente - se convertirá automáticamente. Usa los botones para formateo adicional.
      </div>
    </div>
  );
};

export default RichTextEditor;
