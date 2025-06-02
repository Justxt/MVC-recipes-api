import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { RecipeFeedback } from './entities/recipe-feedback.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Recipe } from 'src/recipes/entities/recipe.entity'; 
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecipeFeedback, Recipe, User]),
    AuthModule,
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
