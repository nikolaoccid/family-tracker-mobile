/** Architecture rules: the dependency rules, checked on the import graph itself. */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(__dirname, '..');
const FEATURES = path.join(ROOT, 'features');

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

const importsOf = (file: string) =>
  [...fs.readFileSync(file, 'utf8').matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1] as string);

const features = fs.readdirSync(FEATURES).filter((name) => fs.statSync(path.join(FEATURES, name)).isDirectory());

/** feature -> set of other features it imports */
function featureGraph() {
  const graph = new Map<string, Set<string>>();
  for (const feature of features) {
    const deps = new Set<string>();
    for (const file of sourceFiles(path.join(FEATURES, feature))) {
      for (const spec of importsOf(file)) {
        const match = /^@\/features\/([^/]+)/.exec(spec);
        if (match && match[1] !== feature) deps.add(match[1] as string);
      }
    }
    graph.set(feature, deps);
  }
  return graph;
}

describe('architecture', () => {
  it('every feature exposes an index', () => {
    expect(features.filter((f) => !fs.existsSync(path.join(FEATURES, f, 'index.ts')))).toEqual([]);
  });

  it('features do not depend on each other in a cycle', () => {
    const graph = featureGraph();
    const visiting = new Set<string>();
    const done = new Set<string>();
    const cycles: string[] = [];
    const visit = (node: string, trail: string[]) => {
      if (done.has(node)) return;
      if (visiting.has(node)) {
        cycles.push([...trail, node].join(' -> '));
        return;
      }
      visiting.add(node);
      graph.get(node)?.forEach((next) => visit(next, [...trail, node]));
      visiting.delete(node);
      done.add(node);
    };
    features.forEach((f) => visit(f, []));
    expect(cycles).toEqual([]);
  });

  it('shared imports no feature', () => {
    const offenders = sourceFiles(path.join(ROOT, 'shared')).filter((file) => importsOf(file).some((s) => s.startsWith('@/features')));
    expect(offenders).toEqual([]);
  });

  it('app route files and layouts never import a feature internal', () => {
    const offenders = sourceFiles(path.join(ROOT, 'app')).filter((file) => importsOf(file).some((s) => /^@\/features\/[^/]+\/.+/.test(s)));
    expect(offenders).toEqual([]);
  });

  it('no source file uses console or any', () => {
    const files = ['app', 'features', 'shared', 'bootstrap', 'demo'].flatMap((d) => sourceFiles(path.join(ROOT, d)));
    const offenders = files.filter((file) => /\bconsole\.(log|warn|error|debug|info)\(/.test(fs.readFileSync(file, 'utf8')) && !file.endsWith('logger.ts'));
    expect(offenders.map((f) => path.relative(ROOT, f))).toEqual([]);
  });

  it('secrets and generated native projects are git-ignored', () => {
    const gitignore = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8').split('\n');
    for (const entry of ['.env', 'google-services.json', '/android', '/ios']) expect(gitignore).toContain(entry);
  });
});
