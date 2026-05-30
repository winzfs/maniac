"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Card } from "@/shared/components/ui/Card";

type SimpleHtmlEditorProps = {
  label?: string;
  name?: string;
  defaultValue?: string;
  helperText?: string;
};

type UploadedImageResponse = {
  ok?: boolean;
  image?: {
    public_url?: string;
  };
  error?: string;
};

const open = (name: string) => String.fromCharCode(60) + name + String.fromCharCode(62);
const close = (name: string) => String.fromCharCode(60) + "/" + name + String.fromCharCode(62);

const defaultPostHtml = [
  open("p") + "장비 소개나 정비 경험을 적어주세요." + close("p"),
  open("p") + "사진, 부품명, 교체 주기, 느낀 점을 함께 적으면 더 좋아요." + close("p"),
].join("");

function closestElementFromSelection(selector: string) {
  const selection = window.getSelection();
  const node = selection?.anchorNode;
  const element = node?.nodeType === Node.ELEMENT_NODE ? node as Element : node?.parentElement;
  return element?.closest(selector) ?? null;
}

function insertImageElement(imageUrl: string) {
  const imageHtml = `<img src="${imageUrl}" alt="게시글 이미지">`;
  document.execCommand("insertHTML", false, imageHtml);
}

async function uploadPostImage(file: File) {
  const formData = new FormData();
  formData.set("image", file);

  const response = await fetch("/api/uploads/post-image", {
    method: "POST",
    body: formData,
    credentials: "same-origin",
  });

  const data = await response.json().catch(() => null) as UploadedImageResponse | null;

  if (!response.ok || !data?.image?.public_url) {
    throw new Error(data?.error || "이미지 업로드에 실패했습니다.");
  }

  return data.image.public_url;
}

export function SimpleHtmlEditor({ label = "본문", name = "bodyHtml", defaultValue = defaultPostHtml, helperText }: SimpleHtmlEditorProps) {
  const editorId = useId();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [imageStatus, setImageStatus] = useState<string>("");

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML.trim() === "") {
      editorRef.current.innerHTML = defaultValue;
    }
  }, [defaultValue]);

  const syncValue = () => {
    setValue(editorRef.current?.innerHTML ?? "");
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const runCommand = (command: string, detail?: string) => {
    focusEditor();
    document.execCommand(command, false, detail);
    syncValue();
  };

  const toggleBlock = (tagName: "h2" | "blockquote") => {
    focusEditor();
    const current = closestElementFromSelection(tagName);
    document.execCommand("formatBlock", false, current ? "p" : tagName);
    syncValue();
  };

  const toggleLink = () => {
    focusEditor();
    const existingLink = closestElementFromSelection("a");
    if (existingLink) {
      document.execCommand("unlink");
      syncValue();
      return;
    }

    const url = window.prompt("링크 URL을 입력하세요.");
    if (!url) return;
    const safeUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    document.execCommand("createLink", false, safeUrl);
    syncValue();
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageStatus("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    setImageStatus("이미지 업로드 중...");
    try {
      const imageUrl = await uploadPostImage(file);
      focusEditor();
      insertImageElement(imageUrl);
      syncValue();
      setImageStatus("이미지가 업로드되어 본문에 삽입되었습니다.");
    } catch (error) {
      setImageStatus(error instanceof Error ? error.message : "이미지를 업로드하지 못했습니다.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <Card className="min-w-0 space-y-4 overflow-hidden p-4 sm:p-5">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <label htmlFor={editorId} className="font-semibold text-text-primary">{label}</label>
          <p className="mt-1 text-xs leading-5 text-text-secondary">{helperText ?? "선택한 텍스트에 바로 서식을 적용하는 간단 WYSIWYG 에디터입니다. 이미지는 서버에 업로드한 뒤 본문에는 URL로 삽입합니다."}</p>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
      </div>

      <div className="flex min-w-0 max-w-full gap-2 overflow-x-auto overflow-y-hidden rounded-[1.25rem] border border-border bg-background p-2">
        <button type="button" className="shrink-0 rounded-full bg-surface px-3 py-2 text-xs font-bold" onClick={() => runCommand("undo")}>실행취소</button>
        <button type="button" className="shrink-0 rounded-full bg-surface px-3 py-2 text-xs font-bold" onClick={() => runCommand("redo")}>다시실행</button>
        <button type="button" className="shrink-0 rounded-full bg-surface px-3 py-2 text-xs font-bold" onClick={() => runCommand("bold")}>굵게</button>
        <button type="button" className="shrink-0 rounded-full bg-surface px-3 py-2 text-xs font-bold" onClick={() => runCommand("italic")}>기울임</button>
        <button type="button" className="shrink-0 rounded-full bg-surface px-3 py-2 text-xs font-bold" onClick={toggleLink}>링크</button>
        <button type="button" className="shrink-0 rounded-full bg-surface px-3 py-2 text-xs font-bold" onClick={() => toggleBlock("h2")}>H2</button>
        <button type="button" className="shrink-0 rounded-full bg-surface px-3 py-2 text-xs font-bold" onClick={() => toggleBlock("blockquote")}>인용</button>
        <button type="button" className="shrink-0 rounded-full bg-surface px-3 py-2 text-xs font-bold" onClick={() => runCommand("insertUnorderedList")}>목록</button>
        <button type="button" className="shrink-0 rounded-full bg-surface px-3 py-2 text-xs font-bold" onClick={() => fileInputRef.current?.click()}>사진</button>
      </div>

      <div
        id={editorId}
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={syncValue}
        className="min-h-80 w-full min-w-0 max-w-full overflow-x-hidden rounded-[1.5rem] border border-border bg-background p-4 text-base leading-7 outline-none focus:border-graphite sm:text-sm [&_a]:text-garage-orange [&_blockquote]:border-l-4 [&_blockquote]:border-garage-orange [&_blockquote]:pl-4 [&_h2]:text-2xl [&_h2]:font-black [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-2xl"
      />
      <textarea name={name} value={value} readOnly className="hidden" />
      {imageStatus ? <p className="text-xs text-text-secondary">{imageStatus}</p> : null}
    </Card>
  );
}
