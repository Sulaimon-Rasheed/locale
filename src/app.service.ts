import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class AppService {
  getHomePage(res:Response): object {
    return res.json({
      statusCode:200,
      message:"Welcome to Locale. We ensure you get detailed information about regions, states and local governments in Nigeria."
    })
  }
}
