import { v4 as uuidV4 } from 'uuid';
import { Statement } from './../../modules/statements/entities/Statement';
import { GetStatementOperationUseCase } from './../../modules/statements/useCases/getStatementOperation/GetStatementOperationUseCase';
import { InMemoryStatementsRepository } from "../../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../../modules/statements/useCases/createStatement/CreateStatementUseCase";
import { InMemoryUsersRepository } from "../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../modules/users/useCases/createUser/CreateUserUseCase";
import { User } from '../../modules/users/entities/User';
import { OperationType } from '../../modules/statements/entities/Statement';

let statementsTestRepository: InMemoryStatementsRepository;
let usersTestRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getOperationUseCase: GetStatementOperationUseCase;
let user: User;
let searched_operation: Statement;

describe("get statement operation unit tests", () => {
  beforeEach(async () => {
    statementsTestRepository = new InMemoryStatementsRepository();
    usersTestRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersTestRepository);
    createStatementUseCase = new CreateStatementUseCase(usersTestRepository,statementsTestRepository);
    getOperationUseCase = new GetStatementOperationUseCase(usersTestRepository, statementsTestRepository);
    
     user = await createUserUseCase.execute({
      name: "dave",
      email: "davetest@email.com",
      password: "davegoestohollywood"
    });
  
    searched_operation = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 150,
      description: "dinheiro pra comprar marlboro",
      type: OperationType.DEPOSIT
    });
  });

  it("should be able to search an operation from an user through its ids", async () => {
    const operation = await getOperationUseCase.execute({
      statement_id: searched_operation.id as string,
      user_id: user.id as string
    });

    expect(operation).toEqual(searched_operation);
  });

  it("should not be able to search an unexistent operation from an existent user", async () => {
    expect(async () => {
      const fake_operation_id = uuidV4();

      await getOperationUseCase.execute({
        statement_id: fake_operation_id,
        user_id: user.id as string
      });
    }).rejects.toEqual({ message: "Statement not found", statusCode: 404 });
  });

  it("should not be able to search any operation from an unexistent user", async () => {
    expect(async () => {
      const fake_user_id = uuidV4();

      await getOperationUseCase.execute({
        statement_id: searched_operation.id as string,
        user_id: fake_user_id
      });
    }).rejects.toEqual({ message: "User not found", statusCode: 404 });
  });
});
