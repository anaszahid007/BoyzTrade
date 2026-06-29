"use client";

import { useMemo } from "react";
import { marked } from "marked";

interface Props {
  content: string;
}

export default function MarkdownRenderer({ content }: Props) {
  const html = useMemo(() => {
    return marked.parse(content, { breaks: true, gfm: true });
  }, [content]);

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
