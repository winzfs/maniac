/// <reference types="@cloudflare/workers-types" />

export const onRequestGet: PagesFunction = async ({ next }) => {
  return next();
};
