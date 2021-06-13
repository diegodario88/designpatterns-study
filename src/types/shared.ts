export interface Pokemon {
    id: string;
    attack: number;
    defense: number;
}

export interface BaseRecord {
    id: string;
}

export interface Database<T extends BaseRecord> {
    set(newValue: T): void;
    get(id: string): T | undefined;
}