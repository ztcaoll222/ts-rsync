import {FileInfo} from "../entity/FileInfo";
import {FileUtil} from "../common/FileUtil";
import * as fs from "fs";

export class RandomAccessFile {
    /**
     * 文件信息
     */
    private readonly _fileInfo: FileInfo;
    /**
     * 打开方式
     */
    private readonly _mode: string;
    /**
     * 打开的文件
     */
    private readonly fd: number;
    /**
     * 起始位置
     */
    private position: number;

    private constructor(fileInfo: FileInfo, mode: string) {
        this._fileInfo = fileInfo;
        this._mode = mode;
        this.fd = fs.openSync(fileInfo.absolutePath, mode);
        this.position = 0;
    }

    get fileInfo(): FileInfo {
        return this._fileInfo;
    }

    get mode(): string {
        return this._mode;
    }

    public static create(file: FileInfo|string, mode: string) : RandomAccessFile {
        let fileInfo = FileUtil.checkFile(file);
        return new RandomAccessFile(fileInfo, mode);
    }

    public read(buffer: Buffer, bufferOffset = 0) {
        fs.readSync(this.fd, buffer, bufferOffset, buffer.length, this.position);
        this.position += buffer.length;
    }

    public seek(position: number) {
        this.position = position;
    }

    public write(buffer: Buffer, bufferOffset = 0) {
        fs.writeSync(this.fd, buffer, bufferOffset, buffer.length, this.position);
        this.position += buffer.length;
    }

    public close() {
        fs.closeSync(this.fd);
    }
}
