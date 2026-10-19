import {readFile,writeFile,mkdir} from 'node:fs/promises';
const read = name => readFile(new URL(name,import.meta.url),'utf8');
const template = await read('./src/index.template.html');
const css = (await read('./public/style.css')).replace(/^@import[^\n]*\n/, '');
const model = (await read('./public/model.js')).replace(/export (const|function) /g,'$1 ');
const stats = (await read('./public/statistics.js')).replace('export const ', 'const ');
const app = (await read('./public/app.js')).replace(/^import[^;]*;\s*/gm, '');
const html = template.replace('<link rel="stylesheet" href="/style.css">',()=>'<style>'+css+'</style>')
  .replace('<script type="module" src="/app.js"></script>',()=>'<script>'+model+'\n'+stats+'\n'+app+'</script>');
await mkdir(new URL('./public/',import.meta.url),{recursive:true});
await writeFile(new URL('./public/index.html',import.meta.url),html);
console.log('Built self-contained public/index.html (no external CSS, fonts or JavaScript).');
