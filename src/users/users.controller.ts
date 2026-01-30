import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Query,
  Delete,
  NotFoundException,
  Session,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';

import { UpdateUserDto } from './dtos/update-user.dto';
// import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { currentUser } from './decorators/current-user.decorators';
import { CurrentUserInterceptor } from './decorators/current-user.interceptor';
import { User } from './user.entity';
// import { AuthGuard } from 'src/guards/auth.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { AuthGuard } from '../guards/auth.guard';

@Controller('auth')
@Serialize(UserDto)

// inteceptor for every controler
// @UseInterceptors(CurrentUserInterceptor)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authServise: AuthService,
  ) {}

  // @Get('/whoami')
  // whoAmI(@Session() session: any) {
  //   return this.usersService.findOne(session.userId);
  // }

  @Get('/whoami')
  @UseGuards(AuthGuard)
  whoAmI(@currentUser() user: User) {
    return user;
  }
  @Post('/signout')
  signOut(@Session() session: any) {
    session.userId = null;
    return { message: 'user signed out' };
  }
  @Post(`/signup`)
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authServise.signUp(body.email, body.password);
    session.userId = user.id;
    return user;
  }
  @Post('/signin')
  async signin(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authServise.signIn(body.email, body.password);
    session.userId = user.id;
    return user;
  }
  // @UseInterceptors(new SerializeInterceptor(UserDto))

  @Get(`/:id`)
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(Number(id));
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }
  @Get()
  async findAllUsers(@Query('email') email: string) {
    return this.usersService.find(email);
  }
  @Delete(`/:id`)
  removeUser(@Param(`id`) id: string) {
    return this.usersService.remove(Number(id));
  }
  @Patch(`/:id`)
  updateUer(@Body() body: UpdateUserDto, @Param('id') id: string) {
    return this.usersService.update(Number(id), body);
  }
}
