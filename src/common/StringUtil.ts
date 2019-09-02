import {createHash} from "crypto";

export class StringUtil {
    /**
     * md5 加密
     */
    public static md5Encode2Base64(buffer: Buffer): string {
        let hash = createHash("md5");
        return hash.update(buffer).digest("base64");
    }
}
