interface BenchmarkResult {
    time: [number, number];
    error: boolean;
}

export default class Benchmark {

    private done: boolean;
    results: BenchmarkResult[] = [];

    constructor(private computation: () => Promise<any>) { }

    async run(n: number): Promise<any[]> {
        const comps = [];
        for (let i = 0; i < n; i++) {
            const start = process.hrtime();

            const comp = this.computation()
                .then((result) => ({
                    result,
                    i: this.results.push({ time: process.hrtime(start), error: false })
                }))
                .catch((error) => ({
                    result: JSON.stringify(error),
                    i: this.results.push({ time: process.hrtime(start), error: true })
                }))

            comps.push(comp);
        }

        const compsResults = await Promise.all(comps);
        this.done = true;
        return compsResults;
    }

    med(): number {
        if (!this.done) throw new Error("Benchmark hasn't finished");

        const results = this.filterErrors();
        const len = results.length;

        if (len % 2 === 1) {
            const ceil = Math.ceil(len / 2);
            const floor = Math.floor(len / 2);
            return (results[ceil].time[0] + results[floor].time[0]) / 2
        }

        return results[len / 2].time[0];
    }

    avg(): number {
        if (!this.done) throw new Error("Benchmark hasn't finished");

        const results = this.filterErrors();
        const len = results.length;

        const sum = results.reduce((p, c) => p + Number(`${c.time[0]}.${c.time[1]}`), 0);

        return sum / len;
    }

    filterErrors(): BenchmarkResult[] {
        if (!this.done) throw new Error("Benchmark hasn't finished");
        return this.results.filter(r => r.error === false)
    }



}

