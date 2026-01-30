import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('authService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  beforeEach(async () => {
    //create fake copy of user service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();
    service = module.get(AuthService);
  });
  it(`it create an instance of auth service`, async () => {
    expect(service).toBeDefined();
  });
  it(`creates new user with a salted and hasshed password`, async () => {
    const user = await service.signUp('alo@gmail.com', 'alo');
    expect(user.password).not.toEqual('alo');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });
  it(`throws an error with user already signed up email`, async () => {
    await service.signUp('kone@ge', 'kone');
    await expect(service.signUp('kone@ge', 'kone')).rejects.toThrow(
      BadRequestException,
    );
  });
  it('throws if signin is called with an unused email', async () => {
    await expect(
      service.signIn('asdflkj@asdlfkj.com', 'passdflkj'),
    ).rejects.toThrow(NotFoundException);
  });
  it('throws if an invalid password is provided', async () => {
    await service.signUp('kone@ge', 'kone');
    await expect(service.signIn('kone@ge', 'konee')).rejects.toThrow(
      BadRequestException,
    );
  });
  it('throws if invalid password provided', async () => {
    // Mocking find to return a user with a specific password
    fakeUsersService.find = () =>
      Promise.resolve([
        { email: 'adada@df.com', password: 'hashed_password' } as User,
      ]);

    // Modern assertion: cleaner and handles the promise resolution/rejection automatically
    await expect(
      service.signIn('adada@df.com', 'wrong_password'),
    ).rejects.toThrow(BadRequestException);
  });
  it(`returns user password if correct password is provided`, async () => {
    await service.signUp('kone@ge', 'kone');
    const user = await service.signIn('kone@ge', 'kone');
    expect(user).toBeDefined();
  });
});
