// src/components/navigator.d.ts

// This declaration file tells TypeScript about the shape of the NodeNavigator class
// from the plain JavaScript file (navigator.js).

declare module './navigator.js' {
  export class NodeNavigator {
    constructor(mountElement: HTMLElement);
    init(initialNodeId: string, nodeData: any[]): void;
    navigateToId(targetId: string): void;
    setConnectedNodeActive(isActive: boolean): void;
  }
}

// FIX: Add an empty export to ensure this file is treated as a module.
export {};