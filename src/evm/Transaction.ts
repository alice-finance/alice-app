import BN from "bn.js";
import { LocalAddress } from "loom-js/dist";

export default class Transaction {
    constructor(
        public hash: string,
        public blockHash: string,
        public from: LocalAddress,
        public to: LocalAddress,
        public value: BN
    ) {}
}
