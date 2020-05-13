
export function timedOut(p: Promise<any>, ms: number) : Promise<boolean> {

    return new Promise((resolve, reject) => {

        let timeout = setTimeout(() => resolve(true), ms);

        const didntTimeOut = () => {
            clearTimeout(timeout);
            resolve(false);
        };

        p.then(didntTimeOut)
        .catch((err) => {
            didntTimeOut()
        });
    });
}

/*
 * Resolves after the given millisecond delay.
 */
export function delay(ms: number) : Promise<null> {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}
