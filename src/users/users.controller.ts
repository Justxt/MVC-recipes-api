import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateUserIngredientsDto } from './dto/manage-user-ingredients.dto';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async getProfile(@Req() req) {
    const userId = req.user.id;
    this.logger.log(`Getting profile for user ID: ${userId}`);
    return this.usersService.findOneById(userId);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async updateProfile(
    @Req() req,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const userId = req.user.id;
    this.logger.log(`Updating profile for user ID: ${userId}`);
    return this.usersService.updateUserProfile(userId, updateUserProfileDto);
  }

  @Get('ingredients')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async getUserIngredients(@Req() req) {
    const userId = req.user.id;
    this.logger.log(`Getting ingredients for user ID: ${userId}`);
    const ingredients = await this.usersService.getUserIngredients(userId);
    return { availableIngredients: ingredients };
  }

  @Post('ingredients')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async updateUserIngredients(
    @Req() req,
    @Body() updateIngredientsDto: UpdateUserIngredientsDto,
  ) {
    const userId = req.user.id;
    this.logger.log(`Updating ingredients for user ID: ${userId}, ingredients count: ${updateIngredientsDto.ingredientIds.length}`);
    return this.usersService.updateUserIngredients(userId, updateIngredientsDto);
  }

  @Post('ingredients/:ingredientId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)  async addUserIngredient(
    @Req() req,
    @Param('ingredientId', ParseUUIDPipe) ingredientId: string,
  ) {
    const userId = req.user.id;
    this.logger.log(`Adding ingredient ${ingredientId} to user ${userId}`);
    return this.usersService.addUserIngredient(userId, ingredientId);
  }

  @Delete('ingredients/:ingredientId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)  async removeUserIngredient(
    @Req() req,
    @Param('ingredientId', ParseUUIDPipe) ingredientId: string,
  ) {
    const userId = req.user.id;
    this.logger.log(`Removing ingredient ${ingredientId} from user ${userId}`);
    return this.usersService.removeUserIngredient(userId, ingredientId);
  }
}
