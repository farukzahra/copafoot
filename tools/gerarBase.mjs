// Gera a base de dados de seleções e jogadores do CopaFoot.
// A FORÇA de cada jogador é gerada AUTOMATICAMENTE a partir do pote da seleção
// + variação por posição + aleatoriedade (com semente fixa = resultado reprodutível).
//
// Uso: node tools/gerarBase.mjs
// Saída: data/selecoes.json

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(__dirname, "..");

// Força-base por pote (quanto mais forte a seleção, maior a base).
const BASE_POR_POTE = { 1: 82, 2: 75, 3: 68, 4: 61 };

// Pequeno ajuste por posição só para dar variedade (não muda o equilíbrio geral).
const AJUSTE_POSICAO = { GOL: 0, DEF: 0, MEI: 1, ATA: 1 };

const FORCA_MIN = 45;
const FORCA_MAX = 99;

// RNG com semente (mulberry32) para a base ser sempre igual a cada geração.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// Definição das 16 seleções: id, nome, confederação, pote e elenco.
// Bandeiras: src/game/bandeiras.js + pacote flag-icons (ISO 3166).
const SELECOES = [
  {
    id: "BRA", nome: "Brasil", confederacao: "CONMEBOL", pote: 1,
    elenco: {
      GOL: ["Alisson", "Ederson"],
      DEF: ["Danilo", "Marquinhos", "Gabriel Magalhães", "Éder Militão", "Wendell", "Vanderson"],
      MEI: ["Bruno Guimarães", "Lucas Paquetá", "André", "Gerson", "Joelinton", "Andreas Pereira"],
      ATA: ["Vinícius Júnior", "Rodrygo", "Raphinha", "Endrick"],
    },
  },
  {
    id: "ARG", nome: "Argentina", confederacao: "CONMEBOL", pote: 1,
    elenco: {
      GOL: ["Emiliano Martínez", "Gerónimo Rulli"],
      DEF: ["Nahuel Molina", "Cristian Romero", "Nicolás Otamendi", "Lisandro Martínez", "Marcos Acuña", "Gonzalo Montiel"],
      MEI: ["Rodrigo De Paul", "Enzo Fernández", "Alexis Mac Allister", "Leandro Paredes", "Giovani Lo Celso", "Exequiel Palacios"],
      ATA: ["Lionel Messi", "Julián Álvarez", "Lautaro Martínez", "Ángel Di María"],
    },
  },
  {
    id: "FRA", nome: "França", confederacao: "UEFA", pote: 1,
    elenco: {
      GOL: ["Mike Maignan", "Brice Samba"],
      DEF: ["Jules Koundé", "Dayot Upamecano", "William Saliba", "Ibrahima Konaté", "Theo Hernández", "Lucas Hernández"],
      MEI: ["Aurélien Tchouaméni", "Eduardo Camavinga", "Adrien Rabiot", "Antoine Griezmann", "N'Golo Kanté", "Youssouf Fofana"],
      ATA: ["Kylian Mbappé", "Ousmane Dembélé", "Marcus Thuram", "Randal Kolo Muani"],
    },
  },
  {
    id: "ESP", nome: "Espanha", confederacao: "UEFA", pote: 1,
    elenco: {
      GOL: ["Unai Simón", "David Raya"],
      DEF: ["Dani Carvajal", "Pau Cubarsí", "Robin Le Normand", "Aymeric Laporte", "Marc Cucurella", "Alejandro Balde"],
      MEI: ["Rodri", "Pedri", "Gavi", "Fabián Ruiz", "Martín Zubimendi", "Mikel Merino"],
      ATA: ["Lamine Yamal", "Nico Williams", "Álvaro Morata", "Mikel Oyarzabal"],
    },
  },
  {
    id: "ENG", nome: "Inglaterra", confederacao: "UEFA", pote: 1,
    elenco: {
      GOL: ["Jordan Pickford", "Dean Henderson"],
      DEF: ["Kyle Walker", "John Stones", "Marc Guéhi", "Ezri Konsa", "Luke Shaw", "Trent Alexander-Arnold"],
      MEI: ["Declan Rice", "Jude Bellingham", "Phil Foden", "Cole Palmer", "Kobbie Mainoo", "Conor Gallagher"],
      ATA: ["Harry Kane", "Bukayo Saka", "Anthony Gordon", "Ollie Watkins"],
    },
  },
  {
    id: "POR", nome: "Portugal", confederacao: "UEFA", pote: 1,
    elenco: {
      GOL: ["Diogo Costa", "Rui Patrício"],
      DEF: ["João Cancelo", "Rúben Dias", "Pepe", "Gonçalo Inácio", "Nuno Mendes", "Diogo Dalot"],
      MEI: ["Bruno Fernandes", "Bernardo Silva", "Vitinha", "João Palhinha", "Rúben Neves", "João Neves"],
      ATA: ["Cristiano Ronaldo", "Rafael Leão", "Gonçalo Ramos", "Diogo Jota"],
    },
  },
  {
    id: "NED", nome: "Holanda", confederacao: "UEFA", pote: 2,
    elenco: {
      GOL: ["Bart Verbruggen", "Mark Flekken"],
      DEF: ["Denzel Dumfries", "Virgil van Dijk", "Stefan de Vrij", "Nathan Aké", "Daley Blind", "Lutsharel Geertruida"],
      MEI: ["Frenkie de Jong", "Tijjani Reijnders", "Ryan Gravenberch", "Xavi Simons", "Teun Koopmeiners", "Joey Veerman"],
      ATA: ["Memphis Depay", "Cody Gakpo", "Donyell Malen", "Wout Weghorst"],
    },
  },
  {
    id: "GER", nome: "Alemanha", confederacao: "UEFA", pote: 2,
    elenco: {
      GOL: ["Marc-André ter Stegen", "Manuel Neuer"],
      DEF: ["Joshua Kimmich", "Antonio Rüdiger", "Jonathan Tah", "Nico Schlotterbeck", "David Raum", "Benjamin Henrichs"],
      MEI: ["İlkay Gündoğan", "Robert Andrich", "Pascal Groß", "Florian Wirtz", "Jamal Musiala", "Leon Goretzka"],
      ATA: ["Kai Havertz", "Niclas Füllkrug", "Leroy Sané", "Serge Gnabry"],
    },
  },
  {
    id: "BEL", nome: "Bélgica", confederacao: "UEFA", pote: 2,
    elenco: {
      GOL: ["Thibaut Courtois", "Koen Casteels"],
      DEF: ["Timothy Castagne", "Wout Faes", "Zeno Debast", "Arthur Theate", "Maxim De Cuyper", "Thomas Meunier"],
      MEI: ["Kevin De Bruyne", "Youri Tielemans", "Amadou Onana", "Orel Mangala", "Charles De Ketelaere", "Hans Vanaken"],
      ATA: ["Romelu Lukaku", "Jérémy Doku", "Leandro Trossard", "Dodi Lukebakio"],
    },
  },
  {
    id: "CRO", nome: "Croácia", confederacao: "UEFA", pote: 2,
    elenco: {
      GOL: ["Dominik Livaković", "Ivica Ivušić"],
      DEF: ["Josip Stanišić", "Joško Gvardiol", "Josip Šutalo", "Duje Ćaleta-Car", "Borna Sosa", "Domagoj Vida"],
      MEI: ["Luka Modrić", "Mateo Kovačić", "Marcelo Brozović", "Mario Pašalić", "Lovro Majer", "Nikola Vlašić"],
      ATA: ["Andrej Kramarić", "Ante Budimir", "Bruno Petković", "Igor Matanović"],
    },
  },
  {
    id: "URU", nome: "Uruguai", confederacao: "CONMEBOL", pote: 2,
    elenco: {
      GOL: ["Sergio Rochet", "Santiago Mele"],
      DEF: ["Nahitan Nández", "Ronald Araújo", "José María Giménez", "Sebastián Cáceres", "Mathías Olivera", "Guillermo Varela"],
      MEI: ["Federico Valverde", "Manuel Ugarte", "Rodrigo Bentancur", "Nicolás de la Cruz", "Giorgian de Arrascaeta", "Facundo Pellistri"],
      ATA: ["Darwin Núñez", "Maxi Araújo", "Brian Rodríguez", "Federico Viñas"],
    },
  },
  {
    id: "COL", nome: "Colômbia", confederacao: "CONMEBOL", pote: 2,
    elenco: {
      GOL: ["Camilo Vargas", "David Ospina"],
      DEF: ["Daniel Muñoz", "Davinson Sánchez", "Yerry Mina", "Carlos Cuesta", "Johan Mojica", "Santiago Arias"],
      MEI: ["James Rodríguez", "Jefferson Lerma", "Richard Ríos", "Kevin Castaño", "Juan Fernando Quintero", "Jorge Carrascal"],
      ATA: ["Luis Díaz", "Jhon Córdoba", "Rafael Santos Borré", "Jhon Durán"],
    },
  },
  {
    id: "MAR", nome: "Marrocos", confederacao: "CAF", pote: 2,
    elenco: {
      GOL: ["Yassine Bounou", "Munir Mohamedi"],
      DEF: ["Achraf Hakimi", "Romain Saïss", "Nayef Aguerd", "Noussair Mazraoui", "Yahia Attiyat Allah", "Jawad El Yamiq"],
      MEI: ["Sofyan Amrabat", "Azzedine Ounahi", "Bilal El Khannous", "Amir Richardson", "Selim Amallah", "Sofiane Boufal"],
      ATA: ["Hakim Ziyech", "Youssef En-Nesyri", "Brahim Díaz", "Ayoub El Kaabi"],
    },
  },
  {
    id: "USA", nome: "Estados Unidos", confederacao: "CONCACAF", pote: 3,
    elenco: {
      GOL: ["Matt Turner", "Ethan Horvath"],
      DEF: ["Sergiño Dest", "Chris Richards", "Tim Ream", "Cameron Carter-Vickers", "Antonee Robinson", "Joe Scally"],
      MEI: ["Tyler Adams", "Weston McKennie", "Yunus Musah", "Giovanni Reyna", "Luca de la Torre", "Malik Tillman"],
      ATA: ["Christian Pulisic", "Folarin Balogun", "Timothy Weah", "Ricardo Pepi"],
    },
  },
  {
    id: "MEX", nome: "México", confederacao: "CONCACAF", pote: 3,
    elenco: {
      GOL: ["Guillermo Ochoa", "Luis Malagón"],
      DEF: ["Jorge Sánchez", "César Montes", "Johan Vásquez", "Israel Reyes", "Jesús Gallardo", "Gerardo Arteaga"],
      MEI: ["Edson Álvarez", "Luis Chávez", "Orbelín Pineda", "Luis Romo", "Carlos Rodríguez", "Érick Sánchez"],
      ATA: ["Hirving Lozano", "Santiago Giménez", "Raúl Jiménez", "Alexis Vega"],
    },
  },
  {
    id: "JPN", nome: "Japão", confederacao: "AFC", pote: 3,
    elenco: {
      GOL: ["Zion Suzuki", "Daniel Schmidt"],
      DEF: ["Hiroki Sakai", "Ko Itakura", "Takehiro Tomiyasu", "Shogo Taniguchi", "Yukinari Sugawara", "Hiroki Ito"],
      MEI: ["Wataru Endo", "Hidemasa Morita", "Daichi Kamada", "Takefusa Kubo", "Ritsu Doan", "Kaoru Mitoma"],
      ATA: ["Ayase Ueda", "Daizen Maeda", "Takuma Asano", "Junya Ito"],
    },
  },
];

const ORDEM_POSICOES = ["GOL", "DEF", "MEI", "ATA"];

function gerarForca(rng, pote, posicao) {
  const base = BASE_POR_POTE[pote] ?? 65;
  const ajuste = AJUSTE_POSICAO[posicao] ?? 0;
  // variação entre -7 e +12 para dar uma boa dispersão de níveis
  const variacao = Math.round(rng() * 19) - 7;
  return clamp(base + ajuste + variacao, FORCA_MIN, FORCA_MAX);
}

const selecoesOut = SELECOES.map((sel) => {
  const rng = mulberry32(hashString(sel.id));
  const jogadores = [];
  let pid = 1;
  for (const posicao of ORDEM_POSICOES) {
    for (const nome of sel.elenco[posicao]) {
      jogadores.push({
        id: `${sel.id}-${String(pid).padStart(2, "0")}`,
        nome,
        posicao,
        forca: gerarForca(rng, sel.pote, posicao),
      });
      pid++;
    }
  }
  const forcaMedia = Math.round(
    jogadores.reduce((s, j) => s + j.forca, 0) / jogadores.length
  );
  return {
    id: sel.id,
    nome: sel.nome,
    confederacao: sel.confederacao,
    pote: sel.pote,
    forcaMedia,
    jogadores,
  };
});

const saida = {
  geradoEm: new Date().toISOString(),
  descricao:
    "Base de seleções e jogadores do CopaFoot (clone do Elifoot, Copa 2026). Força gerada automaticamente por pote.",
  totalSelecoes: selecoesOut.length,
  totalJogadores: selecoesOut.reduce((s, t) => s + t.jogadores.length, 0),
  selecoes: selecoesOut,
};

const destino = resolve(raiz, "data", "selecoes.json");
mkdirSync(dirname(destino), { recursive: true });
writeFileSync(destino, JSON.stringify(saida, null, 2), "utf8");

console.log(`OK -> ${destino}`);
console.log(`Seleções: ${saida.totalSelecoes} | Jogadores: ${saida.totalJogadores}`);
for (const s of selecoesOut) {
  console.log(`  ${s.id} ${s.nome.padEnd(16)} pote ${s.pote}  força média ${s.forcaMedia}`);
}
