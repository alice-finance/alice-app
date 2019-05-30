import contract from "truffle-contract";
import TruffleContract from "truffle-contract/lib/contract/constructorMethods";
import Web3 from "web3";

export default class Contract {
    public contract: TruffleContract;

    constructor(public web3: Web3, json: { abi: object; networks: object }) {
        this.contract = contract(json);
        this.contract.setProvider(this.web3.currentProvider);
        this.contract.defaults({ from: this.web3.eth.defaultAccount });
    }

    public new(...args: any[]): any {
        return this.contract.new(args);
    }

    public deployed(): Promise<any> {
        return this.contract.deployed();
    }

    public at(address: string): any {
        return this.contract.at(address);
    }
}
