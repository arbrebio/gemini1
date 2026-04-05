import { f as renderers, o as createExports } from "./chunks/vendor_Cx2pFmu4.mjs";
import { s as serverEntrypointModule } from "./chunks/_@astrojs-ssr-adapter_c8zZy_jp.mjs";
import { manifest } from "./manifest_DPaerrvj.mjs";
const serverIslandMap = /* @__PURE__ */ new Map();
;
const _page0 = () => import("./pages/_image.astro.mjs");
const _page1 = () => import("./pages/404.astro.mjs");
const _page2 = () => import("./pages/500.astro.mjs");
const _page3 = () => import("./pages/about.astro.mjs");
const _page4 = () => import("./pages/admin/customers.astro.mjs");
const _page5 = () => import("./pages/admin/inventory.astro.mjs");
const _page6 = () => import("./pages/admin/login.astro.mjs");
const _page7 = () => import("./pages/admin/orders.astro.mjs");
const _page8 = () => import("./pages/admin/projects.astro.mjs");
const _page9 = () => import("./pages/admin/suppliers.astro.mjs");
const _page10 = () => import("./pages/admin.astro.mjs");
const _page11 = () => import("./pages/api/contact.astro.mjs");
const _page12 = () => import("./pages/api/image-seo-validator.astro.mjs");
const _page13 = () => import("./pages/api/link-checker.astro.mjs");
const _page14 = () => import("./pages/api/meta-tags.json.astro.mjs");
const _page15 = () => import("./pages/api/meta-validator.astro.mjs");
const _page16 = () => import("./pages/api/newsletter/admin.astro.mjs");
const _page17 = () => import("./pages/api/newsletter/bulk-send.astro.mjs");
const _page18 = () => import("./pages/api/newsletter/confirm.astro.mjs");
const _page19 = () => import("./pages/api/newsletter/export.astro.mjs");
const _page20 = () => import("./pages/api/newsletter/send.astro.mjs");
const _page21 = () => import("./pages/api/newsletter/stats.astro.mjs");
const _page22 = () => import("./pages/api/newsletter/subscribe.astro.mjs");
const _page23 = () => import("./pages/api/newsletter/unsubscribe.astro.mjs");
const _page24 = () => import("./pages/api/performance-report.json.astro.mjs");
const _page25 = () => import("./pages/api/quote.astro.mjs");
const _page26 = () => import("./pages/api/seo-audit.astro.mjs");
const _page27 = () => import("./pages/api/seo-headers.astro.mjs");
const _page28 = () => import("./pages/api/seo-report.astro.mjs");
const _page29 = () => import("./pages/api/seo-status.json.astro.mjs");
const _page30 = () => import("./pages/api/sitemap.xml.astro.mjs");
const _page31 = () => import("./pages/api/structured-data-validator.astro.mjs");
const _page32 = () => import("./pages/blog.astro.mjs");
const _page33 = () => import("./pages/blog/_---slug_.astro.mjs");
const _page34 = () => import("./pages/company.astro.mjs");
const _page35 = () => import("./pages/contact.astro.mjs");
const _page36 = () => import("./pages/cookies.astro.mjs");
const _page37 = () => import("./pages/greenhouses/accessories.astro.mjs");
const _page38 = () => import("./pages/greenhouses/high-tech.astro.mjs");
const _page39 = () => import("./pages/greenhouses.astro.mjs");
const _page40 = () => import("./pages/irrigation/controllers.astro.mjs");
const _page41 = () => import("./pages/irrigation/drip-systems.astro.mjs");
const _page42 = () => import("./pages/irrigation/sprinklers.astro.mjs");
const _page43 = () => import("./pages/irrigation.astro.mjs");
const _page44 = () => import("./pages/newsletter/confirm.astro.mjs");
const _page45 = () => import("./pages/newsletter/unsubscribe.astro.mjs");
const _page46 = () => import("./pages/privacy.astro.mjs");
const _page47 = () => import("./pages/projects.astro.mjs");
const _page48 = () => import("./pages/sitemap.xml.astro.mjs");
const _page49 = () => import("./pages/solutions.astro.mjs");
const _page50 = () => import("./pages/substrates/growing-solutions.astro.mjs");
const _page51 = () => import("./pages/substrates.astro.mjs");
const _page52 = () => import("./pages/success-stories.astro.mjs");
const _page53 = () => import("./pages/terms.astro.mjs");
const _page54 = () => import("./pages/_lang_/about.astro.mjs");
const _page55 = () => import("./pages/_lang_/blog.astro.mjs");
const _page56 = () => import("./pages/_lang_/blog/_---slug_.astro.mjs");
const _page57 = () => import("./pages/_lang_/company.astro.mjs");
const _page58 = () => import("./pages/_lang_/contact.astro.mjs");
const _page59 = () => import("./pages/_lang_/cookies.astro.mjs");
const _page60 = () => import("./pages/_lang_/greenhouses/accessories.astro.mjs");
const _page61 = () => import("./pages/_lang_/greenhouses/high-tech.astro.mjs");
const _page62 = () => import("./pages/_lang_/greenhouses.astro.mjs");
const _page63 = () => import("./pages/_lang_/irrigation/controllers.astro.mjs");
const _page64 = () => import("./pages/_lang_/irrigation/drip-systems.astro.mjs");
const _page65 = () => import("./pages/_lang_/irrigation/sprinklers.astro.mjs");
const _page66 = () => import("./pages/_lang_/irrigation.astro.mjs");
const _page67 = () => import("./pages/_lang_/privacy.astro.mjs");
const _page68 = () => import("./pages/_lang_/projects.astro.mjs");
const _page69 = () => import("./pages/_lang_/solutions.astro.mjs");
const _page70 = () => import("./pages/_lang_/substrates/growing-solutions.astro.mjs");
const _page71 = () => import("./pages/_lang_/substrates.astro.mjs");
const _page72 = () => import("./pages/_lang_/success-stories.astro.mjs");
const _page73 = () => import("./pages/_lang_/terms.astro.mjs");
const _page74 = () => import("./pages/_lang_.astro.mjs");
const _page75 = () => import("./pages/index.astro.mjs");
const pageMap = /* @__PURE__ */ new Map([
  ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
  ["src/pages/404.astro", _page1],
  ["src/pages/500.astro", _page2],
  ["src/pages/about.astro", _page3],
  ["src/pages/admin/customers/index.astro", _page4],
  ["src/pages/admin/inventory/index.astro", _page5],
  ["src/pages/admin/login.astro", _page6],
  ["src/pages/admin/orders/index.astro", _page7],
  ["src/pages/admin/projects/index.astro", _page8],
  ["src/pages/admin/suppliers/index.astro", _page9],
  ["src/pages/admin/index.astro", _page10],
  ["src/pages/api/contact.ts", _page11],
  ["src/pages/api/image-seo-validator.ts", _page12],
  ["src/pages/api/link-checker.ts", _page13],
  ["src/pages/api/meta-tags.json.ts", _page14],
  ["src/pages/api/meta-validator.ts", _page15],
  ["src/pages/api/newsletter/admin.ts", _page16],
  ["src/pages/api/newsletter/bulk-send.ts", _page17],
  ["src/pages/api/newsletter/confirm.ts", _page18],
  ["src/pages/api/newsletter/export.ts", _page19],
  ["src/pages/api/newsletter/send.ts", _page20],
  ["src/pages/api/newsletter/stats.ts", _page21],
  ["src/pages/api/newsletter/subscribe.ts", _page22],
  ["src/pages/api/newsletter/unsubscribe.ts", _page23],
  ["src/pages/api/performance-report.json.ts", _page24],
  ["src/pages/api/quote.ts", _page25],
  ["src/pages/api/seo-audit.ts", _page26],
  ["src/pages/api/seo-headers.ts", _page27],
  ["src/pages/api/seo-report.ts", _page28],
  ["src/pages/api/seo-status.json.ts", _page29],
  ["src/pages/api/sitemap.xml.ts", _page30],
  ["src/pages/api/structured-data-validator.ts", _page31],
  ["src/pages/blog/index.astro", _page32],
  ["src/pages/blog/[...slug].astro", _page33],
  ["src/pages/company/index.astro", _page34],
  ["src/pages/contact.astro", _page35],
  ["src/pages/cookies.astro", _page36],
  ["src/pages/greenhouses/accessories.astro", _page37],
  ["src/pages/greenhouses/high-tech.astro", _page38],
  ["src/pages/greenhouses/index.astro", _page39],
  ["src/pages/irrigation/controllers.astro", _page40],
  ["src/pages/irrigation/drip-systems.astro", _page41],
  ["src/pages/irrigation/sprinklers.astro", _page42],
  ["src/pages/irrigation/index.astro", _page43],
  ["src/pages/newsletter/confirm.astro", _page44],
  ["src/pages/newsletter/unsubscribe.astro", _page45],
  ["src/pages/privacy.astro", _page46],
  ["src/pages/projects/index.astro", _page47],
  ["src/pages/sitemap.xml.ts", _page48],
  ["src/pages/solutions.astro", _page49],
  ["src/pages/substrates/growing-solutions.astro", _page50],
  ["src/pages/substrates/index.astro", _page51],
  ["src/pages/success-stories.astro", _page52],
  ["src/pages/terms.astro", _page53],
  ["src/pages/[lang]/about.astro", _page54],
  ["src/pages/[lang]/blog/index.astro", _page55],
  ["src/pages/[lang]/blog/[...slug].astro", _page56],
  ["src/pages/[lang]/company/index.astro", _page57],
  ["src/pages/[lang]/contact.astro", _page58],
  ["src/pages/[lang]/cookies.astro", _page59],
  ["src/pages/[lang]/greenhouses/accessories.astro", _page60],
  ["src/pages/[lang]/greenhouses/high-tech.astro", _page61],
  ["src/pages/[lang]/greenhouses/index.astro", _page62],
  ["src/pages/[lang]/irrigation/controllers.astro", _page63],
  ["src/pages/[lang]/irrigation/drip-systems.astro", _page64],
  ["src/pages/[lang]/irrigation/sprinklers.astro", _page65],
  ["src/pages/[lang]/irrigation/index.astro", _page66],
  ["src/pages/[lang]/privacy.astro", _page67],
  ["src/pages/[lang]/projects/index.astro", _page68],
  ["src/pages/[lang]/solutions.astro", _page69],
  ["src/pages/[lang]/substrates/growing-solutions.astro", _page70],
  ["src/pages/[lang]/substrates/index.astro", _page71],
  ["src/pages/[lang]/success-stories.astro", _page72],
  ["src/pages/[lang]/terms.astro", _page73],
  ["src/pages/[lang]/index.astro", _page74],
  ["src/pages/index.astro", _page75]
]);
const _manifest = Object.assign(manifest, {
  pageMap,
  serverIslandMap,
  renderers,
  actions: () => import("./_noop-actions.mjs"),
  middleware: () => import("./_astro-internal_middleware.mjs")
});
const _args = {
  "middlewareSecret": "2c7073f1-aee8-40c3-b8d5-d8ef3ba30707",
  "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = "start";
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;
export {
  __astrojsSsrVirtualEntry as default,
  pageMap
};
