interface Content {
    id?: number;
    textDE: string;
    textEN: string;
    textES: string;
}

export interface PageContent {
    greeting: Content;
    heartButton: Content;
    wishes: Content[];
}

export enum LanguageType {
    DE = 0,
    EN = 1,
    ES = 2,
}