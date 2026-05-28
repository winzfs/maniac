"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Card } from "@/shared/components/ui/Card";

type SimpleHtmlEditorProps = {
  label?: string;
  name?: string;
  defaultValue?: string;
  helperText?: string;
};

const maxImageEdge = 2000;
const open = (name: string) => String.fromCharCode(60) + name + String.fromCharCode(62);
const close = (name: string) => String.fromCharCode(60) + "/" + name + String.fromCharCode(62);

const defaultPostHtml = [
  open("p") + "장비 소개나 정비 경험을 적어주세요." + close("p"),
  open("p") + "사진, 부품명, 교체 주기, 느낀 점을 함께 적으면 더 좋아요." + close("p"),
].join("");

function resizeImageFile(file: File, maxEdge = maxImageEdge) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("이미지를 처리할 수 없습니다."));
          return;
        }
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.88));
      };
      image.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
      image.src = String(reader.result);
    };

    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsDataURL(file);
  });
}

function closestElementFromSelection(selector: string) {
  const selection = window.getSelection();
  const node = selection?.anchorNode;
  const element = node?.nodeType === Node.ELEMENT_NODE ? node as Element : node?.parentElement;
  return element?.closest(selector) ?? null;
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

    setImageStatus("이미지 리사이징 중...");
    try {
      const dataUrl = await resizeImageFile(file);
      runCommand("insertImage", dataUrl);
      setImageStatus("이미지가 긴 축 2000px 이하로 삽입되었습니다.");
    } catch {
      setImageStatus("이미지를 처리하지 못했습니다.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <Card className="space-y-4 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <label htmlFor={editorId} className="font-semibold text-text-primary">{label}</label>
          <p className="mt-1 text-xs leading-5 text-text-secondary">{helperText ?? "선택한 텍스트에 바로 서식을 적용하는 간단 WYSIWYG 에디터입니다. 실제 저장 전 서버 sanitize가 필요합니다."}</p>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-[1.25rem] border border-border bg-background p-2">
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
        className="min-h-80 w-full rounded-[1.5rem] border border-border bg-background p-4 text-sm leading-7 outline-none focus:border-graphite [&_a]:text-garage-orange [&_blockquote]:border-l-4 [&_blockquote]:border-garage-orange [&_blockquote]:pl-4 [&_h2]:text-2xl [&_h2]:font-black [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-2xl"
      />
      <textarea name={name} value={value} readOnly className="hidden" />
      {imageStatus ? <p className="text-xs text-text-secondary">{imageStatus}</p> : null}
    </Card>
  );
}
