import * as ts from 'typescript';
import * as _ from 'lodash';

import { ActionMetadata } from './collect-metadata';

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
    name: (result[2] as string).replace(';', '')
  };
}
