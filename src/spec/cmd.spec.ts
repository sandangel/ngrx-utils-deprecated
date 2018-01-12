import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

import { getActionClasses, collectMetadata } from '../bin/collect-metadata';

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
        return actionClass.name!.getText();
      })
      .join(' | ');

    expect(unionType).toBe(unionTypeStr);
  });

  it('should get correct property metadata', () => {
    const metas = collectMetadata(sourceFile);

    const metasStr = [
      {
        name: 'GetTruckItems',
        type: `readonly type = '[Truck] Get Truck Items';`
      },
      {
        name: 'GetTruckItemsSuccess',
        type: `readonly type = '[Truck] Get Truck Items Success';`
      },
      {
        name: 'GetTruckItemsFail',
        type: `readonly type = '[Truck] Get Truck Items Fail';`
      },
      {
        name: 'RefreshTruckItems',
        type: `readonly type = '[Truck] Refresh Truck Items';`
      },
      {
        name: 'GetTruckData',
        type: `readonly type = '[Truck] Get Truck Data';`
      },
      {
        name: 'GetTruckDataSuccess',
        type: `readonly type = '[Truck] Get Truck Data Success';`
      },
      {
        name: 'GetTruckDataFail',
        type: `readonly type = '[Truck] Get Truck Data Fail';`
      },
      {
        name: 'RefreshTruckData',
        type: `readonly type = '[Truck] Refresh Truck Data';`
      }
    ];

    expect(metas).toEqual(metasStr);
  });
});
