// src/data/cardapio.ts
// -----------------------------------------------------------------------------
// DADOS DE EXEMPLO — substituir pelo cardápio real do Qüem Qüem.
// É o único arquivo a editar: preços, nomes, descrições e fotos saem daqui.
// Depois dá pra migrar para Google Sheets/CMS sem mudar a página.
//
// FOTOS (campo `img`): ver src/lib/img.ts
//   "/img/arquivo.png"  → foto real da casa (já temos: coxinha, picanha, chopp)
//   "photo-1544025..."  → id de foto do Unsplash, PROVISÓRIO até a produção
//                         de fotos própria. Trocar pelo caminho local depois.
// -----------------------------------------------------------------------------

export type Ocasiao = "chopp" | "almoco" | "jantar" | "comemorar";
export type Tag = "vegetariano" | "sem-gluten" | "pra-dividir";

export interface Prato {
  nome: string;
  descricao: string;
  preco: number;          // em reais (exemplo)
  categoria: string;
  ocasioes: Ocasiao[];
  serve: 1 | 2;
  tags: Tag[];
  harmoniza?: string;     // sugestão da adega — puxa o vinho
  destaque?: boolean;     // carro-chefe / assinatura da casa
  img?: string;           // foto do prato (ver nota no topo)
}

export interface Categoria {
  nome: string;
  slug: string;           // âncora usada pela navegação (#carnes)
  resumo: string;         // uma linha explicando a seção
  img: string;
}

// ordem em que as categorias aparecem na página
export const categorias: Categoria[] = [
  {
    nome: "Petiscos",
    slug: "petiscos",
    resumo: "Pra abrir a mesa e ir bem com o chopp. Tudo pensado pra dividir.",
    img: "photo-1555939594-58d7cb561ad1",
  },
  {
    nome: "Entradas & Saladas",
    slug: "entradas",
    resumo: "Mais leves, pra começar sem pressa ou acompanhar o prato principal.",
    img: "photo-1514516345957-556ca7d90a29",
  },
  {
    nome: "Carnes",
    slug: "carnes",
    resumo: "O forte da casa, na chapa ou no forno. Quase tudo serve duas pessoas.",
    img: "photo-1615937691194-97dbd3f3dc29",
  },
  {
    nome: "Massas",
    slug: "massas",
    resumo: "Massa fresca feita na cozinha, do funghi ao camarão.",
    img: "photo-1498579150354-977475b7ea0b",
  },
  {
    nome: "Peixes",
    slug: "peixes",
    resumo: "Grelhados e moquecas — pedidos que combinam com um branco gelado.",
    img: "photo-1476224203421-9ac39bcb3327",
  },
  {
    nome: "Sobremesas",
    slug: "sobremesas",
    resumo: "O fim da noite. O pudim é receita de 40 anos.",
    img: "photo-1551024506-0bccd828d307",
  },
];

// As quatro "ocasiões" que filtram o cardápio. O texto de apoio existe pra
// quem chega pela primeira vez entender o que o botão faz antes de clicar.
export const ocasioes: {
  id: Ocasiao;
  label: string;
  desc: string;
  img: string;
}[] = [
  {
    id: "chopp",
    label: "Chopp com amigos",
    desc: "Petiscos pra dividir na mesa, com a tulipa congelada do lado.",
    img: "/img/chopp.png",
  },
  {
    id: "almoco",
    label: "Almoço",
    desc: "Pratos do dia a dia, sem cerimônia — dá tempo de voltar ao trabalho.",
    img: "photo-1504674900247-0877df9cc836",
  },
  {
    id: "jantar",
    label: "Jantar a dois",
    desc: "Mesa tranquila, um prato pra dividir e uma garrafa da adega.",
    img: "photo-1481931098730-318b6f776db0",
  },
  {
    id: "comemorar",
    label: "Comemorar",
    desc: "Os pratos de festa da casa, pros dias que pedem um brinde.",
    img: "photo-1510812431401-41d2bd2722f3",
  },
];

// Filtros extras. `serve-2` é derivado do campo `serve` do prato.
export const filtros: { id: string; label: string }[] = [
  { id: "serve-2", label: "Serve 2 pessoas" },
  { id: "pra-dividir", label: "Bom pra dividir" },
  { id: "vegetariano", label: "Vegetariano" },
  { id: "sem-gluten", label: "Sem glúten" },
];

export const pratos: Prato[] = [
  // ---------------- PETISCOS ----------------
  { nome: "Coxinha Qüem Qüem", descricao: "A tradição da casa: massa leve, recheio cremoso. Peça uma e entenda o nome.", preco: 39, categoria: "Petiscos", ocasioes: ["chopp", "almoco"], serve: 2, tags: ["pra-dividir"], destaque: true, img: "/img/coxinha.png" },
  { nome: "Bolinho de bacalhau", descricao: "Crocante por fora, macio por dentro. Seis unidades, com limão.", preco: 44, categoria: "Petiscos", ocasioes: ["chopp"], serve: 2, tags: ["pra-dividir"] },
  { nome: "Iscas de tilápia", descricao: "Empanadas na hora, com molho tártaro da casa.", preco: 52, categoria: "Petiscos", ocasioes: ["chopp", "almoco"], serve: 2, tags: ["pra-dividir"] },
  { nome: "Batata rústica com alecrim", descricao: "Assada com casca, alecrim e flor de sal.", preco: 34, categoria: "Petiscos", ocasioes: ["chopp"], serve: 2, tags: ["vegetariano", "sem-gluten", "pra-dividir"] },
  { nome: "Linguiça artesanal na chapa", descricao: "Acompanha pão, vinagrete e cebola caramelizada.", preco: 42, categoria: "Petiscos", ocasioes: ["chopp"], serve: 2, tags: ["pra-dividir"] },
  { nome: "Bolinho de costela", descricao: "Costela desfiada com um toque de mandioca. Vai embora rápido.", preco: 48, categoria: "Petiscos", ocasioes: ["chopp"], serve: 2, tags: ["pra-dividir"] },
  { nome: "Torresmo de rolo", descricao: "Pururuca crocante, do jeito mineiro. Com limão.", preco: 46, categoria: "Petiscos", ocasioes: ["chopp"], serve: 2, tags: ["sem-gluten", "pra-dividir"] },
  { nome: "Frango à passarinho", descricao: "Bem sequinho, alho dourado e cheiro-verde.", preco: 45, categoria: "Petiscos", ocasioes: ["chopp", "almoco"], serve: 2, tags: ["sem-gluten", "pra-dividir"], img: "photo-1608039755401-742074f0548d" },

  // ---------------- ENTRADAS & SALADAS ----------------
  { nome: "Carpaccio ao parmesão", descricao: "Fatias finas, alcaparras, rúcula e lascas de parmesão.", preco: 58, categoria: "Entradas & Saladas", ocasioes: ["jantar", "comemorar"], serve: 1, tags: ["sem-gluten"], harmoniza: "tinto leve da casa" },
  { nome: "Camarão empanado", descricao: "Empanado crocante com molho rosé e limão siciliano.", preco: 72, categoria: "Entradas & Saladas", ocasioes: ["jantar", "comemorar"], serve: 2, tags: ["pra-dividir"], harmoniza: "espumante brut" },
  { nome: "Bruschetta de tomate", descricao: "Pão da casa, tomate confit, manjericão e azeite.", preco: 38, categoria: "Entradas & Saladas", ocasioes: ["jantar", "almoco"], serve: 2, tags: ["vegetariano", "pra-dividir"], img: "photo-1572695157366-5e585ab2b69f" },
  { nome: "Salada Caesar com frango", descricao: "Alface, croutons, parmesão e frango grelhado.", preco: 49, categoria: "Entradas & Saladas", ocasioes: ["almoco", "jantar"], serve: 1, tags: [] },
  { nome: "Salada Caprese", descricao: "Muçarela de búfala, tomate, manjericão e pesto.", preco: 44, categoria: "Entradas & Saladas", ocasioes: ["almoco", "jantar"], serve: 1, tags: ["vegetariano", "sem-gluten"] },

  // ---------------- CARNES ----------------
  { nome: "Picanha na chapa", descricao: "Chega crepitando, no ponto que você pedir. Acompanha farofa, vinagrete e pão de alho.", preco: 179, categoria: "Carnes", ocasioes: ["jantar", "comemorar"], serve: 2, tags: ["sem-gluten", "pra-dividir"], destaque: true, harmoniza: "Malbec encorpado da adega", img: "/img/picanha.png" },
  { nome: "Cordeiro ao vinho", descricao: "Pernil de cordeiro cozido lentamente, com risoto de ervas.", preco: 198, categoria: "Carnes", ocasioes: ["comemorar", "jantar"], serve: 2, tags: ["sem-gluten", "pra-dividir"], destaque: true, harmoniza: "tinto encorpado — peça uma indicação", img: "photo-1432139509613-5c4255815697" },
  { nome: "Filé mignon ao molho madeira", descricao: "Medalhões grelhados, molho madeira e batata rústica.", preco: 156, categoria: "Carnes", ocasioes: ["jantar", "comemorar"], serve: 2, tags: ["pra-dividir"], harmoniza: "Cabernet da casa", img: "photo-1600891964092-4316c288032e" },
  { nome: "Costela no bafo", descricao: "Doze horas de forno até desmanchar. Com mandioca dourada.", preco: 149, categoria: "Carnes", ocasioes: ["almoco", "jantar"], serve: 2, tags: ["sem-gluten", "pra-dividir"], img: "photo-1544025162-d76694265947" },
  { nome: "Frango grelhado com legumes", descricao: "Sobrecoxa desossada, grelhada, com legumes salteados.", preco: 62, categoria: "Carnes", ocasioes: ["almoco"], serve: 1, tags: ["sem-gluten"] },

  // ---------------- MASSAS ----------------
  { nome: "Fettuccine ao funghi", descricao: "Massa fresca, creme de funghi e parmesão.", preco: 74, categoria: "Massas", ocasioes: ["jantar", "comemorar"], serve: 1, tags: ["vegetariano"], harmoniza: "branco seco" },
  { nome: "Ravióli de queijo", descricao: "Recheio de quatro queijos, manteiga de sálvia e nozes.", preco: 69, categoria: "Massas", ocasioes: ["jantar"], serve: 1, tags: ["vegetariano"] },
  { nome: "Espaguete com camarão", descricao: "Camarões salteados no alho, tomate fresco e um toque de pimenta.", preco: 89, categoria: "Massas", ocasioes: ["jantar", "comemorar"], serve: 2, tags: ["pra-dividir"], harmoniza: "branco seco gelado", img: "photo-1563379926898-05f4575a45d8" },

  // ---------------- PEIXES ----------------
  { nome: "Salmão grelhado", descricao: "Com crosta de ervas, purê de baroa e aspargos.", preco: 98, categoria: "Peixes", ocasioes: ["jantar", "comemorar"], serve: 1, tags: ["sem-gluten"], harmoniza: "branco seco", img: "photo-1519708227418-c8fd9a32b7a2" },
  { nome: "Moqueca de peixe", descricao: "Peixe branco, leite de coco, dendê e pimentões. Com arroz e pirão.", preco: 168, categoria: "Peixes", ocasioes: ["jantar", "comemorar"], serve: 2, tags: ["sem-gluten", "pra-dividir"], harmoniza: "rosé gelado" },

  // ---------------- SOBREMESAS ----------------
  { nome: "Petit gateau", descricao: "Bolo quente de chocolate com sorvete de creme.", preco: 36, categoria: "Sobremesas", ocasioes: ["chopp", "almoco", "jantar", "comemorar"], serve: 1, tags: ["vegetariano"], img: "photo-1624353365286-3f8d62daad51" },
  { nome: "Pudim da casa", descricao: "Receita de 40 anos. Cremoso, na medida certa de doçura.", preco: 24, categoria: "Sobremesas", ocasioes: ["chopp", "almoco", "jantar", "comemorar"], serve: 1, tags: ["vegetariano", "sem-gluten"] },
];
