import User from "src/entities/user.entity";

export default interface RequestWithUser extends Request {
    user: User;
}