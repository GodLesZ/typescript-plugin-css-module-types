[![Build Status](https://travis-ci.com/GodLesZ/typescript-plugin-css-module-types.svg?branch=master)](https://travis-ci.com/GodLesZ/typescript-plugin-css-module-types)
[![codecov](https://codecov.io/gh/GodLesZ/typescript-plugin-css-module-types/branch/master/graph/badge.svg)](https://codecov.io/gh/GodLesZ/typescript-plugin-css-module-types)

# TS Types for CSS Modules

This Typescript plugin hooks itself into the Typescript Language Service 
to provide intellisense and validation for SCSS imports as [CSS Modules](https://github.com/css-modules/css-modules).

It supports `.module.scss` imports containing valid SCSS code.

## Features
The following SCSS (and CSS Modules) feature are supported:

```scss
// :global and :local identifier and functions
:global .global-class { }
:global(.global-class) { }
:local .local-class { }
:local(.local-class) { }

// Variables
$color: red;
.className {
  color: $color;
}

// Loops
$color: red;
@for $section from 1 to 5 {
    .section-#{$section} {
        color: $color;
    }
}
```

Also **imports** are supported.\
As of now there's also a limited path-resolution support to allow **module imports**.

```scss
@import "./relative/path/some/file";

@import "absolute/path/some/file";
```

# Thanks

Thanks to Microsoft and their nice [Language-Service-Plugin documentation](https://github.com/microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin).

- motivated by [facebook/create-react-app#5677](https://github.com/facebook/create-react-app/issues/5677)
- inspired by [timothykang/css-module-types](https://github.com/timothykang/css-module-types)   
