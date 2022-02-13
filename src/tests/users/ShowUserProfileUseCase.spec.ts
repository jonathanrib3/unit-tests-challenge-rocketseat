import { ShowUserProfileUseCase } from './../../modules/users/useCases/showUserProfile/ShowUserProfileUseCase';
import { InMemoryUsersRepository } from "../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../modules/users/useCases/createUser/CreateUserUseCase";
import { User } from '../../modules/users/entities/User';
import { v4 as uuidV4 } from 'uuid';

let usersTestRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserUseCase: ShowUserProfileUseCase;
let user: User;

describe("show user profile unit tests", () => {
  beforeEach(async () => {
    usersTestRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersTestRepository);
    showUserUseCase = new ShowUserProfileUseCase(usersTestRepository);
  
    user = await createUserUseCase.execute({
      name: "dave",
      email: "davetest@email.com",
      password: "davegoestohollywood"
    });
  });

  it("should be able to show an existent user's profile", async () => {
    const profile = await showUserUseCase.execute(user.id as string);

    expect(profile).toEqual(user);
  });

  it("should not be able to show an unexistent user's profile", async () => {
    expect(async () => {
      const fake_id = uuidV4();

      await showUserUseCase.execute(fake_id);
    }).rejects.toEqual({ message: "User not found", statusCode: 404 });
  });
});