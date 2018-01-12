#! /usr/bin/env node

import * as ts from 'typescript';
// import * as fs from 'fs';
// import * as path from 'path';
import { parseActionType } from './printer';

// const filePath = process.argv[2];

export interface ActionMetadata {
  name: string;
  type: string;
  properties: { name: string; optional: boolean }[];
}

export function getActionClasses(tsSourceFile: ts.SourceFile): ts.ClassDeclaration[] {
  const statements = tsSourceFile.statements;
  const classImplementsAction: ts.ClassDeclaration[] = statements.filter(
    (statement): statement is ts.ClassDeclaration => {
      if (ts.isClassDeclaration(statement)) {
        const heritageClauses = statement.heritageClauses;

        if (heritageClauses) {
          return heritageClauses.some(clause => {
            return clause.types.some(type => type.expression.getText() === 'Action');
          });
        }
      }
      return false;
    }
  );
  return classImplementsAction;
}

export function getTypeProperty(tsSourceFile: ts.SourceFile) {
  const implementsActionClasses = getActionClasses(tsSourceFile);

  const actionMetadata = implementsActionClasses.map(cls => {
    const classProperties: ts.ClassElement[] = cls.members.filter(ts.isClassElement);

    const typeProperty = classProperties.find(member => {
      return !!member.name && member.name.getText() === 'type';
    });

    if (typeProperty === undefined) {
      throw new Error(`Could not find "type" property on class "${cls.name && cls.name.getText()}"`);
    }

    return {
      name: cls.name && cls.name.getText(),
      type: typeProperty.getText(),
      category: parseActionType(typeProperty.getText())
    };
  });

  return actionMetadata;
}

export function collectMetadata(tsSourceFile: ts.SourceFile): ActionMetadata[] {
  const statements = tsSourceFile.statements;

  const interfacesExtendingAction: ts.InterfaceDeclaration[] = statements.filter(
    (statement): statement is ts.InterfaceDeclaration => {
      //   const isInterface = statement.kind === ts.SyntaxKind.InterfaceDeclaration;

      if (ts.isInterfaceDeclaration(statement)) {
        const heritageClauses = statement.heritageClauses;

        if (heritageClauses) {
          return heritageClauses.some(clause => {
            return clause.types.some(type => type.expression.getText() === 'Action');
          });
        }
      }

      return false;
    }
  );

  const actionMetadata = interfacesExtendingAction.map(int => {
    const interfaceProperties: ts.PropertySignature[] = int.members.filter(ts.isPropertySignature);

    const typeProperty = interfaceProperties.find(member => {
      return member.name.getText() === 'type';
    });

    if (typeProperty === undefined) {
      throw new Error(`Could not find "type" property on interface "${int.name.getText()}"`);
    }

    const requiredProperties = interfaceProperties
      .filter(member => {
        return member.name.getText() !== 'type' && !member.questionToken;
      })
      .map(member => member.name.getText());

    const optionalProperties = interfaceProperties
      .filter(member => {
        return member.questionToken;
      })
      .map(member => member.name.getText());

    return {
      name: int.name.getText(),
      type: (typeProperty.type as ts.LiteralTypeNode).literal.getText(),
      properties: [
        ...requiredProperties.map(name => ({ name, optional: false })),
        ...optionalProperties.map(name => ({ name, optional: true }))
      ]
    };
  });

  return actionMetadata;
}

// const sourceFile = ts.createSourceFile(
//   `${filePath}.actions.ts`,
//   fs.readFileSync(path.resolve(__dirname, `./actions/${filePath}.action.ts`)).toString(),
//   ts.ScriptTarget.ES2015,
//   true
// );
// const metadata = collectMetadata(sourceFile);
// const ast = createActionOutput(`${filePath}.action.ts`, metadata);
// const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
// const resultFile = ts.createSourceFile(`${filePath}.action.ts`, '', ts.ScriptTarget.ES2015, false, ts.ScriptKind.TS);
// const sourceText = ast.map(statement => printer.printNode(ts.EmitHint.Unspecified, statement, resultFile)).join('\n\n');
// fs.writeFileSync(path.resolve(__dirname, `./actions/${filePath}.action.generated.ts`), sourceText, {
//   encoding: 'utf8'
// });
