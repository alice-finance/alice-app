import EthereumChain from "@alice-finance/alice.js/dist/chains/EthereumChain";
import LoomChain from "@alice-finance/alice.js/dist/chains/LoomChain";
import { Linking } from "expo";
import { EthersSigner } from "loom-js/dist";
import { AddressMapper } from "loom-js/dist/contracts";
import Analytics from "../helpers/Analytics";
import Sentry from "./Sentry";

const LOOM_EXPLORER_URL = __DEV__
    ? "http://extdev-blockexplorer.dappchains.com"
    : "https://loom-blockexplorer.dappchains.com";

export const openTx = (txHash: string) => Linking.openURL(LOOM_EXPLORER_URL + "/tx/" + txHash);

export const openAddress = (address: string) => Linking.openURL(LOOM_EXPLORER_URL + "/address/" + address);

export const mapAccounts = async (ethereumChain: EthereumChain, loomChain: LoomChain): Promise<boolean> => {
    try {
        const addressMapper = await AddressMapper.createAsync(loomChain.getClient(), loomChain.getAddress());
        const hasMapping = await addressMapper.hasMappingAsync(ethereumChain.getAddress());
        if (!hasMapping) {
            const signer = new EthersSigner(ethereumChain.getSigner());
            await addressMapper.addIdentityMappingAsync(ethereumChain.getAddress(), loomChain.getAddress(), signer);

            Analytics.track(Analytics.events.ACCOUNT_MAPPED, {
                ethereum: ethereumChain.getAddress().toLocalAddressString(),
                loom: loomChain.getAddress().toLocalAddressString()
            });
        }

        return true;
    } catch (e) {
        Sentry.error(e);
        return false;
    }
};
