import { Alder32 } from "../core/Alder32";

function makeId(length: number):string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

let oldTime: number;
let newTime: number;
let str = makeId(10000000);
let number: number;

oldTime = new Date().valueOf();
number = Alder32.sum(Buffer.from(str));
console.log(number);
newTime = new Date().valueOf();
console.log(newTime-oldTime);
