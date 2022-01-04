import { AxiosInstance } from "axios";
import ServiceRegistry from "./ServiceRegistry";

export abstract class Service {
    protected readonly client: AxiosInstance;
    protected readonly serviceRegistry: ServiceRegistry;

    protected abstract readonly route: string;

    constructor(client: AxiosInstance, serviceRegistry: ServiceRegistry) {
        this.client = client;
        this.serviceRegistry = serviceRegistry;
    }
}