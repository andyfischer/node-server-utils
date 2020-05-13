
export interface Options {
    /*
     * The main callback to run on every iteration.
    */
    perform: () => Promise<any>

    /*
     * If true, then start the loop immediately.
    */
    startRunning?: boolean

    /*
     * Optional callback, triggered when we start the loop. (either for the first time,
     * or after being paused).
    */
    onStart?: () => any

    /*
     * Optional callback, triggered when we stop the loop.
    */
    onStop?: () => any

    /*
     * Optional delay between iterations. Default is 5 seconds.
     */
    iterationDelay?: number

    /*
     * Optional delay between iterations after an error has occured. Default is to use
     * 'iterationDelay'.
     */
    delayOnError?: number

    /*
     * Callback for logging any unhandled exceptions.
     */
    logError?: (s: string) => void
}

export default class RecurringTask {
    shouldRun = false
    isCurrentlyRunning = false

    options: Options

    constructor(options: Options) {
        this.options = options;
        options.logError = options.logError || () => void;
        if (options.iterationDelay === undefined)
            options.iterationDelay = 5000;

        if (options.startRunning)
            this.setShouldRun(true);
    }

    setShouldRun(shouldRun: boolean) {
        this.shouldRun = shouldRun;

        if (this.shouldRun && !this.isCurrentlyRunning) {
            this._start();
        }
    }

    _start() {
        if (this.isCurrentlyRunning)
            throw new Error("ThreadLoop internal error: thread is already running!");

        if (this.options.onStart) {
            try {
                this.options.onStart()
            } catch (err) {
                this.logError(err);
                return;
            }
        }

        this.isCurrentlyRunning = true;

        const iterate = async () => {

            if (!this.shouldRun) {

                // Stop the thread
                if (!this.isCurrentlyRunning)
                    throw new Error("ThreadLoop internal error: thread is already stopped!");

                this.isCurrentlyRunning = false;

                if (this.options.onStop) {
                    try {
                        this.options.onStop()
                    } catch (err) {
                        logError(err);
                    }
                }

                return;
            }

            try {
                await Promise.resolve(this.options.perform());

            } catch (err) {
                logError(err);
                setTimeout(iterate, this.options.delayOnError || this.options.iterationDelay);
                return;
            }

            setTimeout(iterate, this.options.iterationDelay);
        }

        setTimeout(iterate, 0);
    }
}

