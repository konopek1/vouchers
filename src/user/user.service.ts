import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import User from "src/entities/user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./CreateUser.dto";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {}

    async getByEmail(email: string) {
        return await this.userRepository.findOneOrFail({email});
    }
    
    async create(userData: CreateUserDto) {
        const newUser = await this.userRepository.create(userData);
        await this.userRepository.save(newUser);

        return newUser;
    }
}