import { ethers } from "ethers";
import { TransactionRequest, TransactionResponse } from "ethers/providers";

class UncheckedJsonRpcSigner extends ethers.Signer {
    public readonly signer: ethers.providers.JsonRpcSigner;

    constructor(signer: ethers.providers.JsonRpcSigner) {
        super();
        this.signer = signer;
        ethers.utils.defineReadOnly(this, "signer", signer);
        ethers.utils.defineReadOnly(this, "provider", signer.provider);
    }

    public getAddress(): Promise<string> {
        return this.signer.getAddress();
    }

    public sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse> {
        return this.signer.sendUncheckedTransaction(transaction).then(hash => {
            return {
                hash,
                nonce: 0,
                gasLimit: new ethers.utils.BigNumber(0),
                gasPrice: new ethers.utils.BigNumber(0),
                data: "",
                value: new ethers.utils.BigNumber(0),
                chainId: 0,
                confirmations: 0,
                from: "",
                wait: (confirmations?: number) => this.signer.provider.waitForTransaction(hash, confirmations)
            };
        });
    }

    public signMessage(message: string | ethers.utils.Arrayish): Promise<string> {
        return this.signer.signMessage(message);
    }
}

export default UncheckedJsonRpcSigner;
