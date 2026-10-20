import {                                                                                                                         
  Body,                                                                                                                          
  Controller,                                                                                                                    
  Delete,                                                                                                                        
  Get,                                                                                                                           
  Param,                                                                                                                         
  ParseIntPipe,                                                                                                                  
  Patch,                                                                                                                         
  Post,                                                                                                                          
} from '@nestjs/common';                                                                                                         
import type { NewDevice } from '../database/schema/index.js';                                                                    
import { DeviceService } from './device.service.js';                                                                             
                                                                                                                                 
@Controller('device')                                                                                                            
export class DeviceController {                                                                                                  
  constructor(private readonly deviceService: DeviceService) {}                                                                  
                                                                                                                                 
  @Get() // GET http://localhost:3000/device                                                                                     
  findAll() {                                                                                                                    
    return this.deviceService.findAll();                                                                                         
  }                                                                                                                              
                                                                                                                                 
  @Get(':id') // GET http://localhost:3000/device/1                                                                              
  findOne(@Param('id', ParseIntPipe) id: number) {                                                                               
    return this.deviceService.findOne(id);                                                                                       
  }                                                                                                                              
                                                                                                                                 
  @Post() // POST http://localhost:3000/device                                                                                   
  create(@Body() body: NewDevice) {                                                                                              
    return this.deviceService.create(body);                                                                                      
  }                                                                                                                              
                                                                                                                                 
  @Patch(':id') // PATCH http://localhost:3000/device/1                                                                          
  update(                                                                                                                        
    @Param('id', ParseIntPipe) id: number,                                                                                       
    @Body() body: Partial<NewDevice>,                                                                                            
  ) {                                                                                                                            
    return this.deviceService.update(id, body);                                                                                  
  }                                                                                                                              
                                                                                                                                 
  @Delete(':id') // DELETE http://localhost:3000/device/1                                                                        
  remove(@Param('id', ParseIntPipe) id: number) {                                                                                
    return this.deviceService.remove(id);                                                                                        
  }                                                                                                                              
} 