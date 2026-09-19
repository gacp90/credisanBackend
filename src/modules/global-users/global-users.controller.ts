import { Controller, Post, Body, Put, UseGuards, Param } from '@nestjs/common';
import { GlobalUsersService } from './global-users.service';
import { CreateGlobalUserDto } from './dto/create-global-user.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('global-users')
export class GlobalUsersController {
  constructor(private readonly globalUsersService: GlobalUsersService) {}

  // Endpoint: POST /api/v1/global-users
  @Post()
  async create(@Body() createGlobalUserDto: CreateGlobalUserDto) {
    return this.globalUsersService.create(createGlobalUserDto);
  }

  @Put('profile/:id')
  @UseGuards(JwtAuthGuard) // Protegido con JWT
  async updateProfile(@Param('id') id: string, @Body() updateData: any) {
    return this.globalUsersService.updateProfile(id, updateData);
  }
  
}