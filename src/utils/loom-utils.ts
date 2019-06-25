import EthereumChain from "@alice-finance/alice.js/dist/chains/EthereumChain";
import LoomChain from "@alice-finance/alice.js/dist/chains/LoomChain";
import { EthersSigner } from "loom-js/dist";
import { AddressMapper } from "loom-js/dist/contracts";

export const mapAccounts = async (ethereumChain: EthereumChain, loomChain: LoomChain) => {
    const addressMapper = await AddressMapper.createAsync(loomChain.getClient(), loomChain.getAddress());
    const hasMapping = await addressMapper.hasMappingAsync(ethereumChain.getAddress());
    if (!hasMapping) {
        const signer = new EthersSigner(ethereumChain.getSigner());
        await addressMapper.addIdentityMappingAsync(ethereumChain.getAddress(), loomChain.getAddress(), signer);
    }
};
