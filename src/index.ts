import {
    BaseRecord,
    Database,
    Pokemon,
    ObserverPayload,
    Listener,
    AfterSetEvent,
    BeforeSetEvent,
    Visitor,
    ScoreStrategy,
    Found,
    RecordHandler
} from "./types/shared";
import { fileLoader } from './file-loader';

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

        selectBest(scoreStrategy: ScoreStrategy<T>) {
            const found: Found<T> = { max: 0, item: undefined };

            const scoreReducer = (acc: Found<T>, current: T) => {
                const score = scoreStrategy(current);

                if (score > acc.max) {
                    acc.max = score;
                    acc.item = current;
                }

                return acc;
            }

            Object.values(this.records).reduce(scoreReducer, found);

            return found.item
        }
    }

    return InMemoryDatabase;
}

const DB = factoryDatabase<Pokemon>();

/**@description Adapter example */
class PokemonDBAdapter implements RecordHandler<Pokemon> {
    addRecord(record: Pokemon) {
        DB.client.set(record);
    }
}

const unsubscribe = DB.client.onAfterAdd(({ value }) => console.log(value));

const path = `${process.cwd()}/data.json`;
fileLoader(path, new PokemonDBAdapter());

DB.client
    .set({ id: 'Bulbasaur', attack: 50, defense: 20 })
    .set({ id: 'Charmander', attack: 40, defense: 30 })

unsubscribe();

DB.client
    .set({ id: 'Venusaur', attack: 30, defense: 50 })
    .set({ id: 'Ivysaur', attack: 40, defense: 40 })
    .onBeforeAdd(
        ({ newIncomeValue, value }) => console.table([newIncomeValue, value])
    );

DB.client.set({ id: 'Venusaur', attack: 35, defense: 60 });

DB.client.visit((item) => console.log(item.id));

const bestDefensive = DB.client.selectBest(({ defense }) => defense)?.id;
const bestAttack = DB.client.selectBest(({ attack }) => attack)?.id;

console.log(`Best defense -> ${bestDefensive}`);
console.log(`Best attack -> ${bestAttack}`);