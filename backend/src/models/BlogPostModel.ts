import mongoose, { Schema, Document } from 'mongoose';

export interface IBlogPost extends Document {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    imageUrl?: string;
    author: {
        name: string;
        userId?: mongoose.Types.ObjectId;
    };
    tags: string[];
    published: boolean;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const BlogPostSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        excerpt: {
            type: String,
            required: true,
            maxlength: 200,
        },
        content: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
        },
        author: {
            name: {
                type: String,
                required: true,
            },
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        },
        tags: [{
            type: String,
            trim: true,
        }],
        published: {
            type: Boolean,
            default: false,
        },
        publishedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Índices para melhorar performance
BlogPostSchema.index({ slug: 1 });
BlogPostSchema.index({ published: 1, publishedAt: -1 });
BlogPostSchema.index({ tags: 1 });

export const BlogPostModel = mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
