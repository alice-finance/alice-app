import { Address, EthersSigner } from "loom-js/dist";
import { AddressMapper, TransferGateway } from "loom-js/dist/contracts";
import { bytesToHexAddr } from "loom-js/dist/crypto-utils";
import EthereumConnector from "../evm/EthereumConnector";
import LoomConnector from "../evm/LoomConnector";

export const mapAccounts = async (ethereumConnector: EthereumConnector, loomConnector: LoomConnector) => {
    const addressMapper = await AddressMapper.createAsync(loomConnector.client, loomConnector.address);
    const hasMapping = await addressMapper.hasMappingAsync(ethereumConnector.address);
    if (!hasMapping) {
        // @ts-ignore
        const signer = new EthersSigner(ethereumConnector.wallet);
        await addressMapper.addIdentityMappingAsync(ethereumConnector.address, loomConnector.address, signer);
    }
};

export const listenToTokenWithdrawal = (gateway: TransferGateway, assetAddress: Address, ownerAddress: Address) =>
    new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Timeout while waiting for withdrawal to be signed")), 120000);
        gateway.on(TransferGateway.EVENT_TOKEN_WITHDRAWAL, event => {
            if (event.tokenContract.equals(assetAddress) && event.tokenOwner.equals(ownerAddress)) {
                clearTimeout(timer);
                gateway.removeAllListeners(TransferGateway.EVENT_TOKEN_WITHDRAWAL);
                resolve(bytesToHexAddr(event.sig));
            }
        });
    });
