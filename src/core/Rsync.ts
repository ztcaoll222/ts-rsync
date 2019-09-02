import {RandomAccessFile} from "./RandomAccessFile";
import {StringUtil} from "../common/StringUtil";
import {Alder32} from "./Alder32";
import {FileUtil} from "../common/FileUtil";

class Rsync {
    /**
     * 块大小
     */
    private static CHUNK_SIZE = 512;

    /**
     * 计算每块的 checksum
     */
    private static calcCheckSum(buffer: Buffer, index: number): Chunk {
        let weakCheckSum = Alder32.sum(buffer);
        let strongCheckSum = StringUtil.md5Encode2Base64(buffer);
        return new Chunk(index, weakCheckSum, strongCheckSum);
    }

    /**
     * 计算文件的 CheckSum 列表
     */
    public static calcCheckSumFromFile(filePath: string): Map<number, Chunk[]> {
        let chunkMaps = new Map<number, Chunk[]>();

        let raf = RandomAccessFile.create(filePath, "r");
        let size = raf.fileInfo.size;
        let index = 0;
        while (size > 0) {
            let readSize = Math.min(size, this.CHUNK_SIZE);
            let buffer = Buffer.alloc(readSize);
            raf.read(buffer);
            let chunk = Rsync.calcCheckSum(buffer, index++);

            let chunkList = chunkMaps.get(chunk.weakCheckSum);
            if (chunkList) {
                chunkList.push(chunk);
            } else {
                let tChunkList = new Array<Chunk>();
                tChunkList.push(chunk);
                chunkMaps.set(chunk.weakCheckSum, tChunkList);
            }
            size -= readSize;
        }

        return chunkMaps;
    }

    /**
     * 读取下一块
     */
    private static readNextChunk(raf: RandomAccessFile, size: number): Buffer {
        let readSize = Math.min(size, this.CHUNK_SIZE);
        let buffer = Buffer.alloc(readSize);
        raf.read(buffer);
        return buffer;
    }

    /**
     * 抛去头一个字节, 读取下一个字节
     */
    private static readNextByte(raf: RandomAccessFile, buffer: Buffer) {
        let next = Buffer.alloc(1);
        raf.read(next);
        for (let i = 0; i < buffer.length - 1; i++) {
            buffer.writeInt8(buffer.readInt8(i + 1), i);
        }

        buffer.writeInt8(next.readInt8(0), buffer.length - 1);
    }

    /**
     * 根据传入的字节数组去匹配，如果匹配到则返回该 Chunk, 否者为空
     */
    private static match(chunkMaps: Map<number, Chunk[]>, buffer: Buffer): Chunk | undefined {
        let weakCheckSum = Alder32.sum(buffer);
        let strongCheckSum = StringUtil.md5Encode2Base64(buffer);

        let chunkList = chunkMaps.get(weakCheckSum);
        if (chunkList) {
            return chunkList.find(it => it.strongCheckSum === strongCheckSum)
        }
        return undefined;
    }

    /**
     * 创建补丁
     */
    public static createPatch(filePath: string, chunkMaps: Map<number, Chunk[]>): Patch {
        let patch = new Patch();

        let raf = RandomAccessFile.create(filePath, "r");

        let size = raf.fileInfo.size;

        let buffer = Buffer.alloc(0);
        let diffBuffer = new Array<number>();

        let nextBlock = true;

        let chunk: Chunk | undefined = undefined;

        //判断是否匹配
        while (size > 0) {
            if (nextBlock) {
                buffer = Rsync.readNextChunk(raf, size);
                size -= buffer.length;
            } else {
                Rsync.readNextByte(raf, buffer);
                size--;
            }

            chunk = Rsync.match(chunkMaps, buffer);
            if (chunk) {
                // 如果 diff bytes 不为空, 先将它加进 patch
                if (diffBuffer.length > 0) {
                    patch.addBytes(diffBuffer);
                    diffBuffer = new Array<number>();
                }
                patch.addChunk(chunk);
                nextBlock = true;
            } else {
                // 保存头一个字节
                diffBuffer.push(buffer.readInt8(0));
                nextBlock = false;
            }
        }

        //最后一个 block 没有匹配上 需要把 bytes 中的剩余数据加入到 diffBytes 中，头一个字节已经加入了
        if (!chunk) {
            for (let i = 1; i < buffer.length; i++) {
                diffBuffer.push(buffer.readInt8(i));
            }
        }
        patch.addBytes(diffBuffer);
        raf.close();

        return patch;
    }

    /**
     * 接受补丁
     */
    public static applyPatch(patch: Patch, filePatch: string) {
        let tFilePath = filePatch + ".tmp";
        let raf = RandomAccessFile.create(filePatch, "r");
        let tRaf = RandomAccessFile.create(tFilePath, "w+");
        let size = raf.fileInfo.size;

        patch.patchPartList.forEach(patchPart => {
            if (patchPart instanceof UnMatchPatchPart) {
                let buffer = new Buffer((<UnMatchPatchPart>patchPart).content, "base64");
                tRaf.write(buffer);
            } else {
                let matchPatchPart = <MatchPatchPart> patchPart;

                let position = matchPatchPart.index * this.CHUNK_SIZE;
                raf.seek(position);

                let readSize = Math.min(size-position, this.CHUNK_SIZE);
                let buffer = Buffer.alloc(readSize);
                raf.read(buffer);
                tRaf.write(buffer);
            }
        });

        raf.close();
        tRaf.close();

        FileUtil.delete(raf.fileInfo);
        FileUtil.renameTo(tRaf.fileInfo, raf.fileInfo);
        FileUtil.delete(tRaf.fileInfo);
    }
}
