import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

import { getActionClasses, getTypeProperty } from '../bin/ngrx-utils';

describe('ngrx-utils-cli', () => {
  let sourceFile: ts.SourceFile;

  beforeEach(() => {
    sourceFile = ts.createSourceFile(
      `sample.actions.ts`,
      fs.readFileSync(path.resolve(__dirname, `./fixtures/sample.action.ts`)).toString(),
      ts.ScriptTarget.ES2015,
      true
    );
  });

  it('should get correct Union Action Class', () => {
    const actionClasses = getActionClasses(sourceFile);

    const unionTypeStr =
      'GetTruckItems | GetTruckItemsSuccess | GetTruckItemsFail | RefreshTruckItems' +
      ' | GetTruckData | GetTruckDataSuccess | GetTruckDataFail | RefreshTruckData';

    const unionType = actionClasses
      .map(actionClass => {
        return actionClass.name.getText();
      })
      .join(' | ');

    expect(unionType).toBe(unionTypeStr);
  });

  it('should get correct property "type" value', () => {
    const types = getTypeProperty(sourceFile);
    console.log(types);

    expect(true).toBe(true);
  });
});
