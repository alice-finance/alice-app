import { ethers } from "ethers";
import Address from "./Address";

interface Connector {
    wallet: ethers.Wallet;
    address: Address;
}

export default Connector;
