import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UserProfileService } from './services/user-profile.service';
import { UserInventoryService } from './services/user-inventory.service';
import { TypeOrmUserRepositoryAdapter } from '../infrastructure/adapters/typeorm-user-repository.adapter';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserIngredient } from './entities/user-ingredient.entity';
import { Tool } from '../tools/entities/tool.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserIngredient, Tool, Ingredient]),
  ],
  providers: [
    UsersService, 
    UserProfileService, 
    UserInventoryService,
    TypeOrmUserRepositoryAdapter,
    {
      provide: 'UserRepositoryPort',
      useClass: TypeOrmUserRepositoryAdapter,
    },
  ],
  controllers: [UsersController],
  exports: [UsersService, UserProfileService, UserInventoryService, TypeOrmModule],
})
export class UsersModule {}
