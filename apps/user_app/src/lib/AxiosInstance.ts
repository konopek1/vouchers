import { decodeUnsignedTransaction, Transaction } from "algosdk";
import axios, { AxiosAdapter, AxiosInstance, AxiosResponse } from "axios";
import { Agent } from "https";
import { LOGIN } from "../Constants/routes";

export function createAxiosInstance(adapter?: AxiosAdapter): AxiosInstance {
    const axiosInstance = axios.create({
        baseURL: process.env.REACT_APP_BACKEND_URL,
        httpsAgent: new Agent({
            rejectUnauthorized: false
        }),
        withCredentials: true,
        validateStatus,
    });

    axiosInstance.interceptors.response.use(transactionDeserializer);

    return axiosInstance;
}

function transactionDeserializer(response: AxiosResponse): AxiosResponse {
    switch (response.data._serialize) {
        case 'Transaction':
            response.data = deserializeTransaction(response.data.txn);
            break;
        case 'Transactions':
            response.data = deserializeTransactions(response.data.txn);
            break;
        default:
            break;
    }

    return response;
}

function deserializeTransaction(transaction: number[]): Transaction {
    const blob = Uint8Array.from(transaction);
    const decodedTx = decodeUnsignedTransaction(blob);

    return decodedTx;
}

function deserializeTransactions(transactions: number[][]): Transaction[] {
    const blobs = transactions.map((x: number[]) => new Uint8Array(x))
    const decodedTxs = blobs.map(decodeUnsignedTransaction);

    return decodedTxs;
}

function validateStatus(status: number): boolean {
    ifUnauthorizedRedirectToLogInPage(status);

    return status >= 200 && status < 300;
}


function ifUnauthorizedRedirectToLogInPage(status: number) {
    if(status === 401) {
        document.location = document.location.origin + LOGIN as unknown as Location;
    }
}