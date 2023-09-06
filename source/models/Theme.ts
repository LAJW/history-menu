import Chrome from "../Chrome";

export interface ITheme {
    update(): void;
}

export class Theme implements ITheme {
    update(): void {
        Chrome.theme.updateTheme()
    }
}
