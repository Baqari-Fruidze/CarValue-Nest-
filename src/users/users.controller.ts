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
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';

import { UpdateUserDto } from './dtos/update-user.dto';

@Controller('auth')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Post(`/signup`)
  async createUser(@Body() body: CreateUserDto) {
    await this.usersService.create(body.email, body.password);
  }
  @UseInterceptors(ClassSerializerInterceptor)
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
