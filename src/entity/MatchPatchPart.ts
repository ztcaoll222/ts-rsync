/**
 * 匹配的 chunk
 */
class MatchPatchPart extends PatchPart {
    private readonly _index: number;

    constructor(index: number) {
        super();
        this._index = index;
    }

    get index(): number {
        return this._index;
    }
}
