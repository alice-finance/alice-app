import BN from "bn.js";
import Web3 from "web3";
import Address from "./Address";

interface Wallet {
    web3: Web3;
    mnemonic: string;
    address: Address;

    addEventListener: (event: "connected" | "disconnected", listener: (...args: any[]) => void) => void;
    removeEventListener: (event: "connected" | "disconnected", listener: (...args: any[]) => void) => void;
    balanceOf: () => Promise<BN>;
}

export default Wallet;
