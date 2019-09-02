import * as fs from 'fs';
import * as path from 'path';

/**
 * 文件信息
 */
export class FileInfo {
    /**
     * 是否存在
     */
    private readonly _exists: boolean;
    /**
     * 文件大小
     */
    private readonly _size: number | undefined;
    /**
     * 拓展名
     */
    private readonly _extname: string | undefined;
    /**
     * 绝对路径
     */
    private readonly _absolutePath: string;

    constructor(filePath: string) {
        this._exists = fs.existsSync(filePath);
        if (this._exists) {
            this._size = fs.statSync(filePath).size;
            this._extname = path.extname(filePath);
        }
        this._absolutePath = path.resolve(filePath);
    }

    get exists(): boolean {
        return this._exists;
    }

    get size(): number {
        // @ts-ignore
        return this._size;
    }

    get extname(): string {
        // @ts-ignore
        return this._extname;
    }

    get absolutePath(): string {
        return this._absolutePath;
    }
}
