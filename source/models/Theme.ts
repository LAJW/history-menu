import Chrome from "../Chrome";

export interface ITheme {
    update(): void;
    updateIcon(): Promise<void>;
    isDarkTheme: boolean;
}

export class Theme implements ITheme {
    update(): void {
        Chrome.theme.updateTheme()
    }

    updateIcon(): Promise<void> {
        return Chrome.theme.updateIcon();
    }

    isDarkTheme: boolean = Chrome.theme.isDarkTheme
}
