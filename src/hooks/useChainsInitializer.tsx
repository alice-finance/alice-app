import EthereumChain from "@alice-finance/alice.js/dist/chains/EthereumChain";
import LoomChain from "@alice-finance/alice.js/dist/chains/LoomChain";
import * as SecureStore from "expo-secure-store";
import { ethereumPrivateKeyFromMnemonic, loomPrivateKeyFromMnemonic } from "../utils/crypto-utils";
import { mapAccounts } from "../utils/loom-utils";

const useChainsInitializer = () => {
    const initialize = async (mnemonic: string) => {
        const ethereumPrivateKey = ethereumPrivateKeyFromMnemonic(mnemonic);
        const loomPrivateKey = loomPrivateKeyFromMnemonic(mnemonic);
        await SecureStore.setItemAsync("mnemonic", mnemonic);
        await SecureStore.setItemAsync("ethereumPrivateKey", ethereumPrivateKey);
        await SecureStore.setItemAsync("loomPrivateKey", loomPrivateKey);
        const ethereumChain = new EthereumChain(ethereumPrivateKey, __DEV__);
        const loomChain = new LoomChain(loomPrivateKey, __DEV__);
        await mapAccounts(ethereumChain, loomChain);
    };
    return { initialize };
};

export default useChainsInitializer;
