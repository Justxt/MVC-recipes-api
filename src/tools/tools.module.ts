import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tool } from './entities/tool.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Tool])],
  exports: [TypeOrmModule],
})
export class ToolsModule {}
