import { d as defineMiddleware, s as sequence } from "./chunks/vendor_Cx2pFmu4.mjs";
import { g as getLangFromUrl } from "./chunks/i18n_BDcNp2r5.mjs";
import "es-module-lexer";
import "kleur/colors";
import "clsx";
import "cookie";
const onRequest$1 = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  if (pathname.startsWith("/api/") || pathname.startsWith("/admin/") || pathname.startsWith("/_") || pathname.includes(".") || pathname === "/favicon.ico" || pathname === "/manifest.json" || pathname === "/sw.js" || pathname === "/robots.txt") {
    return next();
  }
  const lang = getLangFromUrl(url);
  context.locals.lang = lang;
  return next();
});
const onRequest = sequence(
  onRequest$1
);
export {
  onRequest
};
