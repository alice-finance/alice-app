// @ts-ignore
import { ETHER_SCAN_URL } from "react-native-dotenv";

import { Linking } from "expo";

export const openTx = (txHash: string) => Linking.openURL(ETHER_SCAN_URL + "/tx/" + txHash);
