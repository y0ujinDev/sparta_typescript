import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PerformanceModule } from './performance/performance.module';

@Module({
  imports: [UserModule, PerformanceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
