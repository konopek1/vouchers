import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "src/user/CreateUser.dto";
import { Repository } from "typeorm";
import Admin from "./admin.entity";

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>
    ) { }

    async create(userData: CreateUserDto) {
        const newAdmin = await this.adminRepository.create(userData);
        await this.adminRepository.save(newAdmin);

        return newAdmin;
    }

    async getByEmail(email: string) {
        return await this.adminRepository.findOneOrFail({ email }, { select: ['id', 'password', 'email']});
    }

    async getById(id: number) {
        return await this.adminRepository.findOneOrFail({ id }, { select: ['id', 'password', 'email']});
    }
}