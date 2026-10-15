// Link buttons under the card, in its style: dark pills with an icon and a
// label. GitHub and Telegram marks come from Simple Icons (CC0); hh.ru is not
// there, so its mark (a red circle with «hh») is drawn here.
//
//   node make-buttons.cjs <@fontsource/jetbrains-mono/files> <simple-icons/icons>
const fs = require('fs');
const path = require('path');

const [fontDir, iconDir] = process.argv.slice(2);
const font = fs.readFileSync(path.join(fontDir, 'jetbrains-mono-latin-700-normal.woff2')).toString('base64');
const iconPath = (slug) => fs.readFileSync(path.join(iconDir, `${slug}.svg`), 'utf8').match(/ d="([^"]+)"/)[1];

const H = 40;
const FONT = 14;
const CH = FONT * 0.6;
const ICON = 18;

const buttons = [
    { file: 'btn-hh.svg', label: 'hh.ru', icon: (x, y) => `<circle cx="${x + ICON / 2}" cy="${y + ICON / 2}" r="${ICON / 2}" fill="#d6001c"/><text x="${x + ICON / 2}" y="${y + ICON / 2 + 3.6}" text-anchor="middle" fill="#fff" style="font-size:10px;letter-spacing:-0.5px">hh</text>` },
    { file: 'btn-telegram.svg', label: 'Telegram', icon: (x, y) => `<path transform="translate(${x} ${y}) scale(${ICON / 24})" fill="#26a5e4" d="${iconPath('telegram')}"/>` },
    { file: 'btn-github.svg', label: 'GitHub', icon: (x, y) => `<path transform="translate(${x} ${y}) scale(${ICON / 24})" fill="#e7e7f0" d="${iconPath('github')}"/>` },
];

for (const b of buttons) {
    const W = Math.round(14 + ICON + 10 + b.label.length * CH + 18);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<style>@font-face{font-family:JBM;font-weight:700;src:url(data:font/woff2;base64,${font}) format('woff2');}text{font-family:JBM,ui-monospace,Menlo,Consolas,monospace;font-weight:700}</style>
<rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="${(H - 1.5) / 2}" fill="#232333" stroke="#3b3b52" stroke-width="1.5"/>
${b.icon(14, (H - ICON) / 2)}
<text x="${14 + ICON + 10}" y="${H / 2 + 5}" fill="#e7e7f0" style="font-size:${FONT}px">${b.label}</text>
</svg>
`;
    fs.writeFileSync(path.join(__dirname, b.file), svg);
    console.log(b.file, `${W}×${H}`);
}
