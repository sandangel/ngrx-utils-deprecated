import * as ts from 'typescript';
import * as _ from 'lodash';

import { ActionMetadata, collectMetadata } from './collect-metadata';
import * as path from './path-wrapper';
import * as fs from 'fs';

export function createActionOutput(filename: string, metadata: ActionMetadata[]) {
  const importDeclaration = ts.createImportDeclaration(
    undefined,
    undefined,
    ts.createImportClause(
      undefined,
      ts.createNamedImports(metadata.map(m => ts.createImportSpecifier(undefined, ts.createIdentifier(m.name))))
    ),
    ts.createIdentifier(`'./${filename.replace('.ts', '')}'`)
  );

  const { category } = parseActionType(metadata[0].type);

  const typeUnionDeclaration = ts.createTypeAliasDeclaration(
    undefined,
    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
    `${_.upperFirst(_.camelCase(category))}Actions`,
    undefined,
    ts.createUnionTypeNode(metadata.map(m => ts.createTypeReferenceNode(m.name, undefined)))
  );

  return [importDeclaration, typeUnionDeclaration];
}

const actionTypeRegex = new RegExp(/\[(.*?)\](.*)/);
function parseActionType(type: string) {
  const result = actionTypeRegex.exec(type);

  if (result === null) {
    throw new Error(`Could not parse action type "${type}"`);
  }

  return {
    category: result[1] as string,
    name: result[2] as string
  };
}

export function generateAction(sourceFilePath: string) {
  if (!sourceFilePath) {
    console.log('You must specify the path to action declaration file');
    process.exit(1);
  }
  const paths = sourceFilePath.split('/');
  const [sourceFileName] = paths.slice(-1);
  const sourceFileFolder = sourceFilePath.replace(`/${sourceFileName}`, '');

  const resultFileName = sourceFileName.replace(/\.ts$/, '') + '.generated.ts';

  console.log(`Reading source file from ${sourceFilePath}...`);
  const sourceFile = ts.createSourceFile(
    `${sourceFileName}`,
    fs.readFileSync(path.resolve(`${sourceFilePath}`)).toString(),
    ts.ScriptTarget.ES2015,
    true
  );
  console.log('Collecting metadata...');
  const metadata = collectMetadata(sourceFile);
  console.log('Generating result file...');
  const ast = createActionOutput(`${sourceFileName.replace(/\.ts$/, '')}`, metadata);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const resultFile = ts.createSourceFile(`${resultFileName}`, '', ts.ScriptTarget.ES2015, false, ts.ScriptKind.TS);
  const sourceText = ast
    .map(statement => printer.printNode(ts.EmitHint.Unspecified, statement, resultFile))
    .join('\n\n');

  console.log(`Writing result file to ${sourceFileFolder}/${resultFileName}`);
  fs.writeFileSync(path.resolve(`${sourceFileFolder}/${resultFileName}`), sourceText, {
    encoding: 'utf8'
  });
}

export function showUsage() {
  console.log('Syntax: ngrx [g | generate] [a | action] [path to action declaration file from project root]');
  process.exit(1);
}
