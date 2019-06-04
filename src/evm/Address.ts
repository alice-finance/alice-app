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
    public toLocalAddressString = () => this.local.toChecksumString();
    public toString = () => this.chainId + ":" + this.toLocalAddressString();
    public isNull = () => this.local.toString() === NULL_ADDRESS;
}
