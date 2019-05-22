import Web3 from "web3";

interface Wallet {
    web3: Web3;
    mnemonic: string;
    privateKey?: string;
    address?: string;

    addEventListener: (event: "connected" | "disconnected", listener: (...args: any[]) => void) => void;
    removeEventListener: (event: "connected" | "disconnected", listener: (...args: any[]) => void) => void;
}

export default Wallet;
