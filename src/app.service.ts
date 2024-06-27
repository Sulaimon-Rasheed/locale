import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as dotenv from "dotenv"
dotenv.config()
import * as fs from "fs"

@Injectable()
export class AppService {

  private getFileExtension(): string {
    return process.env.NODE_ENV === 'production' ? 'js' : 'ts';
  }

  getHomePage(res:Response):any {
    const fileExtension = this.getFileExtension();
        const statesPath = `./src/DB/state.${fileExtension}`
        let allStates:any = fs.readFileSync(statesPath)
        let allStatesObj:object[] = JSON.parse(allStates)

        const theState:any = allStatesObj.find((state:any)=> {
          return state.name === "Plateau"
        } )

        if(!theState){
          return res.json({
            statusCode:404,
            error:"Opps!, State not found"
          })
        }
          return res.json({
            statusCode:200,
            message:"Welcome to Locale. Detailed information about regions, states and local governments in Nigeria are guaranteed here.Datas are updated time to time for reliability.",
            Note:"Sign up for our 'free tier' plan today. While datas might be limited, you can upgrade to our 'paid tier' plan for full datas of your requests as shown below.",
            ducumentation:`Read the full documentation at https://postman.locale.com to understand the use of the API for a seamless experience.`,
            full_datas_for_plateau_state_search:theState
          });
  }
}
