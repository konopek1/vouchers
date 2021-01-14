import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CreateUserDto } from "./CreateUserDto";
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
        return await this.userRepository.findOneOrFail({ email });
    }

    async getById(id: number) {
        return await this.userRepository.findOneOrFail({ id });
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
}