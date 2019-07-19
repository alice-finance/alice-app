import React, { DependencyList, useEffect } from "react";

const useAsyncEffect = (asyncEffect: () => Promise<any>, dependencies: DependencyList) =>
    useEffect(() => {
        asyncEffect().then();
    }, dependencies);

export default useAsyncEffect;
