/** Design tokens: raw hex colors live only in shared/ui/theme.ts (fixtures are sample data, app.config is build config). */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(__dirname, '..');
const HEX = /#[0-9a-fA-F]{3,8}\b/;
const DIRS = ['app', 'bootstrap', 'demo', 'features', 'shared'];

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

describe('design tokens', () => {
  it('keep raw hex colors out of every source file except shared/ui/theme.ts', () => {
    const offenders = DIRS.flatMap((d) => sourceFiles(path.join(ROOT, d)))
      .filter((file) => !file.endsWith(path.join('shared', 'ui', 'theme.ts')))
      .filter((file) => HEX.test(fs.readFileSync(file, 'utf8')))
      .map((file) => path.relative(ROOT, file));
    expect(offenders).toEqual([]);
  });
});
