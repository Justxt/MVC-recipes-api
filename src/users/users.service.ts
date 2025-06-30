import { Injectable, Logger } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserIngredientsDto } from './dto/manage-user-ingredients.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserProfileService } from './services/user-profile.service';
import { UserInventoryService } from './services/user-inventory.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly userInventoryService: UserInventoryService,
  ) {}
  
  async create(createUserDto: CreateUserDto) {
    return this.userProfileService.create(createUserDto);
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.userProfileService.findOneByEmail(email);
  }

  async findOneById(id: string): Promise<User | undefined> {
    return this.userProfileService.findOneById(id);
  }

  async updateUserProfile(
    userId: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.userProfileService.updateUserProfile(userId, updateUserProfileDto);
  }
  async updateUserIngredients(
    userId: string,
    updateIngredientsDto: UpdateUserIngredientsDto,
  ): Promise<{ success: boolean; availableIngredients: any[] }> {
    return this.userInventoryService.updateUserIngredients(userId, updateIngredientsDto);
  }

  async getUserIngredients(userId: string): Promise<any[]> {
    return this.userInventoryService.getUserIngredients(userId);
  }

  async addUserIngredient(
    userId: string,
    ingredientId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.userInventoryService.addUserIngredient(userId, ingredientId);
  }

  async removeUserIngredient(
    userId: string,
    ingredientId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.userInventoryService.removeUserIngredient(userId, ingredientId);
  }
}
