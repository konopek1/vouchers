export default interface TokenPayload {
    userId: number,
    role: Role
}

export enum Role {
    User,
    Admin
}