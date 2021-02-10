import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CreateUserDto } from "./CreateUser.dto";
import User from "./user.entity";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) { }

    async create(userData: CreateUserDto) {
        const newUser = await this.userRepository.create(userData);
        await this.userRepository.save(newUser);

        return newUser;
    }

    async getByEmail(email: string) {
        return await this.userRepository.findOneOrFail({ email }, { relations: ['wallets'] , select: ['id', 'password', 'email']});
    }

    async getById(id: number) {
        return await this.userRepository.findOneOrFail({ id }, { relations: ['wallets'] });
    }

    async getUsersByEmails(emails: string[]) {
        return await this.userRepository.find(
            {
                where: {
                    email: In(emails)
                },
                relations: ['wallets']
            }
        );
    }
ł
}