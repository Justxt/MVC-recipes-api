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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateUserIngredientsDto } from './dto/manage-user-ingredients.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async getProfile(@Req() req) {
    const userId = req.user.id;
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
    return this.usersService.updateUserProfile(userId, updateUserProfileDto);
  }

  @Get('ingredients')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async getUserIngredients(@Req() req) {
    const userId = req.user.id;
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
    return this.usersService.updateUserIngredients(userId, updateIngredientsDto);
  }

  @Post('ingredients/:ingredientId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async addUserIngredient(
    @Req() req,
    @Param('ingredientId', ParseUUIDPipe) ingredientId: string,
  ) {
    const userId = req.user.id;
    return this.usersService.addUserIngredient(userId, ingredientId);
  }

  @Delete('ingredients/:ingredientId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async removeUserIngredient(
    @Req() req,
    @Param('ingredientId', ParseUUIDPipe) ingredientId: string,
  ) {
    const userId = req.user.id;
    return this.usersService.removeUserIngredient(userId, ingredientId);
  }
}
