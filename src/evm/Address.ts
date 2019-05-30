import { Address as LoomAddress } from "loom-js";
import { NULL_ADDRESS } from "../constants/token";

export default class Address extends LoomAddress {
    public toLocalAddressString = () => this.local.toChecksumString();
    public isNull = () => this.local.toString() === NULL_ADDRESS;
}
