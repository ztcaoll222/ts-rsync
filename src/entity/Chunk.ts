class Chunk {
    // 块号
    private _index: number;
    // 弱校验和
    private readonly _weakCheckSum: number;
    // 强校验和
    private readonly _strongCheckSum: string;

    constructor(index: number, weakCheckSum: number, strongCheckSum: string) {
        this._index = index;
        this._weakCheckSum = weakCheckSum;
        this._strongCheckSum = strongCheckSum;
    }

    get index(): number {
        return this._index;
    }

    set index(value: number) {
        this._index = value;
    }

    get weakCheckSum(): number {
        return this._weakCheckSum;
    }

    get strongCheckSum(): string {
        return this._strongCheckSum;
    }
}
