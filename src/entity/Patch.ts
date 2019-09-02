class Patch {
    private _patchPartList = new Array<PatchPart>();

    private timestamp: number;

    constructor() {
        this.timestamp = new Date().valueOf();
    }

    public addBuffer(buffer: Buffer): Patch {
        let base64 = buffer.toString("base64");
        this._patchPartList.push(new UnMatchPatchPart(base64));
        this.timestamp = new Date().valueOf();
        return this;
    }

    public addBytes(bytes: number[]): Patch {
        let base64 = Buffer.from(bytes).toString("base64");
        this._patchPartList.push(new UnMatchPatchPart(base64));
        this.timestamp = new Date().valueOf();
        return this;
    }

    public addChunk(chunk: Chunk): Patch {
        this._patchPartList.push(new MatchPatchPart(chunk.index));
        this.timestamp = new Date().valueOf();
        return this;
    }

    get patchPartList(): PatchPart[] {
        return this._patchPartList;
    }
}
