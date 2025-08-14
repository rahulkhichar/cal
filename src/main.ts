import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') ?? 3000;

  console.log(`Server is running on port ${port}`);
  console.log(`Server is running on port http://localhost:${port}`);
  await app.listen(port);
}

bootstrap();
