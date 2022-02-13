import { v4 as uuidV4 } from 'uuid';
import { GetBalanceUseCase } from './../../modules/statements/useCases/getBalance/GetBalanceUseCase';
import { InMemoryStatementsRepository } from "../../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../../modules/statements/useCases/createStatement/CreateStatementUseCase";
import { User } from "../../modules/users/entities/User";
import { InMemoryUsersRepository } from "../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../modules/users/useCases/createUser/CreateUserUseCase";
import { OperationType } from '../../modules/statements/entities/Statement';

let statementsTestRepository: InMemoryStatementsRepository;
let usersTestRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let user: User;

describe("get balance unit tests", () => {
  beforeEach(async () => {
    statementsTestRepository = new InMemoryStatementsRepository();
    usersTestRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersTestRepository);
    createStatementUseCase = new CreateStatementUseCase(usersTestRepository,statementsTestRepository);
    getBalanceUseCase = new GetBalanceUseCase(statementsTestRepository, usersTestRepository);

    user = await createUserUseCase.execute({
      name: "dave",
      email: "davetest@email.com",
      password: "davegoestohollywood"
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 150,
      description: "dinheiro pra comprar marlboro",
      type: OperationType.DEPOSIT
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 150,
      description: "saquei o dinheiro pra comprar marlboro",
      type: OperationType.WITHDRAW
    });
  });

  it("should be able to get the balance and statement from an existent user", async () => {
    const balance_statement = await getBalanceUseCase.execute({
      user_id: user.id as string
    });

    expect(balance_statement.balance).toBe(0);
    expect(balance_statement.statement.length).toBe(2);
  });

  it("should not be able to get any data from an unexistent user", async () => {
    expect(async () => {
      const fake_user_id = uuidV4();

      await getBalanceUseCase.execute({
        user_id: fake_user_id
      });
    }).rejects.toEqual({ message: "User not found", statusCode: 404 });
  });
});