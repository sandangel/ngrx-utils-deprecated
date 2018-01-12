# NgRx Utils

This is a [fork of ngrx-actions](https://github.com/amcdnl/ngrx-actions) by @amcdnl

### What in the box?
- Now you can get rid of `const ACTION = '[Action] My Action'`... 
All you have to do is just create Action classes and Union Type for them. This
is possible thanks to `ofAction` lettable operator.

- No more `this.prop = this.store.select(/* some prop */)` in your Component. You can use `@Select` 
decorator instead.

> Note: The Select decorator has a limitation is it lack of type checking due to [TypeScript#4881](https://github.com/Microsoft/TypeScript/issues/4881).

- How about reducer? You can continue to use your reducer as before, except
just use normal string instead of enum or constant. Don't worry about auto complete.
If you are using VSCode, add this config to your settings:

```json
"editor.quickSuggestions": {
    "other": true,
    "comments": true,
    "strings": true
}
```
Then when you type `case '['`, the completion will show up.

```typescript
export function authReducer(state = initialState, action: AuthActions): AuthState {
  switch (action.type) {
    case '[Auth] Login':
      return {
        ...state,
        loading: true,
        loaded: false,
      };
    /* ... */
    default:
      return state;
  }
}
```
- Only has `@angular/core, @ngrx/store, @ngrx/effects, rxjs` as dependencies.

## Getting Started

### Install

```sh
npm i ngrx-utils -S
# or
yarn add ngrx-utils
```

Then in your app.module.ts (Only Add this code to your AppModule), connect ngrx-utils to your store: 

```typescript
import { NgrxSelect, NgrxUtilsModule } from 'ngrx-utils';
import { Store } from '@ngrx/store';

@NgModule({
    //...
    imports: [/* ... */, NgrxUtilsModule]
})
export class AppModule {
  constructor(ngrxSelect: NgrxSelect, store: Store<any>) {
    ngrxSelect.connect(store);
  }
}
```

And you can start using it in any component.
This can help clean up your root store selects. 
It also works with feature stores too. You don't have to do anything in your feature module. 
Don't forget when you are writing tests to invoke the `connect` function in your test runner.

### Selects
There is a `Select` decorator that has same API with
store.select method, with 1 more feature is it accepts a (deep) path string. 
This looks like:

```typescript
export class MyComponent {
  /* use property name when there is no specified */
  /* same as this.myFeature = store.select('myFeature') */
  @Select() myFeature: Observable<any>;
    
  /** use '.' to separate properties to get from store 
  /* equivalent with: 
  /* const getMyFeature = createFeatureSelect('myFeature');
  /* const getMyProp = createSelect(getMyFeature, state => state.myProp);
  /* ... In your component class
  /* this.myProp = store.select(getMyProp);
  */
  @Select('myFeature.myProp') myProp: Observable<any>;
  
  /* does same way as store.select('myFeature', 'anotherProp') */
  @Select('myFeature', 'anotherProp') anotherProp: Observable<any>; 
  
  /* use selectors composed by createSelector */
  @Select(fromStore.getMyWifeProp) myWifeProp: Observable<Dangerous | null>;
}
```

### ofAction:

- You can use ofAction operator instead of ofType to filter your Action type in Effect:

```typescript

import { ofAction } from 'ngrx-utils';
import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

import { RouterGo } from '../../rootStore';

import { GetUser, RefreshUser, GetUserSuccess, GetUserFail } from '../actions';

@Injectable()
export class MyEffects {
    constructor(
        private actions$: Actions,
        private myService: MyService
    ) {}

    @Effect()
    getUser$ = this.actions$.pipe(
        ofAction<GetUser | RefreshUser>(GetUser, RefreshUser),
        /* cast action type when there are multi actions */
        switchMap(action => this.myService.getAll(action.payload).pipe(
            map(res => new GetUserSuccess(res)),
            catchError(err => of(new GetUserFail(err)))
        ))
    );
    
    @Effect()
    getUserSuccess$ = this.actions$.pipe(
       ofAction(GetUserSuccess),
       /* automatically infer GetUserSuccess action type when there is only 1 */
       map(action => new RouterGo({ path: [action.payload] }))
    );
}
```

### What's different with ngrx-actions?
- Only provide `@Select` and `ofAction` lettable operator. I feel that `@Store`, `createReducer`
and `@Action` from ngrx-actions increase much more boilerplate than ngrx reducer.
- No need reflect-metadata as a dependency
- You can reuse your reducer function as before

See [changelog](CHANGELOG.md) for latest changes.

## Common Questions
- _Will this work with normal Redux?_ While its designed for Angular and NGRX it would work perfectly fine for normal Redux. If that gets requested, I'll be happy to add better support too.
- _Do I have to rewrite my entire app to use this?_ No, you can use this in combination with the tranditional switch statements or whatever you are currently doing.
- _Does it support AoT?_ Yes but see above example for details on implementation.
- _Does this work with NGRX Dev Tools?_ Yes, it does.
- _How does it work with testing?_ Everything should work the same way but don't forget if you use the selector tool to include that in your test runner though.

## Community
- Origin post from @amcdnl, exlude `@Store`, `createReducer` and `@Action` [Reducing Boilerplate with NGRX-ACTIONS](https://medium.com/@amcdnl/reducing-the-boilerplate-with-ngrx-actions-8de42a190aac)
