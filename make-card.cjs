// Builds card.svg: a terminal-window business card in the style of the
// classic `npx <name>` cards. The font is embedded (GitHub shows the SVG as
// an image, which cannot load outside fonts), so the columns stay aligned.
// Rows fade in one after another, then a cursor blinks by the menu.
//
//   node make-card.cjs <path to @fontsource/jetbrains-mono/files>
const fs = require('fs');
const path = require('path');

const fontDir = process.argv[2];
const font = (file) => fs.readFileSync(path.join(fontDir, file)).toString('base64');
const face = (weight, subset, range) =>
    `@font-face{font-family:JBM;font-weight:${weight};src:url(data:font/woff2;base64,${font(`jetbrains-mono-${subset}-${weight}-normal.woff2`)}) format('woff2');unicode-range:${range};}`;
const LATIN = 'U+0000-00FF,U+2000-206F,U+2190-21FF,U+2700-27BF';
const CYRILLIC = 'U+0400-04FF';

// Second argument "light" builds card-light.svg: the same card as a light
// terminal, for GitHub's light theme. `white` is the main text colour.
const LIGHT = process.argv[3] === 'light';
const C = LIGHT ? {
    window: '#ffffff', bar: '#eceef3', barText: '#4c4f69', border: '#40a02b',
    white: '#1f2330', grey: '#8c8fa1', green: '#2f8a1f', pink: '#d20f39',
    cyan: '#0b7fb3', blue: '#1e66f5', purple: '#7c3aed', dim: '#8c8fa1',
    edge: '#d0d7de', shadow: 0.16,
} : {
    window: '#232333', bar: '#2d2d3f', barText: '#c7c7d4', border: '#8fd28f',
    white: '#e7e7f0', grey: '#6f7389', green: '#a6e3a1', pink: '#f38ba8',
    cyan: '#89dceb', blue: '#89b4fa', purple: '#8f7cf7', dim: '#9399b2',
    edge: 'none', shadow: 0.35,
};

// One row: a right-aligned bold label and coloured pieces of value.
const W = (t, color = C.white, bold = false) => ({ t, color, bold });
const rows = [
    { label: 'Роль', value: [W('AI Product', C.white, true), W(', от идеи до запуска с ИИ')] },
    { label: 'Учёба', value: [W('3 курс, КНИТУ-КАИ')] },
    { label: 'Опыт', value: [W('«Нинель»', C.purple, true), W('  AI-фотосессии, 3+ месяца', C.grey)] },
    null,
    { label: 'Заказы', value: [W('КАИ Расписание', C.white, true), W('  система для вуза, пилот', C.grey)] },
    { label: '', value: [W('Сайт театра «Ключ»', C.white, true), W('  дизайн и разработка', C.grey)] },
    { label: '', value: [W('Сайт «Рынок»', C.white, true), W('  разработка', C.grey)] },
    null,
    { label: 'Проекты', value: [W('Telegram-канал', C.white, true), W('  посты пишет мой ИИ-бот', C.grey)] },
    { label: '', value: [W('YouTube-канал', C.white, true), W('  автопостинг видео', C.grey)] },
    null,
    { label: 'GitHub', value: [W('https://github.com/', C.grey), W('davkchit', C.green)] },
    { label: 'Telegram', value: [W('https://t.me/', C.grey), W('davkchv', C.cyan)] },
];

const FONT = 15;
const CH = FONT * 0.6; // JetBrains Mono advance width
const LINE = 23;
const LABEL_COLS = 9; // «Telegram:»
const longest = Math.max(...rows.filter(Boolean).map((r) => r.value.reduce((n, p) => n + [...p.t].length, 0)));
const BOX_PAD_X = 48;
const BOX_W = Math.round((LABEL_COLS + 2 + longest) * CH + BOX_PAD_X * 2);
const WIN_W = BOX_W + 160;
const MARGIN = 28; // around the window, for its shadow
const BAR = 36;
const BOX_X = MARGIN + (WIN_W - BOX_W) / 2;
const BOX_Y = MARGIN + BAR + 34;
const NAME_Y = BOX_Y + 44;
const FIRST_ROW_Y = NAME_Y + LINE + 14;
// The motto, in italics at the foot of the box, as on classic npx cards.
const MOTTO = ['Substance makes a product useful.', 'Refined design makes people love it.'];
const MOTTO_Y = FIRST_ROW_Y + rows.length * LINE + 22;
const BOX_H = MOTTO_Y - BOX_Y + (MOTTO.length - 1) * LINE + 34;
const LABEL_RIGHT = BOX_X + BOX_PAD_X + LABEL_COLS * CH;
const VALUE_X = LABEL_RIGHT + 2 * CH;
const AFTER_Y = BOX_Y + BOX_H + 40;
const WIN_H = AFTER_Y - MARGIN + LINE * 4 + 26;
const SVG_W = WIN_W + MARGIN * 2;
const SVG_H = WIN_H + MARGIN * 2;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const spans = (pieces) =>
    pieces.map((p) => `<tspan fill="${p.color}"${p.bold ? ' font-weight="700"' : ''}>${esc(p.t)}</tspan>`).join('');

let step = 0;
const reveal = () => `class="r" style="animation-delay:${(0.25 + step++ * 0.07).toFixed(2)}s"`;

const lines = [];
lines.push(`<text x="${MARGIN + WIN_W / 2}" y="${NAME_Y}" text-anchor="middle" ${reveal()}>${spans([W('David Kacheishvili', C.green, true), W(' / ', C.white), W('@davkchit', C.white)])}</text>`);
rows.forEach((row, i) => {
    if (!row) return;
    const y = FIRST_ROW_Y + i * LINE;
    const label = row.label
        ? `<tspan x="${LABEL_RIGHT}" text-anchor="end" fill="${C.white}" font-weight="700">${esc(row.label)}:</tspan>`
        : '';
    lines.push(`<text y="${y}" ${reveal()}>${label}<tspan x="${VALUE_X}">${spans(row.value)}</tspan></text>`);
});
MOTTO.forEach((line, i) => {
    lines.push(`<text x="${MARGIN + WIN_W / 2}" y="${MOTTO_Y + i * LINE}" text-anchor="middle" font-style="italic" fill="${C.white}" ${reveal()}>${esc(line)}</text>`);
});

const left = MARGIN + 18;
const after = [
    `<text x="${left}" y="${AFTER_Y}" ${reveal()}>${spans([W('Подсказка: ', C.white), W('ссылки', C.cyan, true), W(' продублированы под картинкой', C.white)])}</text>`,
    `<text x="${left}" y="${AFTER_Y + LINE * 1.5}" ${reveal()}>${spans([W('? ', C.green, true), W('Что дальше?', C.white, true)])}<tspan class="cursor" fill="${C.white}"> ▋</tspan></text>`,
    `<text x="${left}" y="${AFTER_Y + LINE * 2.5}" ${reveal()}>${spans([W('❯ ', C.cyan, true), W('Написать мне', C.cyan, true)])}</text>`,
    `<text x="${left}" y="${AFTER_Y + LINE * 3.5}" ${reveal()}>${spans([W('  Выйти', C.white)])}</text>`,
];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_W}" height="${SVG_H}" viewBox="0 0 ${SVG_W} ${SVG_H}">
<style>
${face(400, 'latin', LATIN)}${face(700, 'latin', LATIN)}${face(400, 'cyrillic', CYRILLIC)}@font-face{font-family:JBM;font-weight:400;font-style:italic;src:url(data:font/woff2;base64,${font('jetbrains-mono-latin-400-italic.woff2')}) format('woff2');unicode-range:${LATIN};}${face(700, 'cyrillic', CYRILLIC)}
text{font-family:JBM,ui-monospace,Menlo,Consolas,monospace;font-size:${FONT}px;white-space:pre}
.r{opacity:0;animation:in .4s ease-out forwards}
@keyframes in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.cursor{animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.r{animation:none;opacity:1}.cursor{animation:none}}
</style>
<defs><filter id="shadow" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000" flood-opacity="${C.shadow}"/></filter></defs>
<rect x="${MARGIN}" y="${MARGIN}" width="${WIN_W}" height="${WIN_H}" rx="12" fill="${C.window}" stroke="${C.edge}" filter="url(#shadow)"/>
<path d="M${MARGIN} ${MARGIN + 12}a12 12 0 0 1 12-12h${WIN_W - 24}a12 12 0 0 1 12 12v${BAR - 12}h-${WIN_W}z" fill="${C.bar}"/>
<circle cx="${MARGIN + 20}" cy="${MARGIN + BAR / 2}" r="6.5" fill="#ff5f57"/><circle cx="${MARGIN + 40}" cy="${MARGIN + BAR / 2}" r="6.5" fill="#febc2e"/><circle cx="${MARGIN + 60}" cy="${MARGIN + BAR / 2}" r="6.5" fill="#28c840"/>
<text x="${MARGIN + WIN_W / 2}" y="${MARGIN + BAR / 2 + 5}" text-anchor="middle" fill="${C.barText}" font-weight="700" style="font-size:13px">npx davkchit</text>
<text x="${MARGIN + WIN_W - 16}" y="${MARGIN + BAR / 2 + 5}" text-anchor="end" fill="${C.dim}" style="font-size:12px">⌥⌘1</text>
<rect x="${BOX_X}" y="${BOX_Y}" width="${BOX_W}" height="${BOX_H}" fill="none" stroke="${C.border}" stroke-width="1.5"/>
${lines.join('\n')}
${after.join('\n')}
</svg>
`;

const outName = LIGHT ? 'card-light.svg' : 'card.svg';
fs.writeFileSync(path.join(__dirname, outName), svg);
console.log(`${outName} ${SVG_W}×${SVG_H}, ${(svg.length / 1024).toFixed(0)} KB`);
