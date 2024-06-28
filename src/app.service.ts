import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import states, { State } from "src/DB/state"

@Injectable()
export class AppService {
  getHomePage(res:Response):any {
        const theState:State = states.find((state:any)=> {
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
