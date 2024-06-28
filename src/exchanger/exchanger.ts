import axios from 'axios';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CurrencyService {
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('EXCHANGE_KEY');
  }
  
    async getExchangeRate(res:Response): Promise<any> {
      try {
        const response = await axios.get(`https://openexchangerates.org/api/latest.json?app_id=${this.apiKey}`);
        const exchangeRates = response.data.rates;
        return exchangeRates['NGN']; 
      } catch (err) {
        return res.status(500).json({
            statusCode:500,
            message:err.meessage
        })
      }
    }
  
    convertDollarToNaira(amountInDollar: number, exchangeRate: number): number {
      return Math.round(amountInDollar * exchangeRate);
    }
  }