import { generateAccount, mnemonicToMasterDerivationKey, mnemonicToSecretKey } from "algosdk";
import Benchmark from "./benchmark";
import { createAsa, randomString } from "./create_asa";
import { createApp, distribute } from "./distribute_asa";
import { transfer } from "./transfer_asa";

const ADMIN_MEMO = "glory hair saddle kingdom fitness nice outdoor chest speak any speed caught speed yellow cactus endorse borrow bitter rival few sustain turkey extra ability relief";

async function benchmarkCreateAsa() {
    const app = await createApp();

    const benchmark = new Benchmark(() => createAsa(app, ADMIN_MEMO));

    const results = await benchmark.run(1);

    console.table(results)
    console.table(benchmark.results)
    console.log(`Mediana czasów w sekundach: ${benchmark.med()}`);
}


async function benchmarkDistribute() {
    const app = await createApp();

    const asa = await createAsa(app, ADMIN_MEMO);

    const benchmark = new Benchmark(() => distribute(app, asa.id));

    const results = await benchmark.run(1);

    console.table(benchmark.results);
    console.log(`Mediana czasów w sekundach: ${benchmark.med()}`)
    console.log(`Średnia czasów w sekundach: ${benchmark.avg()}`)
}


async function benchmarkTransfer() {
    const app = await createApp();

    const asa = { id: 91 };

    const user = mnemonicToSecretKey(ADMIN_MEMO);

    const { supplierAccount, userWallet } = await distribute(app, asa.id);

    const benchmark = new Benchmark((() => {
        let i = 1;
        return () => transfer(app, asa.id, supplierAccount.addr, userWallet.addr, supplierAccount.sk, i++)
    })());

    const results = await benchmark.run(1);

    console.table(benchmark.results);
    console.log(`Mediana czasów w sekundach: ${benchmark.med()}`)
    console.log(`Średnia czasów w sekundach: ${benchmark.avg()}`)
}


(async () => {
    try {
        await benchmarkCreateAsa();
        await benchmarkDistribute();
        await benchmarkTransfer();
    } catch (error) {
        console.log(error)
    }

    process.exit(0)
})()