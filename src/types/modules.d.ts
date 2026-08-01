declare module "figlet";
declare module "gradient-string";
declare module "chalk-animation";

declare module "bun:sqlite" {
  export class Database {
    constructor(path: string, options?: Record<string, any>);
    [key: string]: any;
  }
}
