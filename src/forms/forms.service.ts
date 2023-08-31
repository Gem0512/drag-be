import { Injectable } from '@nestjs/common';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { Form, FormDocument } from './schemas/form.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class FormsService {
  constructor(
    @InjectModel(Form.name) private formModel: SoftDeleteModel<FormDocument>,
  ) {}

  create(createFormDto: CreateFormDto, user: IUser) {
    return this.formModel.create({
      ...createFormDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.formModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.formModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} form`;
  }

  getItemById(id: string) {
    return this.formModel
      .findOne({
        _id: id,
      })
      .select('-password');
  }

  findFormByIdUser(id: string) {
    // return `This action returns a #${id} user`;
    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //   return `not found user`;
    // }
    return this.formModel
      .find({
        // createdBy: {
        //   _id: id,
        // },
        'createdBy._id': id,
      })
      .select('-password');
  }

  findFormByIdNoUser(id: string) {
    // return `This action returns a #${id} user`;
    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //   return `not found user`;
    // }
    return this.formModel
      .find({
        // createdBy: {
        //   _id: id,
        // },
        'createdBy._id': { $ne: id },
      })
      .select('-password');
  }

  async addOptionsToForm(formId: string, options: string[]) {
    try {
      console.log(options);
      const updatedForm = await this.formModel
        .findByIdAndUpdate(
          formId,
          { $push: { options: { $each: options } } },
          { new: true },
        )
        .exec();

      return updatedForm;
    } catch (error) {
      console.error('Error adding options to form:', error);
      return null;
    }
  }

  async addItemsToForm(formId: string, items: string[]) {
    try {
      console.log(items);
      const updatedForm = await this.formModel
        .findByIdAndUpdate(
          formId,
          // { $push: { items: { $each: items } } },
          { $set: { items: items } },
          { new: true },
        )
        .exec();

      return updatedForm;
    } catch (error) {
      console.error('Error adding items to form:', error);
      return null;
    }
  }

  async addObjectKeyValue(
    objectId: string,
    updateFormDto: UpdateFormDto,
    itemIndex: number,
    value: string,
  ) {
    await this.formModel.updateOne(
      { _id: objectId },
      {
        $set: {
          [`items.${itemIndex}.name`]: value,
        },
      },
    );
    const object = await this.formModel.findById(objectId);
    return object;
  }

  async getItemsByUserId(id: string) {
    return this.formModel.find({ options: id }).exec();
  }

  async update(id: string, updateFormDto: UpdateFormDto, user: IUser) {
    return await this.formModel.updateOne(
      { _id: id },
      {
        ...updateFormDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  async remove(id: string, user: IUser) {
    await this.formModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.formModel.softDelete({ _id: id });
  }

  async deleteItemByIndex(formId: string, itemIndex: number) {
    try {
      const form = await this.formModel.findById(formId);

      form.items.splice(itemIndex, 1); // Xóa phần tử tại index

      const updatedForm = await this.formModel.findByIdAndUpdate(formId, form, {
        new: true,
      });

      return updatedForm;
    } catch (error) {
      console.error('Error deleting item from form:', error);
      return null;
    }
  }
}
