import { fromMnemonic, mnemonicToSeed } from "ethers/utils/hdnode";
import HDKey from "hdkey";
import { CryptoUtils } from "loom-js/dist";

export const ethereumPrivateKeyFromMnemonic = (mnemonic: string) => {
    return fromMnemonic(mnemonic).privateKey;
};

export const loomPrivateKeyFromMnemonic = (mnemonic: string) => {
    const seed = mnemonicToSeed(mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed).derive("m/44'/148'/0'");
    return CryptoUtils.Uint8ArrayToB64(CryptoUtils.generatePrivateKeyFromSeed(hdkey.privateKey));
};
