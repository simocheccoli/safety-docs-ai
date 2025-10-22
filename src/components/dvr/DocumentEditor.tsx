import { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface DocumentEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function DocumentEditor({ content, onChange }: DocumentEditorProps) {
  const quillRef = useRef<ReactQuill>(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  return (
    <div className="h-full flex flex-col border rounded-lg overflow-hidden">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={onChange}
        modules={modules}
        formats={formats}
        className="flex-1 flex flex-col"
        style={{ height: '100%' }}
      />
    </div>
  );
}