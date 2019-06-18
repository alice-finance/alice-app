import { URL, URLSearchParams } from "whatwg-url";

(global as any).URL = URL;
(global as any).URLSearchParams = URLSearchParams;

if (typeof btoa === "undefined") {
    (global as any).btoa = (str: string) => {
        return new Buffer(str, "binary").toString("base64");
    };
}

if (typeof atob === "undefined") {
    (global as any).atob = (b64Encoded: string) => {
        return new Buffer(b64Encoded, "base64").toString("binary");
    };
}
