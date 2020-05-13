
# node-server-utils #

A few tiny utility libraries for Node.js-based services.

# Contents #

## promise-util.ts ##

Helper functions around Promises.

### API ###

#### timedOut(p: Promise, ms: number): Promise<boolean> ####

Returns true if the promise is still incomplete after `ms`.

Example usage:

    const operation = someAsyncOperation();

    if (await timedOut(operation, 5000)) {
        throw new Error("the operation timed out");
    }

    const result = await operation;

There's lots of ways to do timeouts, but this approach is one of the easier-to-read
options.

#### delay(ms: number): Promise ####

Resolves after 'ms' has elapsed.

## rate-limiter.ts ##

Limit how often a thing happens.

### API ###

#### interface Options ####

| name | description |
| ---- | ----------- |
| windowDurationMillis | Optional. How long of a time period to track. Default is 1000 (1 second). Usually this doesn't need to change. |
| maxCountPerWindow | Required. The maximum event count (in the window). If this is 10 and the windowDurationMillis is the default of one second, then the max rate will be 10 per second. |

#### class RateLimiter ####

| method | description |
| ------ | ----------- |
| `constructor(config: Options)` | Example: `new RateLimiter({ maxCountPerWindow: 10 })` |
| `check(): boolean` | Call this each time you might do the rate-limited action. If this returns true, then you should do the action. If it's false then we've passed the rate limit. |

## recurring-task.ts ##

Launch an ongoing task that can be paused & resumed.

### API ###

#### interface Options ####

| name     | type | required? | description |
| ---------- | ---- | --------- | ----------- |
| `perform`  | callback: `() => Promise` | required | Your callback that performs one iteration of the task. This will be called repeatedly. |
| `startRunning` | boolean | optional, default is `false` | Whether the task should be started immediately on creating the RecurringTask. |
| `onStart` | callback: `() => any` | optional | Callback triggered whenever we start the task. |
| `onStop` | callback: `() => any` | optional | Callback triggered whenever we stop the task. |
| `iterationDelay` | seconds number | optional, default is `5` | Delay between iterations. |
| `delayOnError` | seconds number | optional, default is to use `iterationDelay` | Delay between iterations after perform() throws an error. |
| logError | callback: `(s: string) => void` | optional | Callback for logging unhandled exceptions. |


#### class RecurringTask ####

| method | description |
| ------ | ----------- |
| `.shouldRun` | Whether the task should be running right now. |
| `constructor(options: Options) ` | Constructor |
| `setShouldRun(shouldRun: boolean)` | Set whether the task should be running or not. This will start/stop the task as needed. |

Note that this class doesn't interrupt/cancel your perform() callback when it's in-progress. The callback should either be short-running, or should periodically check the `.shouldRun` flag, to make sure that it stops quickly when required.
