# NgRx Utils

This is a library provide cli tools, util functions to help reduce boilerplate and speedup your devs when working with ngrx and use
class based Action approacch.

[Inspired from ngrx-actions](https://github.com/amcdnl/ngrx-actions) by @amcdnl

After version 1.2.0, We have decided to move codebase to monorepo for a bigger project,
with full features cli, and support more store util functions, operators...

You can track the work of new project add https://github.com/ngrx-utils/ngrx-utils

### What in the box?

* Use ofAction pipeable operator accept class based actions as parameters. Why this is better than ofType, default operator from @ngrx/effects?
  . Although ngrx/schematics and ngrx/codegen will give you tools to automatically generate some boilerplate and
  scaffolding enum action, reducer..., it will also add a fairly large amount lines of code into your codebase.
  Using const or enum to store action type like this:

  ```typescript
  export enum AuthActionType {
    Login = '[Auth] Login',
    Logout = '[Auth] Logout',
    LoginSuccess = '[Auth] Login Success',
    LoginFail = '[Auth] Login Fail',
    RetrieveAuth = '[Auth] Retrieve Auth',
    RetrieveAuthSuccess = '[Auth] Retrieve Auth Success',
    RetrieveAuthFail = '[Auth] Retrieve Auth Fail'
  }
  ```

  . When using ngrx/effect, You will have to cast type to have the correct action type because ofType only accept string. This seems good, but sometimes your code look awful when there are 3 or 4 actions with same effects:

  ```typescript
  @Effect()
  getCoilItems$ = this.actions$
    .ofType<GetEnvItems | GetAccItems | RefreshEnvItems | RefreshAccItems>(
      AccActionType.GetAccItems,
      AccActionType.RefreshAccItems,
      EnvActionType.GetEnvItems,
      EnvActionType.RefreshEnvItems,
    )
  ```

  According to [ngrx/codegen proposal](https://paper.dropbox.com/doc/ngrxcodegen-Proposal-DhD934mmHfqTljpntnqJ3), to have a nice type infer in your effect and get rid of this type casting, ngrx/codegen will use interface base Action, and generate a lookup type, which is another enum includes all action type value:

  ```typescript
  interface LoginAction extends Action {
    type: '[Auth] Login';
    payload: any;
  }

  /*...*/

  export type AuthActions =
    | LoginAction
    | LogoutAction
    | LoginSuccess
    | LoginFail
    | Retrieve
    | RetrieveSuccess
    | RetrieveFail;

  export type AuthActionLookup = {
    '[Auth] Login': LoginAction;
    '[Auth] Logout': LogoutAction;
    '[Auth] Login Success': LoginSuccess;
    '[Auth] Login Fail': LoginFail;
    '[Auth] Retrieve Auth': Retrieve;
    '[Auth] Retrieve Auth Success': RetrieveSuccess;
    '[Auth] Retrieve Auth Fail': RetrieveFail;
  };
  ```

. And with all of this, when your app scale up, a `nightmare` large amount of boilerplate will be generated too. Thanks to `ofAction` pipeable operator, You now can get rid of all those boilerplate. Since ngrx-utils 1.2.0, ofAction operator will smartly infer all Action type and you won't have to use type cast anymore.
before:

```typescript
@Effect()
getUser$ = this.actions$.pipe(
  ofAction<GetUser | RefreshUser>(GetUser, RefreshUser),
  /* cast action type when there are multi actions */
  switchMap(action =>
    this.myService
      .getAll(action.payload)
      .pipe(map(res => new GetUserSuccess(res)), catchError(err => of(new GetUserFail(err))))
  )
);
```

after:

```typescript
@Effect()
getUser$ = this.actions$.pipe(
  ofAction(GetUser, RefreshUser),
  switchMap(action /* action will have type GetUser | RefreshUser */ =>
    this.myService
      .getAll(action.payload)
      .pipe(map(res => new GetUserSuccess(res)), catchError(err => of(new GetUserFail(err))))
  )
);
```

* How about reducer? Do I have to type string manually in switch block? Don't worry about it. Thanks to smart infer type of typescript and
  nice autocompletion feature, we now can have autocomplete action type without an enum or const.
  If you are using VSCode, add this config to your settings to show autocomplete within string quote:

```json
"editor.quickSuggestions": {
    "other": true,
    "comments": true,
    "strings": true
}
```

Then when you type `case ''`, and trigger quick suggestion shortcut `Ctrl + Space`.

```typescript
export function authReducer(state = initialState, action: AuthActions): AuthState {
  switch (action.type) {
    case '[Auth] Login':
      return {
        ...state,
        loading: true,
        loaded: false
      };
    /* ... */
    default:
      return state;
  }
}
```

* Since version 1.1.0, ngrx-utils come with an builtin ngrx command to
  generate all boilerplate for you. All you have to do is just create Action Class declaration file
  like this:

user.action.ts:

```typescript
import { Action } from '@ngrx/store';

export class GetUsers implements Action {
  readonly type = '[User] Get Users';
  constructor(public payload: string) {}
}

export class RefreshUsers implements Action {
  readonly type = '[User] Refresh Users';
  constructor(public payload: string) {}
}
```

Then ngrx will automatically generate Union Type for you. Since version 1.2.0, we have added support optionally
generate reducer function with `-r` option in command.

```sh
# npx ngrx [g | generate] [a | action] [-r | --reducer] path/to/action
npx ngrx g a -r path/to/user.action.ts
```

This will generate `user.action.generated.ts` in the same folder with
`user.action.ts`

```typescript
import { GetUsers, RefreshUsers } from './user.action';

export type UserActions = GetUsers | RefreshUsers;

// with -r option
export function userReducer(state: any, action: UserActions): any {
  case '[User] Get User':
    return {
      ...state
    };
  case '[User] Refresh User':
    return {
      ...state
    };
  default:
    return state;
}
```

> This command actually is a modified version of @ngrx/codegen to accept class base action.

* No more `this.prop = this.store.select(/* some prop */)` in your Component. You can use `@Select`
  decorator instead.

> Note: The Select decorator has a limitation is it lack of type checking due to [TypeScript#4881](https://github.com/Microsoft/TypeScript/issues/4881).

* Only has `@angular/core, @ngrx/store, @ngrx/effects, rxjs` as dependencies.

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
  imports: [, /* ... */ NgrxUtilsModule]
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
  /** use property name when there is no specified
   * same as this.myFeature = store.select('myFeature')
   */
  @Select() myFeature: Observable<any>;

  /** use '.' to separate properties to get from store
   * equivalent with:
   * const getMyFeature = createFeatureSelect('myFeature');
   * const getMyProp = createSelect(getMyFeature, state => state.myProp);
   * ... In your component class
   * this.myProp = store.select(getMyProp);
   */
  @Select('myFeature.myProp') myProp: Observable<any>;

  /* does same way as store.select('myFeature', 'anotherProp') */
  @Select('myFeature', 'anotherProp')
  anotherProp: Observable<any>;

  /* use selectors composed by createSelector */
  @Select(fromStore.getMyWifeProp) myWifeProp: Observable<Dangerous | null>;
}
```

### ofAction:

* You can use ofAction operator instead of ofType to filter your Action type in Effect:

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
  constructor(private actions$: Actions, private myService: MyService) {}

  @Effect()
  getUser$ = this.actions$.pipe(
    ofAction(GetUser, RefreshUser),
    /* dont have to cast action type when there are multi actions */
    switchMap((action) /* GetUser | RefreshUser */ =>
      this.myService
        .getAll(action.payload)
        .pipe(map(res => new GetUserSuccess(res)), catchError(err => of(new GetUserFail(err)))))
  );

  @Effect()
  getUserSuccess$ = this.actions$.pipe(
    ofAction(GetUserSuccess),
    /* automatically infer GetUserSuccess action type */
    map(action => new RouterGo({ path: [action.payload] }))
  );
}
```

### What's different with ngrx-actions?

* Only provide `@Select` and `ofAction` lettable operator. I feel that `@Store`, `createReducer`
  and `@Action` from ngrx-actions increase much more boilerplate than ngrx reducer.
* No need reflect-metadata as a dependency
* You can reuse your reducer function as before

See [changelog](CHANGELOG.md) for latest changes.

## Common Questions

* _Will this work with normal Redux?_ While its designed for Angular and NGRX it would work perfectly fine for normal Redux. If that gets requested, I'll be happy to add better support too.
* _Do I have to rewrite my entire app to use this?_ No, you can use this in combination with the tranditional switch statements or whatever you are currently doing.
* _Does it support AoT?_ Yes but see above example for details on implementation.
* _Does this work with NGRX Dev Tools?_ Yes, it does.
* _How does it work with testing?_ Everything should work the same way but don't forget if you use the selector tool to include that in your test runner though.

## Community

* Origin post from @amcdnl, exlude `@Store`, `createReducer` and `@Action` [Reducing Boilerplate with NGRX-ACTIONS](https://medium.com/@amcdnl/reducing-the-boilerplate-with-ngrx-actions-8de42a190aac)
