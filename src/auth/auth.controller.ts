import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

import { CreateUserDto } from './dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginRequestDto, LoginResponseDto } from './dto/login.dto';
import { Public } from '../decorators/public.decorator';
import { RequestWithUser, validationPipeOptions } from '../types';
import { VerifyDto } from './dto/verify.dto';

import { AuthService } from './auth.service';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';

@ApiTags('auth')
@UsePipes(new ValidationPipe(validationPipeOptions))
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({ type: LoginResponseDto })
  @Post('/login')
  async login(@Request() request: RequestWithUser) {
    this.logger.debug(`New login: ${request.user?.email}`);
    return this.authService.login(request.user);
  }

  @Public()
  @Post('/signup')
  async signUp(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ message: string }> {
    const verifyToken = uuidv4();
    const createdUser = await this.authService.signUp(
      createUserDto,
      verifyToken,
    );
    const { email } = createdUser;
    await this.mailService.sendEmail({
      toEmail: email,
      subject: 'Verify your email',
      content: this.mailService.generateVerifyMailContent(email, verifyToken),
    });
    return { message: 'User has been successfully created.' };
  }

  @Public()
  @Post('/verify')
  async verify(@Body() verifyDto: VerifyDto): Promise<{ message: string }> {
    const { email, token } = verifyDto;
    await this.usersService.verifyToken(email, token);
    return { message: 'User has been successfully verified.' };
  }
}
