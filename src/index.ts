import {
    BaseRecord,
    Database,
    Pokemon,
    ObserverPayload,
    Listener,
    AfterSetEvent,
    BeforeSetEvent,
    Visitor
} from "./types/shared";

/**@description Observer (Pub/Sub) example */
function createObserver<EventType>(): ObserverPayload<EventType> {
    let listeners: Listener<EventType>[] = [];

    return {
        subscribe: (listener: Listener<EventType>) => {
            listeners.push(listener);
            return () => {
                listeners = listeners.filter((l) => l !== listener)
            }
        },
        publish: (event: EventType) => {
            listeners.forEach((l) => l(event));
        }
    }
}

/**@description Factory example returning a Singleton */
function factoryDatabase<T extends BaseRecord>() {
    class InMemoryDatabase implements Database<T> {
        private constructor() { }
        private records: Record<string, T> = {};
        private beforeAddListeners = createObserver<BeforeSetEvent<T>>();
        private afterAddListeners = createObserver<AfterSetEvent<T>>();

        static client: InMemoryDatabase = new InMemoryDatabase();

        public set(newValue: T): this {
            const key = newValue.id.toLowerCase();

            this.beforeAddListeners.publish({
                newIncomeValue: newValue, value: this.records[key]
            });

            this.records[key] = newValue;

            this.afterAddListeners.publish({
                value: this.records[key]
            });

            return this;
        }

        public get(id: string): T | undefined {
            const key = id.toLowerCase();
            return this.records[key];
        }

        onBeforeAdd(listener: Listener<BeforeSetEvent<T>>) {
            return this.beforeAddListeners.subscribe(listener);
        }

        onAfterAdd(listener: Listener<AfterSetEvent<T>>) {
            return this.afterAddListeners.subscribe(listener);
        }

        visit(visitor: Visitor<T>) {
            Object.values(this.records).forEach(visitor);
        }
    }

    return InMemoryDatabase;
}

const DB = factoryDatabase<Pokemon>();

const unsubscribe = DB.client.onAfterAdd(({ value }) => console.log(value));

DB.client
    .set({ id: 'Bulbasaur', attack: 50, defense: 20 })
    .set({ id: 'Charmander', attack: 40, defense: 30 })

unsubscribe();

DB.client.set({ id: 'Venusaur', attack: 30, defense: 50 });
DB.client.set({ id: 'Ivysaur', attack: 40, defense: 40 });

DB.client.onBeforeAdd(
    ({ newIncomeValue, value }) => console.table([newIncomeValue, value])
);

DB.client.set({ id: 'Venusaur', attack: 35, defense: 60 });

DB.client.visit((item) => console.log(item.id));