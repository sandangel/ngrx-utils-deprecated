import { ofAction, Select, NgrxSelect } from '../index';
import { Action as NgRxAction, createFeatureSelector, createSelector, Store as NgRxStore } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

describe('ngrx-utils', () => {
  interface FooState {
    foo: boolean | null;
    bar?: {
      a?: {
        b?: any;
      };
    };
  }

  it('filters actions', () => {
    class MyAction implements NgRxAction {
      readonly type = 'myaction';
      constructor(public payload: any) {}
    }

    class MyAction2 implements NgRxAction {
      readonly type = 'myaction2';
    }

    class MyAction3 implements NgRxAction {
      readonly type = 'myaction3';
      constructor(public foo: any, public bar: any) {}
    }

    const action = new MyAction('foo'),
      action2 = new MyAction2(),
      action3 = new MyAction3('a', 0);
    const actions = of<NgRxAction>(action, action2, action3);
    const tappedActions: NgRxAction[] = [];
    actions.pipe(ofAction<MyAction | MyAction2>(MyAction, MyAction2)).subscribe(a => {
      tappedActions.push(a);
    });

    expect(tappedActions.length).toEqual(2);
    expect(tappedActions[0]).toBe(action);
    expect(tappedActions[1]).toBe(action2);
  });

  it('selects sub state', () => {
    const globalState: {
      myFeature: FooState;
    } = {
      myFeature: {
        foo: true,
        bar: {
          a: {
            b: {
              c: {
                d: 'world'
              }
            }
          }
        }
      }
    };

    const msFeature = createFeatureSelector<FooState>('myFeature');
    const msBar = createSelector(msFeature, state => state.bar);

    class MyStateSelector {
      @Select('myFeature.bar.a.b.c.d') hello$: Observable<string>; // deeply nested props
      @Select() myFeature: Observable<FooState>; // implied by name
      @Select(msBar) bar$: Observable<any>; // using MemoizedSelector
    }

    const store = new NgRxStore(of(globalState), undefined, undefined);

    try {
      NgrxSelect.store = store;

      const mss = new MyStateSelector();

      mss.hello$.subscribe(n => {
        expect(n).toBe('world');
      });

      mss.myFeature.subscribe(n => {
        expect(n).toBe(globalState.myFeature);
      });

      mss.bar$.subscribe(n => {
        expect(n).toBe(globalState.myFeature.bar);
      });
    } finally {
      NgrxSelect.store = undefined;
    }
  });
});
