import { Request, Response } from 'express';
import { BlogPostModel } from '../models/BlogPostModel';

export class BlogPostController {
    // Listar posts publicados (público)
    async listPublished(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 10;
            const page = parseInt(req.query.page as string) || 1;
            const skip = (page - 1) * limit;

            const posts = await BlogPostModel
                .find({ published: true })
                .sort({ publishedAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('title slug excerpt imageUrl tags publishedAt author.name');

            const total = await BlogPostModel.countDocuments({ published: true });

            res.json({
                posts,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            console.error('Erro ao listar posts:', error);
            res.status(500).json({ message: 'Erro ao buscar posts do blog' });
        }
    }

    // Buscar post por slug (público)
    async getBySlug(req: Request, res: Response) {
        try {
            const { slug } = req.params;

            const post = await BlogPostModel.findOne({
                slug,
                published: true,
            });

            if (!post) {
                return res.status(404).json({ message: 'Post não encontrado' });
            }

            res.json(post);
        } catch (error) {
            console.error('Erro ao buscar post:', error);
            res.status(500).json({ message: 'Erro ao buscar post' });
        }
    }

    // Criar post (apenas nutricionistas)
    async create(req: Request, res: Response) {
        try {
            const { title, slug, excerpt, content, imageUrl, tags, published } = req.body;
            const userId = (req as any).userId;
            const userName = (req as any).userName;

            const post = new BlogPostModel({
                title,
                slug,
                excerpt,
                content,
                imageUrl,
                tags,
                published,
                author: {
                    name: userName,
                    userId,
                },
                publishedAt: published ? new Date() : undefined,
            });

            await post.save();

            res.status(201).json({
                message: 'Post criado com sucesso',
                post,
            });
        } catch (error: any) {
            console.error('Erro ao criar post:', error);
            if (error.code === 11000) {
                return res.status(400).json({ message: 'Slug já existe' });
            }
            res.status(500).json({ message: 'Erro ao criar post' });
        }
    }

    // Atualizar post (apenas nutricionistas)
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { title, slug, excerpt, content, imageUrl, tags, published } = req.body;

            const post = await BlogPostModel.findById(id);

            if (!post) {
                return res.status(404).json({ message: 'Post não encontrado' });
            }

            // Se está publicando pela primeira vez, setar publishedAt
            if (published && !post.published) {
                post.publishedAt = new Date();
            }

            post.title = title || post.title;
            post.slug = slug || post.slug;
            post.excerpt = excerpt || post.excerpt;
            post.content = content || post.content;
            post.imageUrl = imageUrl || post.imageUrl;
            post.tags = tags || post.tags;
            post.published = published !== undefined ? published : post.published;

            await post.save();

            res.json({
                message: 'Post atualizado com sucesso',
                post,
            });
        } catch (error) {
            console.error('Erro ao atualizar post:', error);
            res.status(500).json({ message: 'Erro ao atualizar post' });
        }
    }

    // Deletar post (apenas nutricionistas)
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const post = await BlogPostModel.findByIdAndDelete(id);

            if (!post) {
                return res.status(404).json({ message: 'Post não encontrado' });
            }

            res.json({ message: 'Post deletado com sucesso' });
        } catch (error) {
            console.error('Erro ao deletar post:', error);
            res.status(500).json({ message: 'Erro ao deletar post' });
        }
    }
}
