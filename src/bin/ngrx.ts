#! /usr/bin/env node

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

import { createActionOutput } from './printer';
import { collectMetadata } from './collect-metadata';

const cmd = process.argv[2];

if ((cmd && cmd === 'g') || cmd === 'generate') {
  const sourceFilePath = process.argv[3];

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
} else {
  console.log('Syntax: ngrx [g | generate] [path to action declaration file from project root]');
  process.exit(1);
}
