import axios from 'axios';
import * as dotenv from "dotenv"
import { Response } from 'express';
dotenv.config()

export class CurrencyService {
    private readonly apiKey = process.env.EXCHANGE_KEY;
  
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