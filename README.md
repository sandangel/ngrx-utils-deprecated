# NgRx Utils

This is a library provide cli tools, util functions, decorators to help reduce boilerplate and speedup your devs when working with ngrx using class based Action approach.

> The latest stable version is 1.2.1, you should use it instead of 1.2.0, which is will not work because I have published wrong folder.

Inspired from [ngrx-actions](https://github.com/amcdnl/ngrx-actions) by @amcdnl

After version 1.2.0, We have decided to move codebase to monorepo for a bigger project, with full features cli, and support more store util functions, operators...

You can track the work of new project at https://github.com/ngrx-utils/ngrx-utils

## What in the box

* ofAction pipeable operator. It will accept class based actions as parameters. Why this is better than ofType, default operator from @ngrx/effects?
  . Although ngrx/schematics and ngrx/codegen will give you tools to automatically generate some boilerplate and
  scaffolding enum action, reducer... for your app, it will also add a fairly large amount lines of code into your codebase.
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

  * When using ngrx/effect, You will have to cast type to have the correct action type because ofType only accept string. This seems acceptable, but sometimes your code look awful when there are 3 or 4 actions with same effects:

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

  * According to [ngrx/codegen proposal](https://paper.dropbox.com/doc/ngrxcodegen-Proposal-DhD934mmHfqTljpntnqJ3), to have a nice type inference in your effect ofType and get rid of this type casting, ngrx/codegen will use interface base Action, and generate a lookup type, which is another enum includes all action type value:

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

  We really feel this is like duplicating your action type enum :(

  * And with all of this, although you will have very nice type inference and static type checking but the trade off is when your app scale up, a **huge** amount of boilerplate will also be generated too. Thanks to `ofAction` pipeable operator, You now can get rid of all those boilerplate and type inference is __just work__. Since ngrx-utils 1.2.0, ofAction operator will smartly infer all Action type and you won't have to use type cast anymore.

![picture](assets/inference.gif)

* How about reducer? Do I have to type string manually in switch block? Don't worry about it. Thanks to smart infer type of typescript and nice auto completion feature, we now can have auto complete action type without an enum or const.
  If you are using VSCode, add this config to your settings to show suggestions within string quote:

```json
"editor.quickSuggestions": {
    "other": true,
    "comments": true,
    "strings": true
}
```

Then when you type `case ''`, and trigger quick suggestion shortcut `Ctrl + Space`.

![picture](assets/autocomplete.gif)

* Since version 1.1.0, ngrx-utils come with an builtin ngrx command to generate all boilerplate for you. All you have to do is just create Action Class declaration file like this:

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

* Then use ngrx command to generate Union Type for you. Since version 1.2.0, we have added support optionally generate reducer function with `-r` option and all the boilerplate will be nicely formatted with prettier before saving to file.

```sh
# npx ngrx [g | generate] [a | action] [-r | --reducer] path/to/action
npx ngrx g a -r path/to/user.action.ts
```

* This will generate `user.action.generated.ts` in the same folder with
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

* `@Select` decorator. This is always in the wish list of developers in the first days of ngrx. No more `this.prop = this.store.select(/* some prop */)` in your Component, now you can use `@Select` decorator instead as [describe below](README.md#L180)).

> Note: The Select decorator has a limitation is it lack of type checking due to [TypeScript#4881](https://github.com/Microsoft/TypeScript/issues/4881).

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

And you can start using it in any component. It also works with feature stores too. You don't have to do anything in your feature module. Don't forget to invoke the `connect` function when you are writing tests.

### Selects

`@Select` decorator has the same API with store.select method, with 1 more feature is it accepts a (deep) path string. This looks like:

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

* Migrate from 1.1

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

after: remove the type casting

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

### What's different with ngrx-actions

* Only provide `@Select` and `ofAction` pipeable operator. We really feel that `@Store`, `createReducer` and `@Action` from ngrx-actions increase much more boilerplate when using it in our app.
* No need reflect-metadata as a dependency

See [changelog](CHANGELOG.md) for latest changes.

## Common Questions

* _Will this work with normal Redux?_ While its designed for Angular and NGRX it would work perfectly fine for normal Redux. If that gets requested, I'll be happy to add better support too.
* _Do I have to rewrite my entire app to use this?_ No, you can use this in combination with the traditional switch statements or whatever you are currently doing.
* _Does it support AoT?_ Yes but see above example for details on implementation.
* _Does this work with NGRX Dev Tools?_ Yes, it does.
* _How does it work with testing?_ Everything should work the same way but don't forget if you use the selector tool to include that in your test runner though.

## Community

* Origin post from @amcdnl, exclude `@Store`, `createReducer` and `@Action` [Reducing Boilerplate with NGRX-ACTIONS](https://medium.com/@amcdnl/reducing-the-boilerplate-with-ngrx-actions-8de42a190aac)
