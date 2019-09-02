/**
 * @see https://en.wikipedia.org/wiki/Adler-32
 */
export class Alder32 {
    /**
     * largest prime smaller than 65536
     */
    private static BASE = 65521;

    /**
     * Largest value n such that 255n(n+1)/2 + (n+1)(BASE-1) <= 2^32-1
     *
     * NMAX is just how often modulo needs to be taken of the two checksum word halves to prevent overflowing a 32 bit
     * nteger.
     * This is an optimization. We "could" take the modulo after each byte, and it must be taken before each digest
     */
    private static NMAX = 5552;

    public static sum(buffer?: Buffer, adler: number = 1): number {
        if (!buffer) {
            return 1;
        }

        let a = adler & 0xffff;
        let b = (adler >>> 16) & 0xffff;
        let len = buffer.length;
        let n: number;
        let i = 0;

        while (len > 0) {
            n = len > this.NMAX ? this.NMAX : len;
            len -= n;
            do {
                a += buffer.readInt8(i++);
                b += a;
            } while (--n);

            a %= this.BASE;
            b %= this.BASE;
        }

        return ((b << 16) | a) >>> 0;
    }

    public static roll(sum: number, len: number, c1: number, c2: number): number {
        let a = sum % 0xffff;
        let b = (sum >>> 16) % 0xffff;
        a = (a - c2 + c1 + this.BASE) % this.BASE;
        b = (b - ((len * c2) % this.BASE) + a - 1 + this.BASE) % this.BASE;
        return ((b << 16) | a) >>> 0;
    }
}
