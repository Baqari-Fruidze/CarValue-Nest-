import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'kone@ge',
          password: 'kone',
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: 'wew' } as User]);
      },
      // remove: () => {},
      // update: () => {},
    };
    fakeAuthService = {
      signUp: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
      signIn: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it(`find all user with given email`, async () => {
    const users = await controller.findAllUsers('kone@ge');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('kone@ge');
  });
  it(`findUser with givn id`, async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });
  it(`throws an error with user with given id is not found`, async () => {
    fakeUsersService.findOne = () => null;

    await expect(controller.findUser('1')).rejects.toThrow('user not found');
  });
  it(`signin updates session object and returns user`, async () => {
    const session = {};
    const user = await controller.signin(
      {
        email: 'kone@ge',
        password: 'kone',
      },
      session,
    );
    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
