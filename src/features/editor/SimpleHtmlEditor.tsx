"use client";

import { useId, useState } from "react";
import { Card } from "@/shared/components/ui/Card";

type HtmlEditorCommand = {
  id: string;
  label: string;
  before: string;
  after: string;
  placeholder: string;
};

type SimpleHtmlEditorProps = {
  label?: string;
  name?: string;
  defaultValue?: string;
  helperText?: string;
};

const open = (name: string) => String.fromCharCode(60) + name + String.fromCharCode(62);
const close = (name: string) => String.fromCharCode(60) + "/" + name + String.fromCharCode(62);

const htmlEditorCommands: HtmlEditorCommand[] = [
  { id: "h2", label: "H2", before: open("h2"), after: close("h2"), placeholder: "소제목" },
  { id: "strong", label: "굵게", before: open("strong"), after: close("strong"), placeholder: "강조 텍스트" },
  { id: "em", label: "기울임", before: open("em"), after: close("em"), placeholder: "기울임 텍스트" },
  { id: "quote", label: "인용", before: open("blockquote"), after: close("blockquote"), placeholder: "인용문" },
  { id: "code", label: "코드", before: open("code"), after: close("code"), placeholder: "code" },
  { id: "ul", label: "목록", before: open("ul") + "\n  " + open("li"), after: close("li") + "\n" + close("ul"), placeholder: "목록 항목" },
];

const defaultPostHtml = [
  open("p") + "장비 소개나 정비 경험을 적어주세요." + close("p"),
  open("p") + "사진, 부품명, 교체 주기, 느낀 점을 함께 적으면 더 좋아요." + close("p"),
].join("\n");

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
