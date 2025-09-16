import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

// Import DTOs using require for type-only imports that need to work with decorators
const CreateUserDto = require('./dto/create-user.dto').CreateUserDto;
const UpdateUserDto = require('./dto/update-user.dto').UpdateUserDto;
const LoginDto = require('./dto/login.dto').LoginDto;
const RefreshTokenDto = require('./dto/refresh-token.dto').RefreshTokenDto;
const UpdatePreferencesDto = require('./dto/update-preferences.dto').UpdatePreferencesDto;
const ChangePasswordDto = require('./dto/change-password.dto').ChangePasswordDto;
const RequestResetPasswordDto = require('./dto/reset-password.dto').RequestResetPasswordDto;
const ResetPasswordDto = require('./dto/reset-password.dto').ResetPasswordDto;

// Import types
import type { RequestWithUser } from './types/user-controller.types';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user', description: 'Creates a new user with the provided information' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Successfully created user' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  create(@Body() createUserDto: typeof CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users', description: 'Retrieves a list of all users' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully retrieved users' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID', description: 'Retrieves a user by their ID' })
  @ApiParam({ name: 'id', description: 'The ID of the user to retrieve' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully retrieved user' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user', description: 'Updates a user with the provided information' })
  @ApiParam({ name: 'id', description: 'The ID of the user to update' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully updated user' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: typeof UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user', description: 'Deletes a user by their ID' })
  @ApiParam({ name: 'id', description: 'The ID of the user to delete' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Successfully deleted user' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login to the application', description: 'Logs in a user with the provided credentials' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully logged in' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  async login(@Body() loginDto: typeof LoginDto) {
    return this.userService.login(loginDto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token', description: 'Uses a refresh token to get a new access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Successfully refreshed token' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: typeof RefreshTokenDto) {
    return this.userService.refreshToken(refreshTokenDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile', description: 'Retrieves the profile of the currently authenticated user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully retrieved user profile' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getProfile(@Request() req: RequestWithUser) {
    return this.userService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user (alias for /profile)', description: 'Alias for /profile endpoint' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully retrieved user' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getCurrentUser(@Request() req: RequestWithUser) {
    return this.userService.getCurrentUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('preferences')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user preferences', description: 'Updates the preferences of the authenticated user' })
  @ApiBody({ type: UpdatePreferencesDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully updated preferences' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async updatePreferences(
    @Request() req: RequestWithUser,
    @Body() updatePreferencesDto: typeof UpdatePreferencesDto
  ) {
    return this.userService.updatePreferences(req.user.id, updatePreferencesDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change user password', description: 'Changes the password of the authenticated user' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully changed password' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async changePassword(
    @Request() req: RequestWithUser,
    @Body() changePasswordDto: typeof ChangePasswordDto
  ) {
    return this.userService.changePassword(req.user.id, changePasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Request password reset', description: 'Sends a password reset email to the user' })
  @ApiBody({ type: RequestResetPasswordDto })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Password reset email sent if account exists' })
  async requestPasswordReset(@Body() requestResetPasswordDto: typeof RequestResetPasswordDto) {
    return this.userService.requestPasswordReset(requestResetPasswordDto.email);
  }

  @Post('reset-password/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password', description: 'Resets the user\'s password using a valid token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Password successfully reset' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: typeof ResetPasswordDto) {
    return this.userService.resetPassword(resetPasswordDto);
  }
}
