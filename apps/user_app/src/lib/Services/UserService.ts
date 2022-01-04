import { Service } from "./Service";

export class UserService extends Service {
    protected readonly route = '/user';

    private readonly BALANCE = `${this.route}/balance`;

    public async balance() {
        return (await this.client.get(this.BALANCE)).data;
    }
}
