import { AxiosInstance } from 'axios';
import { createContext } from 'react';
import { createAxiosInstance } from '../AxiosInstance';
import { AsaService } from './AsaService';
import AuthService from './AuthService';
import { ContractService } from './ContractService';
import { PaymentService } from './PaymentService';
import { Service } from './Service';
import { WalletService } from './WalletService';

export default class ServiceRegistry {

    private static instance: ServiceRegistry | null = null;

    private services: Map<ServiceClass, Service> = new Map();

    private constructor() { }


    private static create(client: AxiosInstance, ...services: ServiceClass[]): ServiceRegistry {

        const serviceRegistry = new ServiceRegistry();

        for (const ServiceClass of services) {
            serviceRegistry.services.set(ServiceClass, new ServiceClass(client, serviceRegistry));
        }

        return serviceRegistry;
    }

    public static getInstance(...services: ServiceClass[]): ServiceRegistry {
        if (ServiceRegistry.instance === null) {

            ServiceRegistry.instance = ServiceRegistry.create(createAxiosInstance(), ...services);
        }
        return ServiceRegistry.instance;
    }

    public getService<T extends Service>(serviceClass: ServiceClass): T {
        //TODO typescript is crying and i dont have time
        const serviceInstance = this.services.get(serviceClass) as any;
        if (serviceInstance) {
            return serviceInstance;
        } else {
            throw Error();
        }
    }
}

export type ServiceClass = {
    new(client: AxiosInstance, serviceRegistry: ServiceRegistry): Service
}



export const ServiceRegistryContext = createContext<ServiceRegistry | null>(ServiceRegistry.getInstance(
    PaymentService,
    WalletService,
    AsaService,
    ContractService,
    AuthService,
));


