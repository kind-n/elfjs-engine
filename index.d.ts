// Type definitions for elfjs-engine v2.0
// Project: https://www.elfjs.org/
// Definitions by: Wu Hu <https://github.com/kind-n>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.6


import * as Elf from "elfjs";

declare module "elfjs" {

    export function renderToString (element: JSX.Element): string;

    export function redactByLayout (astObject: Elf.AbstractSyntaxTree, ...depends: (ComponentConstructor | DirectiveConstructor | TransformConstructor)[]): () => JSX.Element;
}

export = Elf;