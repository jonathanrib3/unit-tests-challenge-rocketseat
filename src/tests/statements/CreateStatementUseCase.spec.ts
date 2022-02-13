import { v4 as uuidV4 } from 'uuid';
import { InMemoryUsersRepository } from './../../modules/users/repositories/in-memory/InMemoryUsersRepository';
import { CreateStatementUseCase } from './../../modules/statements/useCases/createStatement/CreateStatementUseCase';
import { CreateUserUseCase } from './../../modules/users/useCases/createUser/CreateUserUseCase';
import { InMemoryStatementsRepository } from './../../modules/statements/repositories/in-memory/InMemoryStatementsRepository';
import { User } from '../../modules/users/entities/User';
import { OperationType } from '../../modules/statements/entities/Statement';

let statementsTestRepository: InMemoryStatementsRepository;
let usersTestRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let user: User;

describe("create statement unit tests", () => {
  beforeEach(async () => {
    statementsTestRepository = new InMemoryStatementsRepository();
    usersTestRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersTestRepository);
    createStatementUseCase = new CreateStatementUseCase(usersTestRepository,statementsTestRepository);

    user = await createUserUseCase.execute({
      name: "dave",
      email: "davetest@email.com",
      password: "davegoestohollywood"
    });
  });

  it("should be able to add a deposit operation to an user's statement", async () => {
    const operation = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 150,
      description: "dinheiro pra comprar marlboro",
      type: OperationType.DEPOSIT
    });

    expect(operation.id).toBeDefined();
    expect(operation.user_id).toBe(user.id);
    expect(operation.amount).toBe(150);
    expect(operation.type).toBe(OperationType.DEPOSIT);
    expect(operation.description).toBe("dinheiro pra comprar marlboro");
  });

  it("should be able to add a withdraw operation to an user that has the available amount in the balance and add the operation to his statement",
    async () => {
      await createStatementUseCase.execute({
        user_id: user.id as string,
        amount: 150,
        description: "dinheiro pra comprar marlboro",
        type: OperationType.DEPOSIT
      });

      const withdraw_operation = await createStatementUseCase.execute({
        user_id: user.id as string,
        amount: 150,
        description: "saquei o dinheiro pra comprar marlboro",
        type: OperationType.WITHDRAW
      });

      expect(withdraw_operation.id).toBeDefined();
      expect(withdraw_operation.user_id).toBe(user.id);
      expect(withdraw_operation.amount).toBe(150);
      expect(withdraw_operation.type).toBe(OperationType.WITHDRAW);
      expect(withdraw_operation.description).toBe("saquei o dinheiro pra comprar marlboro");
    });

  it("should not be able to add any operation to an non existent user", async () => {
    expect(async () => {
      const fake_user_id = uuidV4();

      await createStatementUseCase.execute({
        user_id: fake_user_id,
        amount: 150,
        description: "dinheiro pra comprar gudang",
        type: OperationType.DEPOSIT
      });
    }).rejects.toEqual({ message: "User not found", statusCode: 404 });
  });

  it("should not be able to add a withdraw operation to an user that doesn't has the necessary amount", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: user.id as string,
        amount: 150,
        description: "dinheiro pra comprar winston",
        type: OperationType.WITHDRAW
      });
    }).rejects.toEqual({ message: "Insufficient funds", statusCode: 400 });
  });
});