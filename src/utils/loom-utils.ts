import { EthersSigner } from "loom-js/dist";
import { AddressMapper } from "loom-js/dist/contracts";
import EthereumChain from "../../alice-js/chains/EthereumChain";
import LoomChain from "../../alice-js/chains/LoomChain";

export const mapAccounts = async (ethereumChain: EthereumChain, loomChain: LoomChain) => {
    const addressMapper = await AddressMapper.createAsync(loomChain.getClient(), loomChain.getAddress());
    const hasMapping = await addressMapper.hasMappingAsync(ethereumChain.getAddress());
    if (!hasMapping) {
        const signer = new EthersSigner(ethereumChain.getSigner());
        await addressMapper.addIdentityMappingAsync(ethereumChain.getAddress(), loomChain.getAddress(), signer);
    }
};
