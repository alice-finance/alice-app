import { Linking } from "expo";

const ETHER_SCAN_URL = __DEV__ ? "https://rinkeby.etherscan.io" : "https://etherscan.io";

export const openTx = (txHash: string) => Linking.openURL(ETHER_SCAN_URL + "/tx/" + txHash);
