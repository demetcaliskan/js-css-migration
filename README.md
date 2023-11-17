# js-css-migration

🎨 Migrate your project from Styled Components to CSS Modules.

![npm-version](https://img.shields.io/npm/v/js-css-migration)

## Features

- Changes all styles.js files to styles.module.css.
- Creates a custom class inside styles.module.css for each Styled Component.
- Refactors the component's return statement with appropriate class names and HTML elements.
- Removes Styled Component imports and transfers any necessary import statements to the index.js file.

## Before You Install

# To be able to use command line,

# you can either download the package globally or you can add the following command to your package.json file:

```
  "scripts": {
    ...
    "migrate": "js-css-migration migrate"
  },
```

## Installation

# Global Installation

```sh
$ npm i js-css-migration -g
```

or

```sh
$ yarn global add js-css-migration
```

# Normal Installation

```sh
$ npm i js-css-migration
```

or

```sh
$ yarn install js-css-migration
```

## Basic usage

To migrate a specific folder path such as: /src/components/common

```sh
$ js-css-migration migrate <folder_path>
```

or

To migrate all components under the directory: /src/components/

```sh
$ js-css-migration migrate
```

If you added a script instead of downloading globally, you can use it like this:

```sh
$ npm migrate
```

or

```sh
$ yarn migrate <folder_path>
```

## Documentation

Upcoming.
