import { Model } from 'mongoose';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createCanvas } from 'canvas';

import { CreateUserDto } from '../auth/dto/create-user.dto';
import { Role } from '../types';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findOneByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async createUser(
    user: CreateUserDto,
    verifyToken: string,
    profilePic: Buffer,
  ) {
    const { email, password, name } = user;
    return this.userModel.create({
      email,
      name,
      password,
      verifyToken,
      profilePic,
      roles: [Role.user],
    });
  }

  async verifyToken(email: string, token: string) {
    const foundUser = await this.userModel.findOne({ email });
    if (!foundUser) {
      throw new NotFoundException('User not found!');
    }
    if (foundUser.verifyToken !== token) {
      throw new ConflictException("Token doesn't match our records");
    }
    foundUser.verifyToken = undefined;
    await foundUser.save();
    return foundUser;
  }

  generateProfilePic(name: string) {
    let initials = '';
    const words = name.trim().split(' ');
    initials =
      words.length === 1
        ? words[0].charAt(0).toUpperCase()
        : words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
    const canvas = createCanvas(256, 256);
    const context = canvas.getContext('2d');

    // set background color
    context.fillStyle = '#bc6c25';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // set text style
    context.font = Math.round(canvas.height / 2) + 'px Helvetica Neue bold';
    context.fillStyle = '#F7F7E8';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    context.fillText(
      initials.toUpperCase(),
      canvas.width / 2,
      canvas.height / 2,
    );

    const dataUrl = canvas.toDataURL();
    return Buffer.from(dataUrl.split(',')[1], 'base64');
  }
}
