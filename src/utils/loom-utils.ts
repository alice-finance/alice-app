import { EthersSigner } from "loom-js/dist";
import { AddressMapper } from "loom-js/dist/contracts";
import EthereumConnector from "../evm/EthereumConnector";
import LoomConnector from "../evm/LoomConnector";

export const mapAccounts = async (ethereumConnector: EthereumConnector, loomConnector: LoomConnector) => {
    const addressMapper = await AddressMapper.createAsync(loomConnector.client, loomConnector.address);
    const hasMapping = await addressMapper.hasMappingAsync(ethereumConnector.address);
    if (!hasMapping) {
        // @ts-ignore
        const signer = new EthersSigner(ethereumConnector.getSigner());
        await addressMapper.addIdentityMappingAsync(ethereumConnector.address, loomConnector.address, signer);
    }
};
