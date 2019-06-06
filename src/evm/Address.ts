import { ETHEREUM_NETWORK_NAME, LOOM_NETWORK_NAME } from "react-native-dotenv";

import { Address as LoomAddress, LocalAddress } from "loom-js";
import { NULL_ADDRESS } from "../constants/token";

export default class Address extends LoomAddress {
    public static fromString(address: string): Address {
        const parts = address.split(":");
        if (parts.length !== 2) {
            throw new Error("Invalid address string");
        }
        return new Address(parts[0], LocalAddress.fromHexString(parts[1]));
    }
    public static newEthereumAddress(address: string): Address {
        return new Address(ETHEREUM_NETWORK_NAME, LocalAddress.fromHexString(address));
    }
    public static newLoomAddress(address: string): Address {
        return new Address(LOOM_NETWORK_NAME, LocalAddress.fromHexString(address));
    }
    public toLocalAddressString = () => this.local.toChecksumString();
    public toString = () => this.chainId + ":" + this.toLocalAddressString();
    public isNull = () => this.local.toString() === NULL_ADDRESS;
}
