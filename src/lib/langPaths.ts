// Returns getStaticPaths() for all non-English languages
export function getAllLangPaths() {
  return [
    { params: { lang: 'fr' } },
    { params: { lang: 'es' } },
    { params: { lang: 'af' } },
  ];
}
export type LangParam = { lang: 'fr' | 'es' | 'af' };
