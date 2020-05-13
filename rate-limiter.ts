
interface Options {
    /**
     * windowDurationMillis
     *
     * How long of a time period we should keep track of.
     *
     * Default value is 1 second.
     */
    windowDurationMillis?: number

    /*
     * maxCountPerWindow
     *
     * The maximum count of times we can do the operation in a time window.
     * If this is 10 and the window duration is 1 second, then the class
     * will enforce a max rate of 10 per second.
     */
    maxCountPerWindow: number
}

export default class RateLimiter {
    options: Options

    windowStartedTime: number
    count: number

    constructor(options: Options) {
        options.windowDurationMillis = options.windowDurationMillis || 1000;

        if (!options.maxCountPerWindow)
            throw new Error('missing required option: .maxCountPerWindow');

        this.options = options;
        this.windowStartedTime = Date.now();
        this.count = 0;
    }

    /**
     * Check if we should perform the rate-limited operation.
     *
     * If this returns true then the operation should be done. If this returns
     * false then we've hit the rate limit.
     *
     * This function also has the side effect of incrementing the rate count.
     */
    check(): boolean {
        // Check if the window has expired.
        const now = Date.now();
        if (now >= (this.windowStartedTime + this.options.windowDurationMillis)) {
            this.windowStartedTime = now;
            this.count = 0;
        }

        // Check if we've reached the limit for this window.
        if (this.count >= this.options.maxCountPerWindow) {
            return false;
        }

        this.count += 1;
        return true;
    }
}
