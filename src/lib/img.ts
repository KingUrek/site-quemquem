// src/lib/img.ts
// Resolve a foto de uma ocasião, categoria ou prato do cardápio.
//
//  - valor começando com "/"  → foto real da casa, em /public/img
//  - qualquer outro valor     → id de foto do Unsplash (PROVISÓRIO)
//
// Para trocar um stock pela foto real: coloque o arquivo em /public/img e
// troque o id pelo caminho "/img/arquivo.jpg" em src/data/cardapio.ts.
// Nada mais precisa mudar.
export const foto = (src: string, w: number) =>
  src.startsWith("/")
    ? src
    : `https://images.unsplash.com/${src}?w=${w}&q=75&auto=format&fit=crop`;

export const ehStock = (src: string) => !src.startsWith("/");
