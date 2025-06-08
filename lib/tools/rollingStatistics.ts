// This class implements rolling univariate statistics. It holds data in a
// circular buffer and is able to report the count, mean, and median values.
export class RollingStatistics {
    #buffer: number[];
    #count: number;
    #index: number;
    #sum: number;
    constructor(size: number) {
        this.#buffer = new Array(size);
        this.#count = 0;
        this.#index = 0;
        this.#sum = 0;
    }

    // add a value to the buffer. If the buffer is full, the oldest value has to
    // be subtracted from the sum before overwriting it with the new value.
    addValue(value: number) {
        if (this.#count < this.#buffer.length) {
            this.#count++;
        } else {
            this.#sum -= this.#buffer[this.#index];
        }
        this.#buffer[this.#index] = value;
        this.#index = (this.#index + 1) % this.#buffer.length;
        this.#sum += value;
    }

    // get the count of the buffer
    get count() {
        return this.#count;
    }

    // get the mean of the buffer
    get mean() {
        return this.#sum / this.#buffer.length;
    }

    // get the median of the buffer
    get median() {
        const sorted = [...this.#buffer].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted[mid];
    }
}
