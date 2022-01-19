import { Service } from "./Service";

export class OAuthService extends Service {
    protected readonly route = '/oauth';

    private readonly REDIRECT = `${this.route}/redirect`;

    async redirect(asaID: number, userID: number): Promise<{ url: string }> {
        return (await this.client.get(`${this.REDIRECT}/${asaID}/${userID}`)).data;
    }
}
