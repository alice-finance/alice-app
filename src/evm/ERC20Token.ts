import Address from "../evm/Address";

export default class ERC20Token {
    constructor(
        public name: string,
        public symbol: string,
        public decimals: number,
        public loomAddress: Address,
        public ethereumAddress: Address
    ) {}
}
