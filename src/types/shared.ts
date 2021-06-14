export type Listener<T> = (env: T) => void; 
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
    onBeforeAdd(listener: Listener<BeforeSetEvent<T>>): () => void;
    onAfterAdd(listener: Listener<AfterSetEvent<T>>): () => void;
}

export interface ObserverPayload<T> {
    subscribe: (listener: Listener<T>) => () => void;
    publish: (event: T) => void; 
}

export interface BeforeSetEvent<T> {
    value: T;
    newIncomeValue: T;
}

export interface AfterSetEvent<T> {
    value: T;
}