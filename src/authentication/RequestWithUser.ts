import { Request } from "express";
import Admin from "src/admin/admin.entity";
import User from "src/user/user.entity";

export default interface RequestWithUser extends Request {
    user: User|Admin;
}