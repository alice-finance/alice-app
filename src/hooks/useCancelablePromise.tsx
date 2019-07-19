import { useEffect, useRef } from "react";

interface WrappedPromise {
    promise: Promise<any>;
    cancel: () => void;
}

export function makeCancelable(promise: Promise<any>): WrappedPromise {
    let isCanceled = false;

    const wrappedPromise = new Promise((resolve, reject) => {
        promise
            .then(val => (isCanceled ? reject(new Error("cancelled")) : resolve(val)))
            .catch(error => (isCanceled ? reject(new Error("cancelled")) : reject(error)));
    });

    return {
        promise: wrappedPromise,
        cancel() {
            isCanceled = true;
        }
    };
}

const useCancelablePromise = () => {
    const promises = useRef<WrappedPromise[]>([]);

    useEffect(() => {
        promises.current = promises.current || [];
        return () => {
            promises.current.forEach(p => p.cancel());
            promises.current = [];
        };
    }, []);

    function cancelablePromise(p: Promise<any>) {
        const cPromise = makeCancelable(p);
        promises.current.push(cPromise);
        return cPromise.promise;
    }

    function cancelAll() {
        promises.current.forEach(p => p.cancel());
        promises.current = [];
    }

    return { cancelablePromise, cancelAll };
};

export default useCancelablePromise;
