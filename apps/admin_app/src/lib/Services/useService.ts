import { useContext } from "react";
import { Service } from "./Service";
import { ServiceClass, ServiceRegistryContext } from "./ServiceRegistry";

export function useService<T extends Service>(serviceClass: ServiceClass): T {
    const serviceRegistry = useContext(ServiceRegistryContext);

    if(serviceRegistry) {
        return serviceRegistry.getService(serviceClass);
    } else {
        throw Error(`Service Registry Context is null`);
    }
}