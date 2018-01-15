# 1.2.0 - Jan 15th, 2018

* feat(cli): optionally generate reducer with -r option in ngrx command
* feat(store-utils): improve infer type in ofAction

# 1.1.3 - Jan 15th, 2018

* fix(store-utils): fix export at top level

# 1.1.2 - Jan 14th, 2018

* fix(cli): ensure action type is valid TS identifier

# 1.1.1 - Jan 13th, 2018

* fix(cli): add missing generate type to command

before:

```sh
npx ngrx g path/to/action
```

after:

```sh
# npx ngrx [g | generate] [a | action] path/to/action
npx ngrx g a path/to/action
```

* fix(cli): generate right file on windows

# 1.1.0 - Jan 13th, 2018

* feat(cli): Introduce ngrx command to generate action boilerplate. Closes #1

# 1.0.0 - Jan 12th, 2018

* Initial Releases
