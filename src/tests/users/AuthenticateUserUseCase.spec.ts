import { CreateUserUseCase } from './../../modules/users/useCases/createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from './../../modules/users/useCases/authenticateUser/AuthenticateUserUseCase';
import { InMemoryUsersRepository } from './../../modules/users/repositories/in-memory/InMemoryUsersRepository';

let usersTestRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authUserUseCase: AuthenticateUserUseCase;

describe("authenticate user unit tests", () => {
  beforeEach(async () => {
    usersTestRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersTestRepository);
    authUserUseCase = new AuthenticateUserUseCase(usersTestRepository);
    
    await createUserUseCase.execute({
      name: "dave",
      email: "davetest@email.com",
      password: "davegoestohollywood"
    });
  });

  it("should be able to generate a new token to an existent user", async () => {
    const token = await authUserUseCase.execute({
      email: "davetest@email.com",
      password: "davegoestohollywood"
    });
    
    expect(token).toBeDefined();
  });

  it("should not be able to authenticate user with invalid data", async () => {
    await expect(async () => {
      await authUserUseCase.execute({
        email: "wrongemail@email.com",
        password: "WROOOOOOOOOOOONG"
      });
    }).rejects.toEqual({ message: "Incorrect email or password", statusCode: 401 });
  });
});