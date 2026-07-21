"use client";

import { useRef, useCallback } from "react";
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Link, Image, Quote, Code } from "lucide-react";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const buttons = [
  { icon: Bold, syntax: ['**', '**'], label: 'Bold' },
  { icon: Italic, syntax: ['*', '*'], label: 'Italic' },
  { icon: Heading1, syntax: ['\n# ', ''], label: 'Heading 1' },
  { icon: Heading2, syntax: ['\n## ', ''], label: 'Heading 2' },
  { icon: Link, syntax: ['[', '](url)'], label: 'Link' },
  { icon: Image, syntax: ['![', '](url)'], label: 'Image' },
  { icon: List, syntax: ['\n- ', ''], label: 'Bullet list' },
  { icon: ListOrdered, syntax: ['\n1. ', ''], label: 'Numbered list' },
  { icon: Quote, syntax: ['\n> ', ''], label: 'Quote' },
  { icon: Code, syntax: ['\n```\n', '\n```\n'], label: 'Code block' },
];

export default function MarkdownEditor({ value, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insert = useCallback((syntax: string[]) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);
    const newText = before + syntax[0] + selected + syntax[1] + after;
    onChange(newText);
    requestAnimationFrame(() => {
      ta.focus();
      const cursor = before.length + syntax[0].length + selected.length + syntax[1].length;
      ta.setSelectionRange(cursor, cursor);
    });
  }, [value, onChange]);

  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center gap-0.5 p-1.5 bg-white/5 border-b border-white/10 flex-wrap">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={() => insert(btn.syntax)}
            title={btn.label}
            className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
          >
            <btn.icon className="w-4 h-4" />
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={16}
        className="w-full bg-[#0a0a0a] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-y font-mono"
        placeholder="Write your lesson content in Markdown..."
      />
    </div>
  );
}
