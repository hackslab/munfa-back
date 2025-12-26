import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 3030;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());
  app.enableCors({
    origin: true, // Adjust in production
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });
  await app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
}

bootstrap();
