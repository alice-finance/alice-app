import contract from "truffle-contract";
import Web3 from "web3";

export default class ContractFactory {
    public contract: any;

    constructor(
        public web3: Web3,
        json: {
            abi: object;
            networks?: {
                [networkName: string]: { address?: string; transactionHash?: string; events?: object; links?: object };
            };
        }
    ) {
        this.contract = contract(json);
        this.contract.setProvider(this.web3.currentProvider);
        this.contract.defaults({ from: this.web3.eth.defaultAccount });
    }

    public new(...args: any[]): Promise<any> {
        return this.contract.new(args);
    }

    public deployed(): Promise<any> {
        return this.contract.deployed();
    }

    public at(address: string): Promise<any> {
        return this.contract.at(address);
    }
}
