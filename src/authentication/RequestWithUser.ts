import { Request } from "express";
import User from "../user/user.entity";

export default interface RequestWithUser extends Request {
    user: User;
}