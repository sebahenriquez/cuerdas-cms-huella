
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Heading1, Heading2, Heading3, Type, List, ListOrdered, Quote, Undo, Redo } from 'lucide-react';

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
            class: 'mb-2',
          },
        },
        heading: {
          HTMLAttributes: {
            class: 'font-bold mb-2',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc ml-4 mb-2',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal ml-4 mb-2',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-300 pl-4 italic mb-2',
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
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[200px] p-4 border rounded-md',
      },
      handlePaste: (view, event, slice) => {
        const clipboardData = event.clipboardData;
        if (clipboardData) {
          const htmlData = clipboardData.getData('text/html');
          const textData = clipboardData.getData('text/plain');
          
          if (htmlData && htmlData.trim() !== '') {
            // Limpiar HTML manteniendo estructura básica
            let cleanHtml = htmlData
              .replace(/<meta[^>]*>/gi, '')
              .replace(/<style[^>]*>.*?<\/style>/gi, '')
              .replace(/<script[^>]*>.*?<\/script>/gi, '')
              .replace(/class="[^"]*"/gi, '')
              .replace(/style="[^"]*"/gi, '')
              .replace(/<span[^>]*>/gi, '')
              .replace(/<\/span>/gi, '')
              .replace(/<font[^>]*>/gi, '')
              .replace(/<\/font>/gi, '');
            
            // Usar el comando insertContent de TipTap para manejar el HTML
            editor.commands.insertContent(cleanHtml);
            return true;
          } else if (textData) {
            // Para texto plano, dividir en párrafos
            const paragraphs = textData
              .split('\n\n')
              .map(p => p.trim())
              .filter(p => p.length > 0);
            
            if (paragraphs.length > 1) {
              const content = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
              editor.commands.insertContent(content);
            } else {
              editor.commands.insertContent(textData.replace(/\n/g, '<br>'));
            }
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

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar mejorada */}
      <div className="border-b bg-muted/50 p-2 flex items-center space-x-1 flex-wrap gap-1">
        <div className="flex items-center space-x-1">
          <Button
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            title="Negrita"
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            title="Cursiva"
          >
            <Italic className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-2" />

        <div className="flex items-center space-x-1">
          <Button
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Título 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>

          <Button
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Título 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>

          <Button
            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Título 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>

          <Button
            variant={editor.isActive('paragraph') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setParagraph().run()}
            title="Párrafo"
          >
            <Type className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-2" />

        <div className="flex items-center space-x-1">
          <Button
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Lista con viñetas"
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Lista numerada"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Button
            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Cita"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-2" />

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            title="Deshacer"
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            title="Rehacer"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-background">
        <EditorContent editor={editor} />
      </div>

      {/* Ayuda mejorada */}
      <div className="bg-muted/30 p-2 text-xs text-muted-foreground border-t">
        <strong>Tip:</strong> Pega texto desde cualquier fuente - se limpiará automáticamente. Usa Ctrl+Z/Ctrl+Y para deshacer/rehacer.
      </div>
    </div>
  );
};

export default RichTextEditor;
