import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type FormDocument = HydratedDocument<Form>;

@Schema({ timestamps: true })
export class Form {
  @Prop()
  name: string;

  @Prop({ type: [String] })
  options: string[];

  @Prop({ type: Object })
  items: [
    {
      id: string;
      type: string;
      text: string;
      number: number;
      name: string;
      position: {
        // Định dạng của trường position tùy thuộc vào yêu cầu của bạn
      };
    },
  ];

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop()
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}
export const FormSchema = SchemaFactory.createForClass(Form);
