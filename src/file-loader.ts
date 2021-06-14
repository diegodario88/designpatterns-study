import * as fs from 'fs';
import { RecordHandler } from './types/shared';

export function fileLoader<T>(
    fileName: string, recordHandler: RecordHandler<T>
): void {
    const data: T[] = JSON.parse(fs.readFileSync(fileName).toString());
    data.forEach((record) => recordHandler.addRecord(record));
}