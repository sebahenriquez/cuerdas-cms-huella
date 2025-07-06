
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
        // Permitir HTML directo
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
      // Preservar HTML y convertir saltos de línea
      const htmlContent = editor.getHTML();
      onChange(htmlContent);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 border rounded-md',
      },
      // Permitir pegado de HTML
      handlePaste: (view, event) => {
        const clipboardData = event.clipboardData;
        if (clipboardData) {
          const htmlData = clipboardData.getData('text/html');
          const textData = clipboardData.getData('text/plain');
          
          if (htmlData) {
            // Si hay HTML, insertarlo directamente
            const selection = view.state.selection;
            const transaction = view.state.tr.insertText(htmlData, selection.from, selection.to);
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

        {/* Nuevos botones para saltos de línea */}
        <Button
          variant="ghost"
          size="sm"
          onClick={insertLineBreak}
          title="Insertar salto de línea (BR)"
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
          title="Insertar <br> manual"
          className="text-xs"
        >
          &lt;br&gt;
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertManualHTML('<p></p>')}
          title="Insertar <p> manual"
          className="text-xs"
        >
          &lt;p&gt;
        </Button>
      </div>

      {/* Editor */}
      <div className="bg-background">
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>

      {/* Instrucciones */}
      <div className="bg-muted/30 p-2 text-xs text-muted-foreground border-t">
        <strong>Tip:</strong> Usa los botones para insertar saltos de línea o escribe HTML directamente (ej: &lt;br&gt;, &lt;p&gt;&lt;/p&gt;)
      </div>
    </div>
  );
};

export default RichTextEditor;
