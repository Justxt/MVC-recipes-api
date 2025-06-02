import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecipeFeedback } from './entities/recipe-feedback.entity';
import { Recipe } from './entities/recipe.entity';
import { User } from '../users/entities/user.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    @InjectRepository(RecipeFeedback)
    private readonly feedbackRepository: Repository<RecipeFeedback>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createFeedback(
    userId: string,
    createFeedbackDto: CreateFeedbackDto,
  ): Promise<RecipeFeedback> {
    this.logger.log(
      `Creating feedback for recipe ${createFeedbackDto.recipeId} by user ${userId}`,
    );

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado.`);
    }

    const recipe = await this.recipeRepository.findOneBy({
      id: createFeedbackDto.recipeId,
    });
    if (!recipe) {
      throw new NotFoundException(
        `Receta con ID "${createFeedbackDto.recipeId}" no encontrada.`,
      );
    }

    const existingFeedback = await this.feedbackRepository.findOne({
      where: {
        user: { id: userId },
        recipe: { id: createFeedbackDto.recipeId },
      },
    });

    if (existingFeedback) {
      // Actualizar feedback existente
      existingFeedback.rating = createFeedbackDto.rating;
      existingFeedback.comment = createFeedbackDto.comment;
      return this.feedbackRepository.save(existingFeedback);
    }

    // Crear nuevo feedback
    const feedback = this.feedbackRepository.create({
      rating: createFeedbackDto.rating,
      comment: createFeedbackDto.comment,
      user,
      recipe,
    });

    return this.feedbackRepository.save(feedback);
  }

  async getRecipeFeedback(recipeId: string): Promise<RecipeFeedback[]> {
    this.logger.log(`Getting feedback for recipe ${recipeId}`);
    return this.feedbackRepository.find({
      where: { recipe: { id: recipeId } },
      relations: ['user'],
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          id: true,
          name: true,
        },
      },
    });
  }

  async getAverageRating(recipeId: string): Promise<number> {
    const result = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('AVG(feedback.rating)', 'average')
      .where('feedback.recipe_id = :recipeId', { recipeId })
      .getRawOne();

    return result.average ? parseFloat(result.average) : 0;
  }
}
