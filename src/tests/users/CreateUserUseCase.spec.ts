import { CreateUserUseCase } from './../../modules/users/useCases/createUser/CreateUserUseCase';
import { InMemoryUsersRepository } from './../../modules/users/repositories/in-memory/InMemoryUsersRepository';

let usersTestRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("create user unit tests", () => {
  beforeEach(() => {
    usersTestRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersTestRepository);
  });

  it("should be able to create a new user with valid infos", async () => {
    const user = await createUserUseCase.execute({
      email: "test@email.com",
      name: "memphis",
      password: "testpsswd213"
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBeDefined();
    expect(user.name).toBeDefined();
    expect(user.password).toBeDefined();
  });

  it("should not be able to create a new user with existent email", async () => {
    await expect(async () => {
      await createUserUseCase.execute({
        email: "test@email.com",
        name: "memphis",
        password: "testpsswd213"
      });

      await createUserUseCase.execute({
        email: "test@email.com",
        name: "new memphis",
        password: "diffpasswd32"
      })
    }).rejects.toEqual({ message: "User already exists", statusCode: 400 });
  });
});