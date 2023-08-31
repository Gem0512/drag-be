import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post('createForm')
  create(@Body() createFormDto: CreateFormDto, @User() user: IUser) {
    console.log('Thông tin User tạo:', user);
    return this.formsService.create(createFormDto, user);
  }

  @Get('getForm')
  @ResponseMessage('Fetch list form')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.formsService.findAll(+currentPage, +limit, qs);
  }

  @Get('getFormById/:id')
  async getItemById(@Param('id') id: string) {
    const item = await this.formsService.getItemById(id);
    return item;
  }

  @Get('byUser/:id')
  findAllFormByIdUser(@Param('id') id: string) {
    return this.formsService.findFormByIdUser(id);
  }

  @Post('options/:formId')
  async addOptionsToForm(
    @Param('formId') formId: string,
    @Body('options') options: string[],
  ) {
    console.log(options);
    const updatedForm = await this.formsService.addOptionsToForm(
      formId,
      options,
    );

    if (!updatedForm) {
      return { success: false, message: 'Failed to add options to the form.' };
    }

    return { success: true, updatedForm };
  }

  @Post('items/:formId')
  async addItemsToForm(
    @Param('formId') formId: string,
    @Body('items') items: string[],
  ) {
    console.log('<<<<<<<', items, formId);
    const updatedForm = await this.formsService.addItemsToForm(formId, items);

    if (!updatedForm) {
      return { success: false, message: 'Failed to add items to the form.' };
    }

    return { success: true, updatedForm };
  }

  @Patch(':id/items/:index/addKeyValue')
  async addKeyValueToItem(
    @Param('id') objectId: string,
    @Param('index') itemIndex: number,
    @Body() updateFormDto: UpdateFormDto,
    @Body('value') value: string,
  ) {
    return this.formsService.addObjectKeyValue(
      objectId,
      updateFormDto,
      itemIndex,
      value,
    );
  }

  @Get('/getItemsByUserId/:id')
  async getItemsByUserId(@Param('id') id: string) {
    const items = await this.formsService.getItemsByUserId(id);
    return items;
  }

  @Get('byNoUser/:id')
  findAllFormByIdNoUser(@Param('id') id: string) {
    return this.formsService.findFormByIdNoUser(id);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateFormDto: UpdateFormDto,
    @User() user: IUser,
  ) {
    return this.formsService.update(id, updateFormDto, user);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.formsService.remove(id, user);
  }

  @Delete(':formId/items/:itemIndex')
  async deleteItemByIndex(
    @Param('formId') formId: string,
    @Param('itemIndex') itemIndex: number,
  ) {
    try {
      const updatedForm = await this.formsService.deleteItemByIndex(
        formId,
        itemIndex,
      );
      return updatedForm;
    } catch (error) {
      throw error;
    }
  }
}
