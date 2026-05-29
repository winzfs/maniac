"use client";

import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Mode = "login" | "signup";

type AuthFormProps = {
  mode: Mode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const isSignup = mode === "signup";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const response = await fetch(isSignup ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(isSignup ? { email, nickname, password } : { email, password }),
      });
      const result = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null;

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error ?? "요청에 실패했습니다.");
      }

      router.replace("/me/");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "요청에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="mx-auto max-w-md space-y-5 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{isSignup ? "회원가입" : "로그인"}</h1>
        <p className="text-sm text-text-secondary">
          {isSignup ? "이메일과 비밀번호로 Maniac Garage 계정을 만듭니다." : "이메일과 비밀번호로 로그인합니다."}
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block space-y-1 text-sm font-semibold">
          <span>이메일</span>
          <input
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-garage-orange"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        {isSignup ? (
          <label className="block space-y-1 text-sm font-semibold">
            <span>닉네임</span>
            <input
              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-garage-orange"
              type="text"
              autoComplete="nickname"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              minLength={2}
              maxLength={40}
              required
            />
          </label>
        ) : null}

        <label className="block space-y-1 text-sm font-semibold">
          <span>비밀번호</span>
          <input
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-garage-orange"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={isSignup ? 8 : 1}
            maxLength={100}
            required
          />
        </label>

        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

        <Button className="w-full" type="submit" disabled={pending}>{pending ? "처리 중..." : isSignup ? "회원가입" : "로그인"}</Button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        {isSignup ? "이미 계정이 있나요?" : "아직 계정이 없나요?"}{" "}
        <a className="font-semibold text-garage-orange" href={isSignup ? "/login/" : "/signup/"}>{isSignup ? "로그인" : "회원가입"}</a>
      </p>
    </Card>
  );
}
