"use client";

import { useId, useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { htmlEditorCommands, defaultPostHtml } from "./html-editor-config";

type SimpleHtmlEditorProps = {
  label?: string;
  name?: string;
  defaultValue?: string;
  helperText?: string;
};

function insertSnippet(value: string, before: string, after: string, placeholder: string) {
  return `${value}\n${before}${placeholder}${after}`.trim();
}

export function SimpleHtmlEditor({ label = "본문", name = "bodyHtml", defaultValue = defaultPostHtml, helperText }: SimpleHtmlEditorProps) {
  const editorId = useId();
  const [value, setValue] = useState(defaultValue);
  const [isPreview, setIsPreview] = useState(false);

  return (
    <Card className="space-y-4 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <label htmlFor={editorId} className="font-semibold text-text-primary">{label}</label>
          <p className="mt-1 text-xs leading-5 text-text-secondary">{helperText ?? "허용된 간단한 HTML 태그만 사용합니다. 이후 보안 sanitize를 서버에서 한 번 더 적용합니다."}</p>
        </div>
        <div className="flex rounded-full border border-border bg-background p-1 text-xs">
          <button type="button" className={`rounded-full px-3 py-1.5 ${!isPreview ? "bg-surface font-semibold" : "text-text-secondary"}`} onClick={() => setIsPreview(false)}>작성</button>
          <button type="button" className={`rounded-full px-3 py-1.5 ${isPreview ? "bg-surface font-semibold" : "text-text-secondary"}`} onClick={() => setIsPreview(true)}>미리보기</button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {htmlEditorCommands.map((command) => (
          <button
            key={command.id}
            type="button"
            className="shrink-0 rounded-full border border-border bg-surface px-3 py-2 text-xs font-semibold transition hover:bg-background"
            onClick={() => setValue((current) => insertSnippet(current, command.before, command.after, command.placeholder))}
          >
            {command.label}
          </button>
        ))}
      </div>

      {isPreview ? (
        <div className="min-h-64 rounded-[1.5rem] border border-border bg-background p-4 text-sm leading-7 text-text-primary" dangerouslySetInnerHTML={{ __html: value }} />
      ) : (
        <textarea
          id={editorId}
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="min-h-64 w-full resize-y rounded-[1.5rem] border border-border bg-background p-4 font-mono text-sm leading-6 outline-none focus:border-graphite"
          spellCheck={false}
        />
      )}
    </Card>
  );
}
