import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserIngredient } from './entities/user-ingredient.entity';
import { Tool } from '../tools/entities/tool.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserIngredient, Tool, Ingredient]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
