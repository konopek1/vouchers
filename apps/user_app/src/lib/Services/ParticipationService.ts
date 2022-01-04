import { Service } from "./Service";

export class ParticipationService extends Service {
    
    protected readonly route = '/participation';

    private readonly GENERATE_TOKEN = (asaID: string) => `${this.route}/token/${asaID}`;


    public async generateToken(asaID: number): Promise<string> {
        return (await this.client.get(this.GENERATE_TOKEN(asaID.toString()))).data;
    }
}