import { IsNotEmpty, IsNumber, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class checkNumberDto {
    @IsString()
    @IsNotEmpty()
    phone: string;
}

export class sendOtpDto {
    @IsString()
    @IsNotEmpty()
    phone: string;
}

export class verifyOtpDto {
    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsNumber()
    @IsNotEmpty()
    otp: number;
}

export class setPasswordDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}

export class setNameDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}

export class loginDto {
    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}