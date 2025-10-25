export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly auth0Id: string,
    public readonly createdAt?: Date
  ) {}
}

export default UserEntity
