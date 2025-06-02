import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { RecipeFeedback } from './entities/recipe-feedback.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('feedback')
export class FeedbackController {
  private readonly logger = new Logger(FeedbackController.name);

  constructor(private readonly feedbackService: FeedbackService) {}
  @Post(':recipeId') // Changed route to include recipeId
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async createFeedback(
    @Param('recipeId', ParseUUIDPipe) recipeId: string, // Added recipeId as a parameter
    @Req() req,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ): Promise<RecipeFeedback> {
    const userId = req.user.id;

    if (!userId) {
      this.logger.error(
        'User not authenticated properly for feedback creation',
      );
      throw new Error('Usuario no autenticado correctamente.');
    }

    this.logger.log(
      `Creating feedback for recipe ${recipeId} by user ${userId}`,
    );
    return this.feedbackService.createFeedback(
      userId,
      recipeId,
      createFeedbackDto,
    ); // Pass recipeId to service
  }

  @Get('recipe/:recipeId')
  @HttpCode(200)
  async getRecipeFeedback(
    @Param('recipeId', ParseUUIDPipe) recipeId: string,
  ): Promise<RecipeFeedback[]> {
    this.logger.log(`Getting feedback for recipe ID: ${recipeId}`);
    return this.feedbackService.getRecipeFeedback(recipeId);
  }
  @Get('recipe/:recipeId/average-rating')
  @HttpCode(200)
  async getAverageRating(
    @Param('recipeId', ParseUUIDPipe) recipeId: string,
  ): Promise<{ averageRating: number }> {
    this.logger.log(`Getting average rating for recipe ID: ${recipeId}`);
    const averageRating = await this.feedbackService.getAverageRating(recipeId);
    return { averageRating };
  }
}
