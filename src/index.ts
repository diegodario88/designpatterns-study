import { BaseRecord, Database, Pokemon } from "./types/shared";

/**@description Factory example returning a Singleton */
function factoryDatabase<T extends BaseRecord>() {
    class InMemoryDatabase implements Database<T> {
        private constructor(){}
        private records: Record<string, T> = {};
        static client: InMemoryDatabase = new InMemoryDatabase();

        public set(newValue: T): this {
            const key = newValue.id.toLowerCase();
            this.records[key] = newValue;
            return this;
        }
    
        public get(id: string): T | undefined {
            const key = id.toLowerCase();
            return this.records[key];
        }
    }

    return InMemoryDatabase;
}


const DB = factoryDatabase<Pokemon>();

const result = DB.client.set({id: 'Bulbasaur', attack: 50, defense: 20});

console.log(result);
