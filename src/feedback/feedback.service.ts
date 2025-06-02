import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecipeFeedback } from './entities/recipe-feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { User } from 'src/users/entities/user.entity';
import { Recipe } from 'src/recipes/entities/recipe.entity';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    @InjectRepository(RecipeFeedback)
    private readonly feedbackRepository: Repository<RecipeFeedback>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
  ) {}

  async createFeedback(
    userId: string,
    recipeId: string, // Added recipeId as a parameter
    createFeedbackDto: CreateFeedbackDto,
  ): Promise<RecipeFeedback> {
    this.logger.log(
      `Creating feedback for recipe ${recipeId} by user ${userId}`, // Use recipeId from parameter
    );

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado.`);
    }

    const recipe = await this.recipeRepository.findOneBy({
      id: recipeId, // Use recipeId from parameter
    });
    if (!recipe) {
      throw new NotFoundException(
        `Receta con ID "${recipeId}" no encontrada.`, // Use recipeId from parameter
      );
    }

    const existingFeedback = await this.feedbackRepository.findOne({
      where: {
        user: { id: userId },
        recipe: { id: recipeId }, // Use recipeId from parameter
      },
    });

    if (existingFeedback) {
      // Actualizar feedback existente
      existingFeedback.rating = createFeedbackDto.rate; // Changed to rate
      existingFeedback.comment = createFeedbackDto.comment;
      return this.feedbackRepository.save(existingFeedback);
    }

    // Crear nuevo feedback
    const feedback = this.feedbackRepository.create({
      rating: createFeedbackDto.rate, // Changed to rate
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
