import {FileInfo} from "../entity/FileInfo";
import * as util from "util";
import * as fs from "fs";

export class FileUtil {
    /**
     * 检查文件路径, 如果存在则返回文件信息
     */
    public static checkFile(file: FileInfo|string):FileInfo {
        let fileInfo: FileInfo|undefined;
        if (typeof file === FileInfo.name) {
            fileInfo = <FileInfo>file;
        } else if (typeof file === "string") {
            fileInfo = new FileInfo(file);
        }

        if (!fileInfo) {
            throw util.format("can not cast file to fileInfo")
        }

        if (!fileInfo.exists) {
            throw util.format("%s is not exists", fileInfo.absolutePath);
        }

        return fileInfo;
    }

    public static delete(file: FileInfo) {
        fs.unlinkSync(file.absolutePath);
    }

    public static renameTo(oldFile: FileInfo, newFile: FileInfo) {
        fs.renameSync(oldFile.absolutePath, newFile.absolutePath);
    }
}
