/**
 * 不匹配的 chunk
 */
class UnMatchPatchPart extends PatchPart{
    private readonly _content: string;

    constructor(buffer: string) {
        super();
        this._content = buffer;
    }

    get content(): string {
        return this._content;
    }
}
