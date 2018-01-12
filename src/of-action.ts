import { Action } from '@ngrx/store';
import { filter } from 'rxjs/operators';
import { OperatorFunction, MonoTypeOperatorFunction } from 'rxjs/interfaces';
import { ActionType } from './symbols';

export function ofAction<T extends Action>(allowedType: ActionType<T>): MonoTypeOperatorFunction<T>;
export function ofAction<T extends Action>(...allowedTypes: ActionType[]): OperatorFunction<Action, T>;
export function ofAction(...allowedTypes: ActionType[]): OperatorFunction<Action, Action> {
  const allowedMap = {};
  allowedTypes.forEach(action => (allowedMap[new action().type] = true));
  return filter((action: Action) => {
    return allowedMap[action.type];
  });
}
